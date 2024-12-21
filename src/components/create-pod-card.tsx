"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Icons } from "./icons";
import { useToast } from "@/hooks/use-toast";
import { usePods } from "@/hooks/use-pods";
import { UrlInput } from "./input-methods/url-input";
import { FileUpload } from "./input-methods/file-upload";
import { TextInput } from "./input-methods/text-input";
import { ChannelSelect } from "./input-methods/channel-select";
import { cn } from "@/lib/utils";
import { PodSource } from "@/store/pod";

interface CreatePodCardProps {
  onCreated?: (podId: string) => void;
  className?: string;
}

export function CreatePodCard({ onCreated, className }: CreatePodCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { createPod } = usePods();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (source: PodSource) => {
    try {
      setIsCreating(true);
      const podId = createPod("", source);
      toast({
        title: "播客创建成功",
        description: "正在跳转到播客详情页...",
      });
      if (onCreated) {
        onCreated(podId);
      } else {
        router.push(`/pods/${podId}`);
      }
    } catch (error) {
      console.error("Error creating pod:", error);
      toast({
        title: "播客创建失败",
        description: "请稍后再试",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className={cn("flex flex-col w-full p-2", className)}>
      <CardTitle className="flex items-center text-base font-bold px-4 py-2">
        <Icons.podcast className="h-4 w-4 mr-2" />
        开始创建属于你的播客
      </CardTitle>
      <CardContent className="p-4">
        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Icons.link className="h-4 w-4" />
              网页
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center gap-2">
              <Icons.upload className="h-4 w-4" />
              文件
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <Icons.text className="h-4 w-4" />
              文本
            </TabsTrigger>
            <TabsTrigger
              value="channel"
              className="group flex items-center gap-2"
            >
              <Icons.sparkles className="h-4 w-4 text-emerald-500" />
              <span className="text-emerald-500">主动探寻</span>
            </TabsTrigger>
          </TabsList>
          <div className="mt-4 space-y-4">
            <TabsContent value="url">
              <UrlInput onSubmit={handleCreate} isLoading={isCreating} />
            </TabsContent>
            <TabsContent value="file">
              <FileUpload onSubmit={handleCreate} isLoading={isCreating} />
            </TabsContent>
            <TabsContent value="text">
              <TextInput onSubmit={handleCreate} isLoading={isCreating} />
            </TabsContent>
            <TabsContent value="channel">
              <ChannelSelect onSubmit={handleCreate} isLoading={isCreating} />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
