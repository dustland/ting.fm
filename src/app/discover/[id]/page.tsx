"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePod } from "@/hooks/use-pods";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function PublishedPodPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { pod, isLoading } = usePod(id);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast({
        description: "已复制链接到剪贴板",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        description: "复制链接失败",
      });
    }
  };

  if (isLoading || !pod) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-var(--navbar-height))]">
        <Icons.spinner className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (pod.status !== "published") {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-var(--navbar-height))] space-y-4">
        <Icons.podcast className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">此播客尚未发布</p>
        <Button variant="outline" onClick={() => router.push("/discover")}>
          返回发现页面
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="shrink-0"
        >
          <Icons.chevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold truncate">{pod.title}</h1>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Audio Player Card */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">播客音频</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="shrink-0"
              >
                <Icons.share className="h-4 w-4" />
              </Button>
            </div>

            {pod.audioUrl && (
              <div className="space-y-4">
                <audio controls src={pod.audioUrl} className="w-full" />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  asChild
                >
                  <a
                    href={pod.audioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    <Icons.download className="h-4 w-4 mr-2" />
                    下载音频
                  </a>
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-lg font-medium">播客信息</h2>

            <div className="flex items-center gap-2">
              {pod.source?.metadata?.wordCount && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Icons.documentText className="h-3 w-3" />
                  <span>{pod.source.metadata.wordCount} 字</span>
                </Badge>
              )}
              {pod.source?.metadata?.readingTime && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Icons.clock className="h-3 w-3" />
                  <span>{pod.source.metadata.readingTime} 分钟</span>
                </Badge>
              )}
            </div>

            {pod.source?.metadata?.summary && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">简介</h3>
                <p className="text-sm text-muted-foreground">
                  {pod.source.metadata.summary}
                </p>
              </div>
            )}

            {(pod.source?.metadata?.link || pod.source?.metadata?.pdfLink) && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">相关链接</h3>
                <div className="flex flex-wrap gap-2">
                  {pod.source.metadata.link && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={pod.source.metadata.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Icons.externalLink className="h-3 w-3 mr-2" />
                        原文链接
                      </a>
                    </Button>
                  )}
                  {pod.source.metadata.pdfLink && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={pod.source.metadata.pdfLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Icons.fileText className="h-3 w-3 mr-2" />
                        PDF
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
