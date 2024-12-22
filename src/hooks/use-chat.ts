import { useEffect } from "react";
import { useChat as useVercelChat, Message } from "ai/react";
import { usePod } from "./use-pods";
import { Dialogue } from "@/store/pod";
import { PodcastSettings } from "@/store/setting";
import { useToast } from "@/hooks/use-toast";

interface UsePodChatOptions {
  podId: string;
  options?: PodcastSettings;
  onError?: (error: Error) => void;
}

export function usePodChat({ podId, options, onError }: UsePodChatOptions) {
  const { pod, updatePod, updateDialogues } = usePod(podId);
  const { toast } = useToast();
  const chat = useVercelChat({
    api: "/api/chat",
    body: {
      format: "podcast",
      podcastOptions: options,
    },
    onError,
    onFinish: (message) => {
      console.log("[Chat] Chat finished, final message:", message);
      const dialogues = processDialogues(message.content);
      if (dialogues.length === 0 && message.content.trim()) {
        toast({
          title: "对话格式错误",
          description: `AI 回复的内容未包含正确的对话格式，请重试:\n\n${message.content.slice(
            0,
            100
          )}...`,
        });
        return;
      }
      console.log("[Chat] Updating pod with final dialogues:", {
        podId,
        dialogues,
      });
      updatePod({
        ...pod,
        dialogues,
        status: "ready",
      });
    },
  });

  const isDialoguesUpdated = (newDialogues: Dialogue[]) => {
    // If pod or pod.dialogues is undefined, treat as update needed
    if (!pod?.dialogues) return true;

    // If lengths are different, update is needed
    if (pod.dialogues.length !== newDialogues.length) {
      return true;
    }

    // Compare each dialogue for changes
    return newDialogues.some((newDialogue, index) => {
      const existingDialogue = pod.dialogues[index];
      return (
        existingDialogue.id !== newDialogue.id ||
        existingDialogue.host !== newDialogue.host ||
        existingDialogue.content !== newDialogue.content
      );
    });
  };

  const processDialogues = (content: string): Dialogue[] => {
    console.log("[Chat] Processing dialogues from content:", content);

    const dialogues: Dialogue[] = [];
    const regex = /\[\[([^\]]+)\]\]:\s*(.*)/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const [, hostName, rawContent] = match;
      if (hostName && rawContent) {
        const cleanContent = rawContent.trim();
        if (cleanContent) {
          const dialogue: Dialogue = {
            id: `${podId}-${dialogues.length}`,
            host: hostName,
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
    if (lastMessage?.role === "assistant" && !chat.isLoading) {
      console.log("[Chat] Processing streaming message");
      const dialogues = processDialogues(lastMessage.content);
      if (dialogues.length === 0 && lastMessage.content.trim()) {
        toast({
          title: "对话格式错误",
          description: "AI 回复的内容未包含正确的对话格式，请重试",
          variant: "destructive",
        });
        return;
      }
      if (dialogues.length > 0) {
        console.log("[Chat] Updating pod with streaming dialogues:", {
          podId,
          dialogues,
        });
        if (isDialoguesUpdated(dialogues)) updateDialogues(dialogues);
      }
    }
  }, [chat.messages, podId, updateDialogues, chat.isLoading, toast]);

  return chat;
}
