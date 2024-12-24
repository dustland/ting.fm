import { useEffect, useState, useCallback, useRef } from "react";
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
  const [dialogues, setDialogues] = useState<Dialogue[]>([]);
  const podRef = useRef(pod);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const updateDebounceMs = 2000; // 2 seconds debounce

  // Keep latest pod reference without triggering effect
  useEffect(() => {
    podRef.current = pod;
  }, [pod]);

  const chat = useVercelChat({
    api: "/api/chat",
    id: podId,
    body: {
      format: "podcast",
      podcastOptions: options,
    },
    onFinish: (message) => {
      const content = message.content.trim();
      if (!content) return;

      const newDialogues = processDialogues(content);
      if (newDialogues.length === 0) {
        toast({
          title: "对话格式错误",
          description: "AI 回复的内容未包含正确的对话格式，请重试",
          variant: "destructive",
        });
        return;
      }

      console.log("[Chat] Stream finished, updating pod with dialogues:", newDialogues);
      
      if (podRef.current) {
        updatePod({
          ...podRef.current,
          dialogues: newDialogues,
          status: "ready",
          updatedAt: new Date().toISOString(),
        });
      }
    },
    onError: (error) => {
      console.error("[Chat] Error:", error);
      if (onError) {
        onError(error);
      } else {
        toast({
          title: "对话生成失败",
          description: "请稍后再试",
          variant: "destructive",
        });
      }
    },
  });

  const processDialogues = useCallback(
    (content: string): Dialogue[] => {
      const newDialogues: Dialogue[] = [];
      const regex = /\[\[([^\]]+)\]\]:\s*(.*)/g;
      let match;

      while ((match = regex.exec(content)) !== null) {
        const [, hostName, rawContent] = match;
        if (hostName && rawContent) {
          const cleanContent = rawContent.trim();
          if (cleanContent) {
            const dialogue: Dialogue = {
              id: `${podId}-${newDialogues.length}`,
              host: hostName,
              content: cleanContent,
              audioUrl: podRef.current?.dialogues?.[newDialogues.length]?.audioUrl,
            };
            newDialogues.push(dialogue);
          }
        }
      }
      return newDialogues;
    },
    [podId]
  );

  const isDialoguesChanged = useCallback(
    (newDialogues: Dialogue[]) => {
      if (dialogues.length !== newDialogues.length) return true;

      return newDialogues.some((newDialogue, index) => {
        const existingDialogue = dialogues[index];
        return (
          existingDialogue.host !== newDialogue.host ||
          existingDialogue.content !== newDialogue.content
        );
      });
    },
    [dialogues]
  );

  // Initialize dialogues from pod
  useEffect(() => {
    if (pod?.dialogues && !dialogues.length) {
      setDialogues(pod.dialogues);
    }
  }, [pod?.dialogues]);

  // Handle chat message updates for UI only
  useEffect(() => {
    const lastMessage = chat.messages[chat.messages.length - 1];
    if (!lastMessage || lastMessage.role !== "assistant") return;

    const content = lastMessage.content.trim();
    if (!content) return;

    const newDialogues = processDialogues(content);
    if (newDialogues.length === 0) return;

    // Only update local state for UI
    if (isDialoguesChanged(newDialogues)) {
      setDialogues(newDialogues);
    }
  }, [chat.messages, processDialogues, isDialoguesChanged]);

  return {
    ...chat,
    dialogues,
  };
}
