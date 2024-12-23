"use client";

import { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "@/store/player";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

export function FloatingPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { currentPod, isPlaying, play, pause, toggle, setCurrentPod } = usePlayerStore();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

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

  const handleClose = () => {
    setCurrentPod(null);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  if (!currentPod) return null;

  return (
    <div className={cn(
      "fixed bottom-4 right-4 bg-background border rounded-lg shadow-lg p-4",
      "w-[360px] space-y-4",
      "animate-in slide-in-from-bottom-4"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate text-sm">{currentPod.title}</h4>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 -mr-2"
          onClick={handleClose}
        >
          <Icons.x className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground min-w-[40px]">
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
          <span className="text-xs text-muted-foreground min-w-[40px]">
            {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = Math.max(0, currentTime - 10);
              }
            }}
          >
            <Icons.rewind className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => toggle()}
          >
            {isPlaying ? (
              <Icons.pause className="h-5 w-5" />
            ) : (
              <Icons.play className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = Math.min(duration, currentTime + 10);
              }
            }}
          >
            <Icons.fastForward className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={currentPod.audioUrl}
        className="hidden"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          pause();
          handleClose();
        }}
      />
    </div>
  );
}
