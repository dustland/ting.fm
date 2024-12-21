"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePods } from "@/hooks/use-pods";
import { type Pod } from "@/store/pod";
import { Badge } from "@/components/ui/badge";
import { CreatePodCard } from "@/components/create-pod-card";
import { CreatePodDialog } from "@/components/create-pod-dialog";
import Image from "next/image";

export default function PodsPage() {
  const { pods, deletePod } = usePods();

  const podsList = useMemo(() => {
    return Object.values(pods as Record<string, Pod>).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [pods]);

  const formatDuration = (wordCount: number) => {
    // Roughly estimate duration based on text length
    const minutes = Math.ceil(wordCount / 300); // Assuming 300 words per minute
    return `${minutes} 分钟`;
  };

  const getStatusIcon = (status: Pod["status"]) => {
    switch (status) {
      case "draft":
        return <Icons.edit className="h-4 w-4" />;
      case "ready":
        return <Icons.check className="h-4 w-4 text-green-500" />;
      case "published":
        return <Icons.podcast className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusText = (status: Pod["status"]) => {
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
      case "channel":
        return <Icons.sparkles className="h-4 w-4 text-emerald-500" />;
      default:
        return <Icons.text className="h-4 w-4" />;
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">我的播客</h1>
            <p className="text-muted-foreground">管理和查看您创建的所有播客</p>
          </div>
          {podsList.length > 0 && (
            <CreatePodDialog
              trigger={
                <Button>
                  <Icons.create className="mr-2 h-4 w-4" />
                  新建播客
                </Button>
              }
            />
          )}
        </div>
      </div>

      {podsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-xl font-semibold">还没有播客</h2>
            <p className="text-muted-foreground">创建您的第一个播客吧！</p>
          </div>
          <CreatePodCard className="max-w-2xl w-full" />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {podsList.map((pod) => (
            <Card key={pod.id} className="flex flex-col p-2">
              <CardHeader className="p-2">
                <div className="flex items-center space-x-2 border-b pb-2">
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
                  <CardTitle className="flex flex-1 line-clamp-1 text-base">
                    {pod.title || pod.source?.metadata?.title || "未命名播客"}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      deletePod(pod.id);
                    }}
                    className="text-red-300 hover:text-red-500"
                  >
                    <Icons.trash className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription className="line-clamp-4">
                  {pod.source?.metadata?.description || pod.source?.content}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  {pod.source && (
                    <>
                      {getSourceTypeIcon(pod.source.type)}
                      {pod.source.metadata?.wordCount ? (
                        <span>
                          {formatDuration(pod.source.metadata.wordCount)}
                        </span>
                      ) : (
                        <span>
                          {formatDuration(
                            (pod.source.content?.length || 0) / 2
                          )}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between p-2">
                <Badge
                  variant="outline"
                  className="flex items-center space-x-2 text-sm text-muted-foreground"
                >
                  {getStatusIcon(pod.status)}
                  <span>{getStatusText(pod.status)}</span>
                </Badge>
                <Button variant="ghost" asChild>
                  <Link href={`/pods/${pod.id}`}>
                    编辑
                    <Icons.chevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
