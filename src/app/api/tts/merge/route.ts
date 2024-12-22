import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/supabase/client";

export async function POST(request: Request) {
  try {
    const { audioUrls } = await request.json();

    // Download all audio files
    const audioBuffers = await Promise.all(
      audioUrls.map(async (url: string) => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to download audio from ${url}`);
        }
        return response.arrayBuffer();
      })
    );

    // Concatenate audio buffers
    const totalLength = audioBuffers.reduce(
      (acc, buffer) => acc + buffer.byteLength,
      0
    );
    const mergedBuffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const buffer of audioBuffers) {
      mergedBuffer.set(new Uint8Array(buffer), offset);
      offset += buffer.byteLength;
    }

    // Create a Blob from the merged buffer
    const blob = new Blob([mergedBuffer], { type: "audio/mp3" });
    const file = new File([blob], "merged.mp3", { type: "audio/mp3" });

    // Upload merged file
    const url = await uploadFile(file, "audio");

    return NextResponse.json({ url });
  } catch (error) {
    console.error("[MERGE_AUDIO_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to merge audio files" },
      { status: 500 }
    );
  }
}
