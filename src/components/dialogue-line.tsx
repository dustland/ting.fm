"use client";

import { useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface DialogueLineProps {
  id: string;
  host: string;
  content: string;
  audioUrl?: string;
  className?: string;
  onEdit?: (id: string, content: string) => void;
}

export function DialogueLine({
  id,
  host,
  content,
  audioUrl,
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
    if (audioUrl) {
      // If we already have an audio URL, just play it
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setTtsState({ isLoading: false, isPlaying: true });
      }
      return;
    }

    try {
      setTtsState({ isLoading: true, isPlaying: false });
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voice: host === "host1" ? "onyx" : "nova",
        }),
      });

      if (!response.ok) {
        throw new Error("生成音频失败");
      }

      const data = await response.json();
      if (audioRef.current) {
        audioRef.current.src = data.url;
        audioRef.current.play();
        setTtsState({ isLoading: false, isPlaying: true });
      }
    } catch (error) {
      toast({
        title: "错误",
        description: error instanceof Error ? error.message : "生成音频失败",
        variant: "destructive",
      });
      setTtsState({ isLoading: false, isPlaying: false });
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (ttsState.isPlaying) {
      audioRef.current.pause();
      setTtsState({ ...ttsState, isPlaying: false });
    } else {
      if (audioUrl || audioRef.current.src) {
        audioRef.current.play();
        setTtsState({ isLoading: false, isPlaying: true });
      } else {
        generateTts(content);
      }
    }
  };

  return (
    <div
      className={cn(
        "flex gap-4 p-4 rounded-lg",
        host === "host1" ? "bg-muted/50" : "bg-background",
        className
      )}
    >
      <Avatar>
        <AvatarFallback>{host === "host1" ? "H1" : "H2"}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        {isEditing ? (
          <>
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex gap-2">
              <Button onClick={handleEdit}>保存</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditedContent(content);
                }}
              >
                取消
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlayback}
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                >
                  <Icons.edit className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-sm leading-7">{content}</p>
          </>
        )}
      </div>
      <audio
        ref={audioRef}
        onEnded={() => setTtsState({ isLoading: false, isPlaying: false })}
        onPause={() => setTtsState({ isLoading: false, isPlaying: false })}
      />
    </div>
  );
}
