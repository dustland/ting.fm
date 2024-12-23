"use client";

import { useDiscoverPods } from "@/hooks/use-discover-pods";
import { usePlayerStore } from "@/store/player";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { FloatingPlayer } from "@/components/player";

export default function DiscoverPage() {
  const { pods, isLoading } = useDiscoverPods();
  const { currentPod, setCurrentPod, isPlaying, toggle } = usePlayerStore();

  const handlePlay = (pod: any) => {
    if (currentPod?.id === pod.id) {
      toggle();
    } else {
      setCurrentPod({
        id: pod.id,
        title: pod.title,
        audioUrl: pod.audioUrl,
      });
    }
  };

  return (
    <>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">发现播客</h1>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-[200px]">
            <Icons.spinner className="h-6 w-6 animate-spin" />
          </div>
        ) : pods.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] space-y-4">
            <Icons.podcast className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">暂无已发布的播客</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pods.map((pod) => (
              <Card key={pod.id} className="p-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => handlePlay(pod)}
                    disabled={!pod.audioUrl}
                  >
                    {currentPod?.id === pod.id && isPlaying ? (
                      <Icons.pause className="h-4 w-4" />
                    ) : (
                      <Icons.play className="h-4 w-4" />
                    )}
                  </Button>

                  <div className="flex-1 min-w-0">
                    <h2 className="font-medium truncate">
                      {pod.title}
                    </h2>
                    {pod.source?.metadata?.summary && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {pod.source.metadata.summary}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    {pod.source?.metadata?.readingTime && (
                      <div className="flex items-center gap-1">
                        <Icons.clock className="h-3.5 w-3.5" />
                        <span>{pod.source.metadata.readingTime}分钟</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <FloatingPlayer />
    </>
  );
}
