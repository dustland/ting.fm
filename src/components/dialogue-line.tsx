"use client";

import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface DialogueLineProps {
  id: string;
  host: string;
  content: string;
  className?: string;
  onEdit?: (id: string, content: string) => void;
}

export function DialogueLine({
  id,
  host,
  content,
  className,
  onEdit,
}: DialogueLineProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [ttsState, setTtsState] = useState<{
    isLoading: boolean;
    isPlaying: boolean;
  }>({ isLoading: false, isPlaying: false });
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleEdit = () => {
    if (!onEdit) return;
    onEdit(id, editedContent);
    setIsEditing(false);
    toast({
      title: "对话已更新",
      description: "内容已成功保存",
    });
  };

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

      // Create a blob URL from the audio data
      const blob = await response.blob();
      return URL.createObjectURL(blob);
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
    <div className={cn("flex gap-3", className)}>
      <Avatar>
        <AvatarImage
          src={isHost1 ? "/avatars/host1.png" : "/avatars/host2.png"}
        />
        <AvatarFallback>{isHost1 ? "H1" : "H2"}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col max-w-[90%] w-full space-y-1">
        <div
          className={cn(
            "rounded-lg px-4 py-2 text-sm",
            isHost1 ? "bg-primary text-primary-foreground" : "bg-muted"
          )}
        >
          {isEditing ? (
            <Textarea
              className="w-full bg-transparent resize-none m-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 border-0"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleEdit();
                }
                if (e.key === "Escape") {
                  setIsEditing(false);
                  setEditedContent(content);
                }
              }}
            />
          ) : (
            content
          )}
        </div>
        <div className="flex items-center justify-between w-full gap-1">
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
          {onEdit && (
            <div className="flex items-center gap-1">
              {isEditing ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleEdit}
                  >
                    <Icons.check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedContent(content);
                    }}
                  >
                    <Icons.close className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsEditing(true)}
                >
                  <Icons.edit className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
