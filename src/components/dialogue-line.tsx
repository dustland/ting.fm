"use client";

import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Icons } from "./icons";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface DialogueLineProps {
  id: string;
  host: string;
  content: string;
  className?: string;
}

export function DialogueLine({
  id,
  host,
  content,
  className,
}: DialogueLineProps) {
  const { toast } = useToast();
  const [ttsState, setTtsState] = useState<{
    isLoading: boolean;
    isPlaying: boolean;
  }>({ isLoading: false, isPlaying: false });
  const audioRef = useRef<HTMLAudioElement>(null);

  const generateTts = async (text: string) => {
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("TTS generation failed");
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Error generating TTS:", error);
      toast({
        title: "语音生成失败",
        description: "请稍后再试",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handlePlayTts = async () => {
    if (audioRef.current?.src) {
      if (ttsState.isPlaying) {
        audioRef.current.pause();
        setTtsState((prev) => ({ ...prev, isPlaying: false }));
      } else {
        audioRef.current.play();
        setTtsState((prev) => ({ ...prev, isPlaying: true }));
      }
      return;
    }

    setTtsState({ isLoading: true, isPlaying: false });

    try {
      const audioUrl = await generateTts(content);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.addEventListener("ended", () => {
        setTtsState({ isLoading: false, isPlaying: false });
      });

      audio.play();
      setTtsState({ isLoading: false, isPlaying: true });
    } catch (error) {
      console.error("Failed to generate TTS:", error);
      setTtsState({ isLoading: false, isPlaying: false });
    }
  };

  const isHost1 = host === "host1";

  return (
    <div
      className={cn(
        "flex gap-3",
        isHost1 ? "flex-row" : "flex-row-reverse",
        className
      )}
    >
      <Avatar>
        <AvatarImage
          src={isHost1 ? "/avatars/host1.png" : "/avatars/host2.png"}
        />
        <AvatarFallback>{isHost1 ? "H1" : "H2"}</AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "flex flex-col gap-2 max-w-[80%]",
          isHost1 ? "items-start" : "items-end"
        )}
      >
        <div
          className={cn(
            "rounded-lg px-4 py-2",
            isHost1 ? "bg-primary text-primary-foreground" : "bg-muted"
          )}
        >
          {content}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handlePlayTts}
          disabled={ttsState.isLoading}
        >
          {ttsState.isLoading ? (
            <Icons.spinner className="h-4 w-4 animate-spin" />
          ) : ttsState.isPlaying ? (
            <Icons.pause className="h-4 w-4" />
          ) : (
            <Icons.play className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
