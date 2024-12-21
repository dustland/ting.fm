import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  baseURL: "https://oai.helicone.ai/v1",
  headers: {
    "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
    "Helicone-User-Id": "talk@dustland.ai", // TODO: change this to the user's ID
    "Helicone-Property-App": "talk",
    "Helicone-Stream-Usage": "true",
  },
});

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const { messages, format = "text", podcastOptions } = await req.json();
  console.log("messages:", messages);
  console.log("format:", format);
  console.log("podcastOptions:", podcastOptions);

  // Define podcast script generation parameters
  const defaultPodcastOptions = {
    duration: 15, // Default 15 minutes
    style: "conversational",
    hosts: {
      host1: { gender: "male", personality: "专业、富有见识" },
      host2: { gender: "female", personality: "活泼、亲和力强" },
    },
  };

  const finalPodcastOptions = { ...defaultPodcastOptions, ...podcastOptions };

  // Request the OpenAI API for the response
  const result = await streamText({
    model: openai("gpt-4o"),
    messages: [
      {
        role: "system",
        content:
          format === "podcast"
            ? `你是一位专业的播客脚本策划师，善于将文章内容转换为生动的播客脚本。
请创建一个约${finalPodcastOptions.duration}分钟的播客脚本，采用双人对话形式：
- 男主持人：${finalPodcastOptions.hosts.host1.personality}
- 女主持人：${finalPodcastOptions.hosts.host2.personality}

脚本格式要求：
1. 每句对话必须以 [[host1]] 或 [[host2]] 开头，以 ]] 结尾
2. 表情和动作要放在方括号内，如 [笑] [思考]
3. 示例：
   [[host1]]大家好，今天我们要讨论一个很有意思的话题 [微笑]][]
   [[host2]]是的，这个话题最近很火呢 [点头赞同]][]

请确保内容：
- 通俗易懂，避免过于专业的术语
- 有趣且富有启发性
- 符合播客时长要求
- 语言自然，符合口语表达`
            : "你是一位AI助手，可以帮助用户处理各种问题。",
      },
      ...messages,
    ],
    temperature: 0.7,
    maxTokens: 4000,
  });

  // Return the streaming response
  return result.toDataStreamResponse();
}
