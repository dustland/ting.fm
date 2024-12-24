"use client";

import { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "@/store/player";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { usePathname } from "next/navigation";

interface PlayerProps {
  pod?: {
    id: string;
    title: string;
    audioUrl?: string;
    status?: string;
    summary?: string;
  };
  onGenerate?: () => void;
  onPublish?: () => Promise<void>;
  isGenerating?: boolean;
  isPublishing?: boolean;
  forceShow?: boolean;
}

const Generator = ({ onGenerate, isGenerating }: { onGenerate?: () => void; isGenerating?: boolean }) => {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 flex items-center justify-center text-primary">
          <Icons.logo className="h-8 w-8" />
        </div>
        <div className="flex flex-col">
          <div className="text-sm font-medium">准备生成播客</div>
          <div className="text-xs text-muted-foreground">点击右侧按钮开始生成</div>
        </div>
      </div>
      <Button
        variant="default"
        size="sm"
        className="h-8"
        onClick={onGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <Icons.spinner className="h-3.5 w-3.5 animate-spin mr-2" />
            生成中...
          </>
        ) : (
          <>
            <Icons.podcast className="h-3.5 w-3.5 mr-2" />
            生成播客
          </>
        )}
      </Button>
    </div>
  );
};

const AudioPlayer = ({ pod, onPublish, isPublishing }: { pod: PlayerProps['pod']; onPublish?: () => Promise<void>; isPublishing?: boolean }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { currentPod, isPlaying, play, pause, toggle, setCurrentPod } = usePlayerStore();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (pod) {
      setCurrentPod(pod);
    }
  }, [pod, setCurrentPod]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            if (error.name === "NotAllowedError") {
              pause();
            }
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, pause]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePublishClick = async () => {
    if (!onPublish) {
      toast({
        description: "发布功能暂不可用",
        variant: "destructive",
      });
      return;
    }
    await onPublish();
  };

  if (!pod) return null;

  return (
    <div className="space-y-4">
      {/* Header: Title and Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="h-10 w-10 flex-none flex items-center justify-center text-primary">
            <Icons.logo className="h-8 w-8" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="text-sm font-medium truncate">{pod.title}</div>
            {!isCollapsed && pod.summary && (
              <div className="text-xs text-muted-foreground line-clamp-1">
                {pod.summary}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pod.audioUrl && (
            <Button
              variant={pod.status === "published" ? "ghost" : "default"}
              size="sm"
              className="h-8"
              onClick={handlePublishClick}
              disabled={isPublishing}
            >
              {isPublishing ? (
                <>
                  <Icons.spinner className="h-3.5 w-3.5 animate-spin mr-2" />
                  发布中...
                </>
              ) : pod.status === "published" ? (
                <>
                  <Icons.check className="h-3.5 w-3.5 mr-2" />
                  已发布
                </>
              ) : (
                <>
                  <Icons.rss className="h-3.5 w-3.5 mr-2" />
                  发布
                </>
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <Icons.chevronDown className={cn(
              "h-4 w-4 transition-transform",
              isCollapsed ? "-rotate-90" : ""
            )} />
          </Button>
        </div>
      </div>

      {/* Player Controls */}
      {!isCollapsed && (
        <div className="flex items-center gap-4">
          <audio
            ref={audioRef}
            src={currentPod?.audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            className="hidden"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggle}
          >
            {isPlaying ? (
              <Icons.pause className="h-4 w-4" />
            ) : (
              <Icons.play className="h-4 w-4" />
            )}
          </Button>

          <div className="flex-1 flex items-center gap-2">
            <span className="text-xs tabular-nums text-muted-foreground w-12 text-right">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              min={0}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="flex-1"
            />
            <span className="text-xs tabular-nums text-muted-foreground w-12">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export function FloatingPlayer({ 
  pod, 
  onGenerate, 
  onPublish,
  isGenerating,
  isPublishing,
  forceShow = false,
}: PlayerProps) {
  const pathname = usePathname();
  const { currentPod, isVisible, hide } = usePlayerStore();
  const isPodDetailPage = pathname.startsWith("/pods/");
  const showCloseButton = !isPodDetailPage;

  // Don't show if not visible and not forced
  if (!isVisible && !forceShow) return null;

  // Don't show if no pod data
  if (!pod && !currentPod) return null;

  return (
    <div className="fixed bottom-4 right-4 w-[500px] bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-4">
      <div className="relative">
        {showCloseButton && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={hide}
          >
            <Icons.x className="h-3 w-3" />
          </Button>
        )}
        {!pod?.audioUrl ? (
          <Generator onGenerate={onGenerate} isGenerating={isGenerating} />
        ) : (
          <AudioPlayer pod={pod} onPublish={onPublish} isPublishing={isPublishing} />
        )}
      </div>
    </div>
  );
}
