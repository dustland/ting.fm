import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
// Create an OpenAI API client (configured with OPENAI_API_KEY env var)
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const { messages, format = "text" } = await req.json();

  // Request the OpenAI API for the response
  const response = await streamText({
    model: openai("gpt-4o"),
    messages: [
      {
        role: "system",
        content:
          format === "podcast"
            ? "你是一位专业的播客主持人，善于将文章内容转换为自然、生动的播客脚本。请以对话的形式输出，使用简单易懂的语言，加入适当的语气词和过渡词，让内容更有趣味性。"
            : "你是一位AI助手，可以帮助用户处理各种问题。",
      },
      ...messages,
    ],
    temperature: 0.7,
    maxTokens: 4000,
  });

  // Return the streaming response
  return response.toDataStream();
}
