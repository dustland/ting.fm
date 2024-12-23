"use client";

import { useEffect, useRef } from "react";
import { usePlayerStore } from "@/store/player";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

export function FloatingPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { currentPod, isPlaying, play, pause, toggle } = usePlayerStore();

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  if (!currentPod) return null;

  return (
    <div className={cn(
      "fixed bottom-4 right-4 bg-background border rounded-lg shadow-lg p-4",
      "w-[320px] flex items-center gap-4",
      "animate-in slide-in-from-bottom-4"
    )}>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{currentPod.title}</h4>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => toggle()}
        >
          {isPlaying ? (
            <Icons.pause className="h-4 w-4" />
          ) : (
            <Icons.play className="h-4 w-4" />
          )}
        </Button>
      </div>

      <audio
        ref={audioRef}
        src={currentPod.audioUrl}
        className="hidden"
        onEnded={() => pause()}
      />
    </div>
  );
}
