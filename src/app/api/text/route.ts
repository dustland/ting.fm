import { NextRequest } from "next/server";

export interface TextToScriptRequest {
  text: string;
  settings?: {
    outputLanguage: string;
    hostStyle: string;
    llmModel: string;
    ttsModel: string;
    characters: Array<{
      name: string;
      title: string;
      gender: "男性" | "女性";
      voice?: string;
    }>;
  };
}

export interface TextToScriptResponse {
  id: string;
  script: Array<{
    role: string;
    content: string;
  }>;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TextToScriptRequest;

    // TODO: Get settings from user's preferences if not provided
    const settings = body.settings || {
      outputLanguage: "zh",
      hostStyle: "默认风格",
      llmModel: "Qwen2.5 72B",
      ttsModel: "Doubao TTS",
      characters: [
        {
          name: "主持人",
          title: "AI 播客主持人",
          gender: "男性",
        },
      ],
    };

    // TODO: Replace with actual AI processing
    // This is just a mock response for now
    const response: TextToScriptResponse = {
      id: "test-" + Date.now(),
      script: [
        {
          role: "主持人",
          content: "大家好，欢迎收听本期播客。今天我们要讨论一个很有趣的话题。",
        },
        {
          role: "主持人",
          content: body.text.slice(0, 100) + "...",
        },
        {
          role: "主持人",
          content: "感谢收听，我们下期再见。",
        },
      ],
    };

    return Response.json(response);
  } catch (error) {
    console.error("Error processing text:", error);
    return Response.json(
      { error: "处理文本时发生错误" },
      { status: 500 }
    );
  }
}
