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
    
    const blocks = content.split(/\[\[(host[12])\]\]/);
    console.log("[Chat] Split blocks:", blocks);
    
    const dialogues: Dialogue[] = [];
    let index = 0;

    for (let i = 1; i < blocks.length; i += 2) {
      const hostNum = blocks[i];
      const content = blocks[i + 1];

      if (hostNum && content) {
        const cleanContent = content.replace(/\[\[|\]\]/g, "").trim();
        const dialogue = {
          id: `${Date.now()}-${index}`,
          host: hostNum,
          content: cleanContent,
        };
        console.log("[Chat] Created dialogue:", dialogue);
        dialogues.push(dialogue);
        index++;
      }
    }

    console.log("[Chat] Final dialogues:", dialogues);
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
