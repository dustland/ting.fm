import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory path of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../../../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMergeAudio() {
  // First, let's verify the files exist
  console.log("Checking if audio files exist...");
  const files = ["0dp5ih3EXlsUKH2mjFkMJ.mp3", "0bgQudBxoXh8PX5vcj7-G.mp3"];

  for (const file of files) {
    const { data, error } = await supabase.storage.from("audio").list("", {
      limit: 100,
      search: file,
    });

    if (error) {
      console.error(`Error checking file ${file}:`, error);
      process.exit(1);
    }

    console.log(`Files matching ${file}:`, data);
  }

  // These should be actual paths to audio files in your 'audio' bucket
  const testData = {
    podId: "test-pod-1",
    segments: [
      {
        url: "0dp5ih3EXlsUKH2mjFkMJ.mp3",
        duration: 10,
      },
      {
        url: "0bgQudBxoXh8PX5vcj7-G.mp3",
        duration: 15,
      },
    ],
  };

  try {
    console.log("Testing merge-audio function with data:", testData);
    const response = await fetch(`${supabaseUrl}/functions/v1/merge-audio`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    const responseText = await response.text();
    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    try {
      const data = JSON.parse(responseText);
      console.log("Response data:", data);
    } catch (e) {
      console.log("Raw response:", responseText);
    }

    if (!response.ok) {
      throw new Error(
        `Function returned status ${response.status}: ${responseText}`
      );
    }
  } catch (error) {
    console.error("Error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    process.exit(1);
  }
}

testMergeAudio();
