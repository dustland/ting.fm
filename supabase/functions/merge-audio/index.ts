import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AudioSegment {
  url: string;
  duration: number;
}

function errorResponse(message: string, status = 500) {
  console.error(`Error: ${message}`);
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { podId, segments } = await req.json();
    console.log("Received request:", { podId, segments });

    if (!podId || !segments || !Array.isArray(segments)) {
      return errorResponse(
        "Invalid request parameters: podId and segments array are required",
        400
      );
    }

    // Create Supabase client with environment variables
    const supabaseUrl = Deno.env.get("NEXT_PUBLIC_SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      return errorResponse("Supabase environment variables are missing");
    }

    console.log("Initializing Supabase client with URL:", supabaseUrl);
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    console.log("Downloading audio segments...");
    const audioBuffers: Uint8Array[] = [];
    for (const segment of segments) {
      console.log("Processing segment:", segment.url);

      try {
        // Check if the file exists before downloading
        const { data: files, error: listError } = await supabaseClient.storage
          .from("audio")
          .list("", {
            limit: 1,
            search: segment.url,
          });

        if (listError) {
          console.error("List error:", listError);
          return errorResponse(
            `Failed to verify segment existence: ${listError.message}`
          );
        }

        if (!files || files.length === 0) {
          return errorResponse(`File not found: ${segment.url}`);
        }

        console.log("File exists:", files[0]);

        // Download file from Supabase Storage
        const { data: fileData, error: downloadError } =
          await supabaseClient.storage.from("audio").download(segment.url);

        if (downloadError) {
          console.error("Download error:", downloadError);
          return errorResponse(
            `Failed to download segment: ${downloadError.message}`
          );
        }

        if (!fileData) {
          return errorResponse("No data received from download");
        }

        const arrayBuffer = await fileData.arrayBuffer();
        console.log(
          "Successfully got array buffer of size:",
          arrayBuffer.byteLength
        );
        audioBuffers.push(new Uint8Array(arrayBuffer));
        console.log("Successfully downloaded segment:", segment.url);
      } catch (error) {
        console.error("Error processing segment:", error);
        return errorResponse(
          `Error processing segment ${segment.url}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    console.log("Merging audio segments...");
    const mergedBuffer = new Uint8Array(
      audioBuffers.reduce((acc, curr) => acc + curr.length, 0)
    );
    let offset = 0;
    for (const buffer of audioBuffers) {
      mergedBuffer.set(buffer, offset);
      offset += buffer.length;
    }

    const mergedFileName = `merged/${podId}_${Date.now()}.mp3`;
    console.log("Uploading merged audio as:", mergedFileName);

    const { error: uploadError } = await supabaseClient.storage
      .from("audio")
      .upload(mergedFileName, mergedBuffer, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (uploadError) {
      return errorResponse(
        `Failed to upload merged audio: ${uploadError.message}`
      );
    }

    // Get the public URL using the Supabase client
    const { data: { publicUrl } } = supabaseClient.storage
      .from('audio')
      .getPublicUrl(mergedFileName);

    console.log("Successfully merged and uploaded:", {
      url: mergedFileName,
      publicUrl,
    });

    return new Response(
      JSON.stringify({ url: mergedFileName, publicUrl }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    if (error instanceof Error) {
      console.error("Error stack:", error.stack);
    }
    return errorResponse("Unexpected error occurred", 500);
  }
});
