import { NextResponse } from "next/server";
import OpenAI from "openai";
import { uploadBuffer } from "@/lib/supabase/server";
import { nanoid } from "nanoid";
import { PodcastHost } from "@/store/setting";
import { getVoiceForProvider } from "@/lib/voice-mapping";

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

    const { text, host, settings } = await request.json();

    console.log("[TTS] Received request:", {
      text,
      host,
      settings: JSON.stringify(settings) || settings,
    });

    if (!text || !host) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    let audioBuffer: ArrayBuffer;
    const ttsModel = settings?.ttsModel || "openai";

    // Find host configuration
    const hostConfig = settings?.hosts?.find(
      (h: PodcastHost) => h.name === host
    );
    if (!hostConfig) {
      return NextResponse.json(
        { error: "Host configuration not found" },
        { status: 400 }
      );
    }

    console.log("[TTS] Using host configuration:", JSON.stringify(hostConfig));

    // Get voice for current TTS provider
    const voice = getVoiceForProvider(hostConfig.voiceId, ttsModel);
    if (!voice) {
      return NextResponse.json(
        { error: `No voice mapping found for provider ${ttsModel}` },
        { status: 400 }
      );
    }

    console.log(
      "[TTS] Using voice:",
      voice,
      "for host:",
      host,
      "with model:",
      ttsModel
    );

    switch (ttsModel) {
      case "openai":
        audioBuffer = await generateOpenAITTS(text, voice);
        break;
      case "doubao":
        audioBuffer = await generateDoubaoTTS(text, voice);
        break;
      case "tongyi":
        audioBuffer = await generateTongyiTTS(text, voice);
        break;
      case "elevenlabs":
        audioBuffer = await generateElevenLabsTTS(text, voice);
        break;
      default:
        return NextResponse.json(
          { error: "Unsupported TTS model" },
          { status: 400 }
        );
    }

    const buffer = Buffer.from(audioBuffer);
    const filename = `${nanoid()}.mp3`;
    const { url } = await uploadBuffer(buffer, filename, "audio/mpeg");

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
  voice: string
): Promise<ArrayBuffer> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const mp3 = await retryWithExponentialBackoff(async () => {
    return await openai.audio.speech.create({
      model: "tts-1",
      voice: voice as any,
      input: text,
    });
  });

  return mp3.arrayBuffer();
}

async function generateDoubaoTTS(
  text: string,
  voice: string
): Promise<ArrayBuffer> {
  // TODO: Implement 豆包 TTS
  throw new Error("豆包 TTS not implemented yet");
}

async function generateTongyiTTS(
  text: string,
  voice: string
): Promise<ArrayBuffer> {
  // TODO: Implement 通义 TTS
  throw new Error("通义 TTS not implemented yet");
}

async function generateElevenLabsTTS(
  text: string,
  voice: string
): Promise<ArrayBuffer> {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error("ElevenLabs API key not configured");
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice}/stream`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        output_format: "mp3_44100_128",
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    console.error("[ElevenLabs] Error:", error);
    throw new Error("Failed to generate audio with ElevenLabs");
  }

  return await response.arrayBuffer();
}
