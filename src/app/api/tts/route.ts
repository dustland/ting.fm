import { NextResponse } from "next/server";
import OpenAI from "openai";
import { bufferToFile, uploadFile } from "@/lib/supabase/client";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  try {
    console.log("TTS API: Starting request");

    if (!process.env.OPENAI_API_KEY) {
      console.error("TTS API: OpenAI API key not configured");
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { text, voice } = await request.json();
    console.log("TTS API: Received request", {
      textLength: text?.length,
      voice,
    });

    if (!text) {
      console.error("TTS API: Text is required");
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    console.log("TTS API: Calling OpenAI speech API");
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice || "nova",
      input: text,
    });
    console.log("TTS API: OpenAI speech generation successful");

    const buffer = Buffer.from(await mp3.arrayBuffer());
    console.log("TTS API: Converted response to buffer");
    
    const filename = `${nanoid()}.mp3`;
    const file = bufferToFile(buffer, filename, "audio/mpeg");
    console.log("TTS API: Created file object", { filename });

    console.log("TTS API: Starting file upload");
    const attachment = await uploadFile(file, "audio");
    console.log("TTS API: File upload successful", { url: attachment.url });

    return NextResponse.json({
      url: attachment.url,
      contentType: attachment.contentType,
      name: attachment.name,
    });
  } catch (error: any) {
    console.error("TTS API: Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: "Failed to generate audio", details: error.message },
      { status: 500 }
    );
  }
}
