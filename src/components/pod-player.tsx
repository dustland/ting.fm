"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Pod } from "@/store/pod";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { usePlayerStore } from "@/store/player";

interface PodPlayerProps {
  pod: Pod;
  variant?: "floating" | "inline";
}

export function PodPlayer({ pod, variant = "inline" }: PodPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { isPlaying, play, pause } = usePlayerStore();

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        pause();
      } else {
        audioRef.current.play().catch(() => {
          pause();
        });
        play();
      }
    }
  };

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
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleShare = () => {
    const url = `${window.location.origin}/share/${pod.id}`;
    navigator.clipboard.writeText(url);
    toast({
      description: "分享链接已复制",
    });
  };

  // Sync audio element with isPlaying state
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          pause();
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, pause]);

  // Handle audio end
  const handleEnded = () => {
    pause();
  };

  const playerContent = (
    <div className="space-y-4">
      {/* Header: Title and Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="h-10 w-10 flex-none flex items-center justify-center text-primary">
            <Icons.logo className="h-8 w-8" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="text-sm font-medium truncate">{pod.title}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleShare}
          >
            <Icons.share className="h-4 w-4" />
          </Button>
          {variant === "floating" && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                <Icons.chevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isCollapsed ? "-rotate-180" : ""
                  )}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handlePlayPause}
              >
                <Icons.x className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Player Controls */}
      {(!isCollapsed || variant === "inline") && (
        <div className="flex items-center gap-4">
          <audio
            ref={audioRef}
            src={pod.audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
          />
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

  if (variant === "floating") {
    return (
      <div className="fixed bottom-4 right-4 w-[500px] bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-4">
        {playerContent}
      </div>
    );
  }

  return (
    <div className="bg-background border rounded-lg p-4">{playerContent}</div>
  );
}
