import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received request body:", body);

    const { podId, segments } = body;
    
    if (!podId || !segments || !Array.isArray(segments)) {
      return NextResponse.json(
        { error: "Invalid request: podId and segments array are required" },
        { status: 400 }
      );
    }

    if (segments.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: segments array cannot be empty" },
        { status: 400 }
      );
    }

    // Validate each segment
    for (const segment of segments) {
      if (!segment.url || typeof segment.duration !== 'number') {
        return NextResponse.json(
          { error: "Invalid segment: each segment must have url and duration" },
          { status: 400 }
        );
      }
    }

    const supabase = await createServiceClient();
    console.log("Calling merge-audio function with:", { podId, segments });

    // Call Supabase Edge Function to merge audio
    const { data, error } = await supabase.functions.invoke("merge-audio", {
      body: { podId, segments },
    });

    if (error) {
      console.error("Supabase function error:", error);
      throw error;
    }

    console.log("Merge function response:", data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error merging audio:", error);
    return NextResponse.json(
      { error: error.message || "Failed to merge audio files" },
      { status: 500 }
    );
  }
}
