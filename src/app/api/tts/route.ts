import { NextResponse } from "next/server";
import OpenAI from "openai";
import { bufferToFile, uploadFile } from "@/lib/supabase/server";
import { nanoid } from "nanoid";
import { PodcastHost } from "@/store/setting";

const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1 second

async function retryWithExponentialBackoff<T>(
  fn: () => Promise<T>
): Promise<T> {
  let delay = INITIAL_DELAY;

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === MAX_RETRIES - 1) throw error;

      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }

  throw new Error("Max retries exceeded");
}

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const { text, host, ttsModel } = await request.json();

    if (!text || !host) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    let audioBuffer: ArrayBuffer;

    switch (ttsModel) {
      case "openai":
        audioBuffer = await generateOpenAITTS(text, host);
        break;
      case "doubao":
        audioBuffer = await generateDoubaoTTS(text, host);
        break;
      case "tongyi":
        audioBuffer = await generateTongyiTTS(text, host);
        break;
      case "elevenlabs":
        audioBuffer = await generateElevenLabsTTS(text, host);
        break;
      default:
        return NextResponse.json(
          { error: "Unsupported TTS model" },
          { status: 400 }
        );
    }

    const buffer = Buffer.from(audioBuffer);
    const filename = `${nanoid()}.mp3`;
    const file = await bufferToFile(buffer, filename, "audio/mpeg");
    const { url } = await uploadFile(file, "audio");

    if (!url) {
      console.error("[TTS] Upload error:", url);
      return NextResponse.json(
        { error: "Failed to upload audio file" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url });
  } catch (error) {
    console.error("[TTS] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate audio" },
      { status: 500 }
    );
  }
}

async function generateOpenAITTS(
  text: string,
  host: PodcastHost
): Promise<ArrayBuffer> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  console.log("[TTS] Calling OpenAI speech API");
  const mp3 = await retryWithExponentialBackoff(async () => {
    return await openai.audio.speech.create({
      model: "tts-1",
      voice: host.gender === "male" ? "onyx" : "nova",
      input: text,
    });
  });
  console.log("[TTS] OpenAI speech generation successful");

  return await mp3.arrayBuffer();
}

async function generateDoubaoTTS(
  text: string,
  host: PodcastHost
): Promise<ArrayBuffer> {
  // TODO: Implement 豆包 TTS
  throw new Error("豆包 TTS not implemented yet");
}

async function generateTongyiTTS(
  text: string,
  host: PodcastHost
): Promise<ArrayBuffer> {
  // TODO: Implement 通义 TTS
  throw new Error("通义 TTS not implemented yet");
}

async function generateElevenLabsTTS(
  text: string,
  host: PodcastHost
): Promise<ArrayBuffer> {
  // TODO: Implement ElevenLabs TTS
  throw new Error("ElevenLabs TTS not implemented yet");
}
