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

export default function PodsPage() {
  const { pods } = usePods();

  const podsList = useMemo(() => {
    return Object.values(pods).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [pods]);

  const formatDuration = (text: string) => {
    // Roughly estimate duration based on text length
    const minutes = Math.ceil(text.length / 500); // Assuming 500 characters per minute
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

  return (
    <div className="container py-10">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">我的播客</h1>
            <p className="text-muted-foreground">管理和查看您创建的所有播客</p>
          </div>
          <Button asChild>
            <Link href="/pods/new">
              <Icons.create className="mr-2 h-4 w-4" />
              新建播客
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {podsList.map((pod) => (
            <Card key={pod.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="line-clamp-1">{pod.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {pod.source}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Icons.clock className="h-4 w-4" />
                  <span>{formatDuration(pod.source || "")}</span>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  {getStatusIcon(pod.status)}
                  <span>{getStatusText(pod.status)}</span>
                </div>
                <Button variant="ghost" asChild>
                  <Link href={`/pods/${pod.id}`}>
                    <Icons.chevronRight className="mr-2 h-4 w-4" />
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
