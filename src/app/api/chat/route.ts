import { CoreMessage, streamText } from "ai";
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

    const content = messages[messages.length - 1]?.content;
    if ((format === "podcast" && !content) || typeof content !== "string") {
      return new Response(JSON.stringify({ error: "Content is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

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
      const requestBody = {
        model: openai("gpt-4o"),
        messages: [
          {
            role: "system",
            content:
              "You are a skilled podcast scriptwriter specializing in creating engaging and natural dialogues between hosts. Your task is to craft a 15-minute conversation between hosts, ensuring the dialogue is relaxed, friendly, and informative, resembling a casual chat between friends.",
          },
          {
            role: "user",
            content: `Please create a 3-minute podcast dialogue based on the following article:

${content}

**Hosts:**
${finalPodcastOptions.hosts
  .map(
    (host) =>
      `- **${host.name}** (${host.gender === "male" ? "男性" : "女性"}) – ${
        host.personality
      }`
  )
  .join("\n")}

**Dialogue Format:**
1. Each line should begin with the host's name, e.g.,
   - [[${finalPodcastOptions.hosts[0].name}]]: 大家好，我是${
              finalPodcastOptions.hosts[0].name
            }。
   - [[${finalPodcastOptions.hosts[1].name}]]: 我是${
              finalPodcastOptions.hosts[1].name
            }，今天我们来聊聊这个话题。

**Dialogue Style:**
- 对话要自然流畅，像朋友间的闲聊
- 适当加入轻松的玩笑增添趣味
- 以轻松的方式讨论话题，避免过于正式
- 分享相关的个人经历或感受
- 使用简单的比喻来解释复杂概念
- 偶尔加入幽默或俏皮的评论

**Content Guidelines:**
- 在对话中自然地引入话题
- 确保主持人之间互动流畅，展现默契
- 使用生活化的例子来解释复杂概念
- 保持适中的讨论节奏，不要过于仓促
- 使用日常用语创造亲切的氛围
- 每分钟大约150-200字
- 循序渐进地深入话题，避免突兀
- 主持人要互相称呼名字，体现友好关系
- 以轻松的方式总结要点
- 自然地结束对话，让听众意犹未尽

**Additional Notes:**
- 记住这是播客，让听众感觉像是在参与朋友间的聊天
- 避免过于严肃或学术化的语言
- 使用大众熟悉的比喻
- 确保每句话都自然流畅
- 不要包含表情或动作的描述
- 加入有趣的评论但不要过度搞笑
- 始终保持温暖友好的语气

请用中文输出对话内容。`,
          },
        ] as CoreMessage[],
        temperature: 0.7,
      };

      // console.log(
      //   "Generating podcast script with finalPodcastOptions:",
      //   finalPodcastOptions
      // );
      // console.log("Generating podcast script with requestBody:", requestBody);

      const result = streamText(requestBody);

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
