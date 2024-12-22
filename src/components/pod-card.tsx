"use client";

import Image from "next/image";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePod } from "@/hooks/use-pods";
import { cn } from "@/lib/utils";

interface PodCardProps {
  podId: string;
  className?: string;
}

export function PodCard({ podId, className }: PodCardProps) {
  const { pod, deletePod, isDeleting } = usePod(podId);

  if (!pod) return null;

  const formatDuration = (wordCount: number) => {
    // Roughly estimate duration based on text length
    const minutes = Math.ceil(wordCount / 300); // Assuming 300 words per minute
    return `${minutes} 分钟`;
  };

  const getStatusIcon = (status: typeof pod.status) => {
    switch (status) {
      case "draft":
        return <Icons.edit className="h-4 w-4" />;
      case "ready":
        return <Icons.check className="h-4 w-4 text-green-500" />;
      case "published":
        return <Icons.podcast className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusText = (status: typeof pod.status) => {
    switch (status) {
      case "draft":
        return "草稿";
      case "ready":
        return "已就绪";
      case "published":
        return "已发布";
    }
  };

  const getSourceTypeIcon = (type: string) => {
    switch (type) {
      case "url":
        return <Icons.link className="h-4 w-4" />;
      case "file":
        return <Icons.upload className="h-4 w-4" />;
      case "text":
        return <Icons.text className="h-4 w-4" />;
      case "paper":
        return <Icons.sparkles className="h-4 w-4 text-emerald-500" />;
      default:
        return <Icons.text className="h-4 w-4" />;
    }
  };

  const statusVariants = {
    draft: "outline",
    ready: "secondary",
    published: "default",
  } as const;

  const statusLabels = {
    draft: "草稿",
    ready: "已就绪",
    published: "已发布",
  };

  const formatDate = (date: Date) => {
    // Assuming date is in ISO format
    return new Date(date).toLocaleDateString();
  };

  return (
    <Card className={cn("flex flex-col p-1 sm:p-2 h-full", className)}>
      <CardHeader className="p-1.5 sm:p-2">
        <div className="flex items-center space-x-2 border-b pb-1.5 sm:pb-2">
          {pod.source?.metadata?.favicon ? (
            <Image
              src={pod.source.metadata.favicon}
              alt=""
              width={16}
              height={16}
              className="rounded shrink-0"
            />
          ) : (
            <Icons.podcast className="h-4 w-4 shrink-0" />
          )}
          <CardTitle className="flex items-center justify-between">
            <span className="truncate">{pod.title}</span>
            <div className="flex items-center gap-2">
              {pod.audioUrl && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Icons.headphones className="h-3 w-3" />
                  已生成音频
                </Badge>
              )}
              <Badge variant={statusVariants[pod.status]}>
                {statusLabels[pod.status]}
              </Badge>
            </div>
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deletePod()}
            className="text-muted-foreground hover:text-red-500 shrink-0"
          >
            {isDeleting ? (
              <Icons.spinner className="h-4 w-4 animate-spin" />
            ) : (
              <Icons.trash className="h-4 w-4" />
            )}
          </Button>
        </div>
        <CardDescription className="line-clamp-3 sm:line-clamp-4 mt-1.5 sm:mt-2 text-sm">
          {pod.source?.metadata?.description || pod.source?.content}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-1.5 sm:p-2">
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
          {pod.source && (
            <>
              {getSourceTypeIcon(pod.source.type)}
              {pod.source.metadata?.wordCount ? (
                <span>{formatDuration(pod.source.metadata.wordCount)}</span>
              ) : (
                <span>
                  {formatDuration((pod.source.content?.length || 0) / 2)}
                </span>
              )}
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-1.5 sm:p-2">
        <div className="text-sm text-muted-foreground">
          {formatDate(new Date(pod.createdAt))}
        </div>
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/pods/${pod.id}`}>
            <Icons.chevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
