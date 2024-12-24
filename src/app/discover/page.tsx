"use client";

import { useRouter } from "next/navigation";
import { useDiscoverPods } from "@/hooks/use-discover-pods";
import { usePlayerStore } from "@/store/player";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

export default function DiscoverPage() {
  const router = useRouter();
  const { pods, isLoading } = useDiscoverPods();
  const { currentPod, setCurrentPod } = usePlayerStore();

  const handleCardClick = (pod: any) => {
    router.push(`/pods/${pod.id}`);
  };

  return (
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
        <div className="grid gap-4 grid-cols-1">
          {pods.map((pod) => (
            <Card 
              key={pod.id} 
              className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => handleCardClick(pod)}
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  {pod.source?.type === "arxiv" ? (
                    <Icons.sparkles className="h-6 w-6 text-primary" />
                  ) : (
                    <Icons.text className="h-6 w-6 text-primary" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-medium truncate">
                      {pod.title}
                    </h2>
                    {pod.status === "published" && (
                      <Badge variant="secondary" className="shrink-0">
                        已发布
                      </Badge>
                    )}
                  </div>

                  {pod.source?.metadata?.summary && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {pod.source.metadata.summary}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Icons.clock className="h-3.5 w-3.5" />
                      <span>{pod.source?.metadata?.readingTime || 0} 分钟</span>
                    </div>
                    {pod.source?.metadata?.wordCount && (
                      <div className="flex items-center gap-1">
                        <Icons.documentText className="h-3.5 w-3.5" />
                        <span>{pod.source.metadata.wordCount} 字</span>
                      </div>
                    )}
                    {pod.updatedAt && (
                      <div className="flex items-center gap-1">
                        <Icons.calendar className="h-3.5 w-3.5" />
                        <span>
                          {formatDistanceToNow(new Date(pod.updatedAt), {
                            addSuffix: true,
                            locale: zhCN,
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {pod.audioUrl && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 mt-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentPod({
                        id: pod.id,
                        title: pod.title,
                        audioUrl: pod.audioUrl,
                        status: pod.status,
                        summary: pod.source?.metadata?.summary,
                      });
                    }}
                  >
                    {currentPod?.id === pod.id ? (
                      <Icons.music className="h-4 w-4" />
                    ) : (
                      <Icons.podcast className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
