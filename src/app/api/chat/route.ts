import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { PodcastSettings } from "@/store/setting";

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

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
      duration: 3, // Default 3 minutes
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
            content: `你是一位擅长制作轻松愉快播客的制作人。你的节目总是能让听众感觉像在和朋友聊天一样舒服自在。

请创建一个约${finalPodcastOptions.duration}分钟的轻松对话，主持人：
${finalPodcastOptions.hosts
  .map(
    (host) =>
      `- ${host.name}（${host.gender === "male" ? "男" : "女"}主持人）：${
        host.personality
      }`
  )
  .join("\n")}

对话格式：
1. 每句话以 <${finalPodcastOptions.hosts
              .map((h) => h.id)
              .join("|")}> 开头标识说话人，如：
   <host1>大家好啊，我是${finalPodcastOptions.hosts[0].name}。
   <host2>我是${finalPodcastOptions.hosts[1].name}，又到了我们闲聊的时间了。

对话风格：
- 像朋友间的闲聊一样轻松自然，不要太正式
- 可以开一些无伤大雅的玩笑，增添趣味性
- 用轻松的语气讨论话题，不要太严肃
- 适当分享一些生活中的小故事或经历
- 偶尔的俏皮话或幽默感会让对话更有趣
- 遇到专业话题时用生活化的比喻来解释

内容要求：
- 用聊天的方式自然引入话题，不要生硬
- 两位主持人要有互动和默契，像老朋友一样聊天
- 用简单有趣的例子解释复杂概念
- 保持对话的节奏感，但不要太快节奏
- 适当使用日常用语，让听众感觉亲切
- 每分钟约150-200字
- 循序渐进地展开话题，不要太急着深入
- 主持人之间要用名字互相称呼，像朋友一样
- 适时用轻松的方式总结重点
- 结尾要温暖自然，让听众意犹未尽

注意事项：
- 这是播客节目，要让听众感觉在收听一场轻松的谈话
- 避免过于严肃或学术化的表达
- 使用日常生活中常见的比喻
- 每句话都要自然流畅
- 不要加入表情或动作描述
- 可以有一些俏皮话，但不要过度搞笑
- 保持温暖友好的语气，让听众感觉舒服`,
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
