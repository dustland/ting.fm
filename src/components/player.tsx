"use client";

import { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "@/store/player";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PlayerProps {
  pod?: {
    id: string;
    title: string;
    audioUrl?: string;
    status?: string;
    summary?: string;
  };
  onGenerate?: () => void;
  onPublish?: () => void;
  isGenerating?: boolean;
  isPublishing?: boolean;
}

const Generator = ({ onGenerate, isGenerating }: { onGenerate?: () => void; isGenerating?: boolean }) => {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4">
        <Avatar className="h-10 w-10 border">
          <AvatarImage src="/logo.png" alt="Ting.fm" />
          <AvatarFallback>TF</AvatarFallback>
        </Avatar>
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

const AudioPlayer = ({ pod, onPublish, isPublishing }: { pod: PlayerProps['pod']; onPublish?: () => void; isPublishing?: boolean }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { currentPod, isPlaying, play, pause, toggle, setCurrentPod } = usePlayerStore();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

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

  if (!pod) return null;

  return (
    <div className="space-y-4">
      {/* Header: Title and Publish Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src="/logo.png" alt="Ting.fm" />
            <AvatarFallback>TF</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="text-sm font-medium">{pod.title}</div>
            {pod.summary && (
              <div className="text-xs text-muted-foreground max-w-[400px] truncate">
                {pod.summary}
              </div>
            )}
          </div>
        </div>

        {pod.status === "published" ? (
          <Button variant="ghost" size="sm" className="h-8" disabled>
            <Icons.check className="h-3.5 w-3.5 mr-2" />
            已发布
          </Button>
        ) : (
          <Button
            variant="default"
            size="sm"
            className="h-8"
            onClick={onPublish}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <>
                <Icons.spinner className="h-3.5 w-3.5 animate-spin mr-2" />
                发布中...
              </>
            ) : (
              <>
                <Icons.upload className="h-3.5 w-3.5 mr-2" />
                发布
              </>
            )}
          </Button>
        )}
      </div>

      {/* Player Controls */}
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
    </div>
  );
};

export function FloatingPlayer({ 
  pod, 
  onGenerate, 
  onPublish,
  isGenerating,
  isPublishing 
}: PlayerProps) {
  if (!pod) return null;

  return (
    <div className="fixed bottom-4 right-4 w-[500px] bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-4">
      {!pod.audioUrl ? (
        <Generator onGenerate={onGenerate} isGenerating={isGenerating} />
      ) : (
        <AudioPlayer pod={pod} onPublish={onPublish} isPublishing={isPublishing} />
      )}
    </div>
  );
}
