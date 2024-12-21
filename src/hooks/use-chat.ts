import { useEffect } from "react";
import { useChat as useVercelChat, Message } from "ai/react";
import { usePods } from "./use-pods";
import { Dialogue } from "@/store/pod";
import { nanoid } from "nanoid";
import { PodcastSettings } from "@/store/setting";

interface UsePodChatOptions {
  podId: string;
  options?: PodcastSettings;
  onError?: (error: Error) => void;
}

export function usePodChat({ podId, options, onError }: UsePodChatOptions) {
  const { updatePod } = usePods(podId);
  const chat = useVercelChat({
    api: "/api/chat",
    body: {
      format: "podcast",
      podcastOptions: options,
    },
    onError,
  });

  const processDialogues = (content: string): Dialogue[] => {
    console.log("[Chat] Processing dialogues from content:", content);
    
    const dialogues: Dialogue[] = [];
    const regex = /<(host[12])>(.*?)(?=<host[12]>|$)/gs;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const [, hostId, rawContent] = match;
      if (hostId && rawContent) {
        const cleanContent = rawContent.trim();
        if (cleanContent) {
          const dialogue = {
            id: `${Date.now()}-${dialogues.length}`,
            host: hostId,
            content: cleanContent,
          };
          console.log("[Chat] Created dialogue:", dialogue);
          dialogues.push(dialogue);
        }
      }
    }

    return dialogues;
  };

  useEffect(() => {
    const lastMessage = chat.messages[chat.messages.length - 1];
    console.log("[Chat] Last message:", lastMessage);
    
    if (lastMessage?.role === "assistant") {
      console.log("[Chat] Processing assistant message");
      const dialogues = processDialogues(lastMessage.content);
      console.log("[Chat] Updating pod with dialogues:", { podId, dialogues });
      updatePod(podId, {
        dialogues,
        status: "ready",
      });
    }
  }, [chat.messages, podId, updatePod]);

  return chat;
}
