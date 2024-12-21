import { NextResponse } from "next/server";
import OpenAI from "openai";
import { bufferToFile, uploadFile } from "@/lib/supabase/client";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { text, voice } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice || "nova",
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    const filename = `${nanoid()}.mp3`;
    const file = bufferToFile(buffer, filename, "audio/mpeg");
    
    const attachment = await uploadFile(file, "audio");

    return NextResponse.json({
      url: attachment.url,
      contentType: attachment.contentType,
      name: attachment.name,
    });
  } catch (error) {
    console.error("Error in TTS API:", error);
    return NextResponse.json(
      { error: "Failed to generate audio" },
      { status: 500 }
    );
  }
}
