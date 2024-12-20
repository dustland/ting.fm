"use client";

import { useState } from "react";
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
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

interface Podcast {
  id: string;
  title: string;
  description: string;
  duration: number;
  createdAt: string;
  status: "processing" | "ready" | "failed";
}

// TODO: Replace with real API call
const mockPodcasts: Podcast[] = [
  {
    id: "1",
    title: "人工智能的未来发展",
    description: "探讨 AI 技术的最新进展和未来趋势",
    duration: 1800, // 30 minutes
    createdAt: "2024-12-20T15:00:00Z",
    status: "ready",
  },
  {
    id: "2",
    title: "可持续发展与环保",
    description: "关于环境保护和可持续发展的深度讨论",
    duration: 2400, // 40 minutes
    createdAt: "2024-12-20T14:30:00Z",
    status: "processing",
  },
];

export default function PodsPage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>(mockPodcasts);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} 分钟`;
  };

  const getStatusIcon = (status: Podcast["status"]) => {
    switch (status) {
      case "processing":
        return <Icons.spinner className="h-4 w-4 animate-spin" />;
      case "ready":
        return <Icons.check className="h-4 w-4 text-green-500" />;
      case "failed":
        return <Icons.error className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusText = (status: Podcast["status"]) => {
    switch (status) {
      case "processing":
        return "处理中";
      case "ready":
        return "已就绪";
      case "failed":
        return "生成失败";
    }
  };

  return (
    <div className="container py-10">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">我的播客</h1>
            <p className="text-muted-foreground">管理和查看您创建的所有播客</p>
          </div>
          <Button asChild>
            <Link href="/">
              <Icons.create className="mr-2 h-4 w-4" />
              新建播客
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {podcasts.map((podcast) => (
            <Card key={podcast.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="line-clamp-1">{podcast.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {podcast.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Icons.clock className="h-4 w-4" />
                  <span>{formatDuration(podcast.duration)}</span>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  {getStatusIcon(podcast.status)}
                  <span>{getStatusText(podcast.status)}</span>
                </div>
                <Button variant="ghost" asChild>
                  <Link href={`/pods/${podcast.id}`}>
                    <Icons.play className="mr-2 h-4 w-4" />
                    查看详情
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
