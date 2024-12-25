"use client";

import { useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Dialogue } from "@/store/pod";
import { useSettingStore } from "@/store/setting";

interface DialogueLineProps {
  dialogue: Dialogue;
  className?: string;
  onEdit?: (id: string, content: string) => void;
}

export function DialogueLine({
  dialogue,
  className,
  onEdit,
}: DialogueLineProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(dialogue.content);
  const [ttsState, setTtsState] = useState<{
    isLoading: boolean;
    isPlaying: boolean;
  }>({ isLoading: false, isPlaying: false });
  const audioRef = useRef<HTMLAudioElement>(null);
  const { podcastSettings: settings } = useSettingStore();

  const handleEdit = () => {
    if (!onEdit) return;
    onEdit(dialogue.id, editedContent);
    setIsEditing(false);
    toast({
      title: "对话已更新",
      description: "内容已成功保存",
    });
  };

  const generateTts = async (text: string) => {
    if (dialogue.audioUrl) {
      // If we already have an audio URL, just play it
      if (audioRef.current) {
        audioRef.current.src = dialogue.audioUrl;
        audioRef.current.play();
        setTtsState({ isLoading: false, isPlaying: true });
      }
      return;
    }

    try {
      setTtsState({ isLoading: true, isPlaying: false });
      const response = await fetch("/api/tts", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          host: dialogue.host,
          settings: settings,
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
      if (dialogue.audioUrl || audioRef.current.src) {
        audioRef.current.play();
        setTtsState({ isLoading: false, isPlaying: true });
      } else {
        generateTts(dialogue.content);
      }
    }
  };

  return (
    <div
      className={cn(
        "flex items-start space-x-4 p-4 rounded-lg",
        dialogue.host === settings.hosts[0].name ? "bg-muted/50" : "bg-background",
        className
      )}
    >
      <Avatar className="h-8 w-8">
        <AvatarFallback>
          {dialogue.host === settings.hosts[0].name ? "H1" : "H2"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <>
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[100px] mb-2"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleEdit}>
                保存
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditedContent(dialogue.content);
                }}
              >
                取消
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm leading-6 break-words whitespace-pre-wrap">
              {dialogue.content}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={togglePlayback}
                disabled={ttsState.isLoading}
              >
                {ttsState.isLoading ? (
                  <Icons.spinner className="h-3.5 w-3.5 animate-spin" />
                ) : ttsState.isPlaying ? (
                  <Icons.pause className="h-3.5 w-3.5" />
                ) : (
                  <Icons.play
                    className={cn(
                      "h-3.5 w-3.5",
                      dialogue.audioUrl && "text-green-500"
                    )}
                  />
                )}
              </Button>
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setIsEditing(true)}
                >
                  <Icons.edit className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
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
