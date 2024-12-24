"use client";

import { useState, useRef, useEffect } from "react";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePod } from "@/hooks/use-pods";
import { useSettingStore } from "@/store/setting";
import { Dialogue, Pod } from "@/store/pod";

interface PodActionsProps {
  pod: Pod;
}

export function PodActions({ pod }: PodActionsProps) {
  const { toast } = useToast();
  const { podcastSettings } = useSettingStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { updatePod } = usePod(pod.id);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleGenerate = async () => {
    if (!pod.dialogues?.length) {
      toast({
        title: "错误",
        description: "没有对话内容可以生成",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);

      // Function to handle a single TTS request with timeout
      const generateAudioWithTimeout = async (dialogue: Dialogue) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        try {
          const response = await fetch("/api/tts", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: dialogue.content,
              host: dialogue.host,
              settings: podcastSettings,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("TTS API error:", errorData);
            throw new Error(
              `生成音频失败: ${dialogue.content.slice(0, 20)}... (${
                response.status
              })`
            );
          }

          const data = await response.json();
          return {
            url: data.url,
            dialogueId: dialogue.id,
          };
        } catch (error: any) {
          if (error.name === "AbortError") {
            throw new Error(
              `生成音频超时: ${dialogue.content.slice(0, 20)}...`
            );
          }
          throw error;
        } finally {
          clearTimeout(timeoutId);
        }
      };

      // Generate individual audio files with progress tracking
      const audioPromises = pod.dialogues.map((dialogue, index) =>
        generateAudioWithTimeout(dialogue).catch((error) => {
          console.error(`Error generating audio for dialogue ${index}:`, error);
          throw error;
        })
      );

      // Generate all audio files in parallel with overall timeout
      const audioResults = await Promise.all(audioPromises).catch((error) => {
        toast({
          title: "生成音频失败",
          description: error.message || "请稍后再试",
          variant: "destructive",
        });
        throw error;
      });

      // Update all dialogues with their audio URLs
      const updatedDialogues = pod.dialogues.map((dialogue) => {
        const audioResult = audioResults.find(
          (r) => r.dialogueId === dialogue.id
        );
        return audioResult
          ? { ...dialogue, audioUrl: audioResult.url }
          : dialogue;
      });

      // Generate merged audio
      const response = await fetch("/api/tts/merge", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          podId: pod.id,
          segments: audioResults.map((r) => ({
            // Extract just the filename from the full URL
            url: r.url.split("/").pop()!,
            duration: 0,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Merge API error:", errorData);
        throw new Error(errorData.error || "合并音频失败");
      }

      const { publicUrl: mergedAudioUrl } = await response.json();

      // Update pod with all audio URLs in one call
      if (pod) {
        await updatePod({
          ...pod,
          audioUrl: mergedAudioUrl,
          dialogues: updatedDialogues,
          updatedAt: new Date().toISOString(),
        });
      }

      toast({
        title: "成功",
        description: "音频已生成完成",
      });
    } catch (error) {
      toast({
        title: "错误",
        description: error instanceof Error ? error.message : "生成播客失败",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!pod?.audioUrl) {
      toast({
        title: "错误",
        description: "请先生成播客音频",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsPublishing(true);
      const newStatus = pod.status === "published" ? "draft" : "published";

      const updatedPod = {
        ...pod,
        status: newStatus as "draft" | "ready" | "published",
        updatedAt: new Date().toISOString(),
      };

      await updatePod(updatedPod);

      toast({
        description: newStatus === "published" ? "已发布" : "已取消发布",
      });
    } catch (error) {
      console.error("Error publishing pod:", error);
      toast({
        variant: "destructive",
        description: "发布失败，请稍后再试",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!pod?.audioUrl) {
      toast({
        title: "错误",
        description: "请先生成播客音频",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsPublishing(true);
      const newStatus = "draft";

      const updatedPod = {
        ...pod,
        status: newStatus as "draft" | "ready" | "published",
        updatedAt: new Date().toISOString(),
      };

      await updatePod(updatedPod);

      toast({
        description: "已取消发布",
      });
    } catch (error) {
      console.error("Error unpublishing pod:", error);
      toast({
        variant: "destructive",
        description: "取消发布失败，请稍后再试",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  if (!pod) return null;

  if (!pod.audioUrl) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icons.podcast className="h-4 w-4" />
          <span className="text-sm font-medium">生成播客</span>
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Icons.spinner className="h-3.5 w-3.5 animate-spin mr-2" />
              生成中...
            </>
          ) : (
            <>
              <Icons.wand className="h-3.5 w-3.5 mr-2" />
              生成
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handlePlayPause}
        >
          {isPlaying ? (
            <Icons.pause className="h-4 w-4" />
          ) : (
            <Icons.play className="h-4 w-4" />
          )}
        </Button>

        <div className="flex items-center gap-2">
          <Icons.podcast className="h-4 w-4" />
          <span className="text-sm font-medium line-clamp-2">{pod.title}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Icons.spinner className="h-3.5 w-3.5 animate-spin mr-2" />
              生成中...
            </>
          ) : (
            <>
              <Icons.refresh className="h-3.5 w-3.5 mr-2" />
              重新生成
            </>
          )}
        </Button>

        <Button
          variant={pod.status === "published" ? "destructive" : "default"}
          size="sm"
          onClick={pod.status === "published" ? handleUnpublish : handlePublish}
          disabled={isGenerating}
        >
          {pod.status === "published" ? (
            <>
              {isPublishing ? (
                <Icons.spinner className="h-3.5 w-3.5 animate-spin mr-2" />
              ) : (
                <Icons.rss className="h-3.5 w-3.5 mr-2" />
              )}
              {isPublishing ? "取消发布中..." : "取消发布"}
            </>
          ) : (
            <>
              {isPublishing ? (
                <Icons.spinner className="h-3.5 w-3.5 animate-spin mr-2" />
              ) : (
                <Icons.rss className="h-3.5 w-3.5 mr-2" />
              )}
              {isPublishing ? "发布中..." : "发布"}
            </>
          )}
        </Button>
      </div>

      <audio
        ref={audioRef}
        src={pod.audioUrl}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
}
