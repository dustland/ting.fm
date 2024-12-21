import { streamText } from "ai";
import { openai, createOpenAI } from "@ai-sdk/openai";
import { PodcastSettings } from "@/store/setting";

// Create an OpenAI API client (configured with OPENAI_API_KEY env var)
// const openai = createOpenAI({
//   baseURL: "https://oai.helicone.ai/v1",
//   apiKey: process.env.OPENAI_API_KEY,
//   headers: {
//     "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
//     "Helicone-User-Id": "tingfm@dustland.ai", // TODO: change this to the user's ID
//     "Helicone-Property-App": "tingfm",
//     "Helicone-Stream-Usage": "true",
//   },
// });

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

export async function POST(req: Request) {
  try {
    // Extract the `messages` from the body of the request
    const { messages, format = "text", podcastOptions } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Define podcast script generation parameters
    const defaultPodcastOptions: PodcastSettings = {
      duration: 15, // Default 15 minutes
      style: "conversational",
      hosts: [
        {
          id: "host1",
          name: "奥德彪",
          gender: "male",
          personality: "专业、富有见识",
        },
        {
          id: "host2",
          name: "小美",
          gender: "female",
          personality: "活泼、亲和力强",
        },
      ],
    };

    const finalPodcastOptions: PodcastSettings = {
      ...defaultPodcastOptions,
      ...podcastOptions,
    };

    if (format === "podcast") {
      // Generate the podcast script
      const result = streamText({
        model: openai("gpt-4o"),
        messages: [
          {
            role: "system",
            content: `你是一位专业的Pod脚本策划师，善于将文章内容转换为生动的Pod脚本。

请创建一个约${finalPodcastOptions.duration}分钟的Pod脚本，采用${
              finalPodcastOptions.hosts.length
            }人对话形式：
${finalPodcastOptions.hosts
  .map(
    (host) =>
      `- ${host.name}（${host.gender === "male" ? "男" : "女"}主持人）：${
        host.personality
      }`
  )
  .join("\n")}

脚本格式要求：
1. 每句对话必须以 ${finalPodcastOptions.hosts
              .map((h) => `[[${h.id}]]`)
              .join(" 或 ")} 开头，以 ]] 结尾
2. 表情和动作要放在方括号内，如 [笑] [思考]
3. 示例：
   [[host1]]大家好，我是${
     finalPodcastOptions.hosts[0].name
   }，今天我们要讨论一个很有意思的话题 [微笑]]
   [[host2]]我是${
     finalPodcastOptions.hosts[1].name
   }，这个话题最近很火呢 [点头赞同]]

请确保内容：
- 通俗易懂，避免过于专业的术语
- 有趣且富有启发性
- 符合Pod时长要求（每分钟约150-200字）
- 语言自然，符合口语表达
- 主持人要互相用名字称呼，增加亲切感
- 适当加入表情和动作描述，让对话更生动
- 合理安排内容节奏，让讨论循序渐进`,
          },
          ...messages,
        ],
        temperature: 0.7,
      });

      return result.toDataStreamResponse();
    } else {
      // Handle regular chat
      const result = streamText({
        model: openai("gpt-4o"),
        messages: [
          {
            role: "system",
            content: "你是一位AI助手，可以帮助用户处理各种问题。",
          },
          ...messages,
        ],
        temperature: 0.7,
        maxTokens: 4000,
      });

      return result.toDataStreamResponse();
    }
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
