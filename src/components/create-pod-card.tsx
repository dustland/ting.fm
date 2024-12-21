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
import { PaperPod } from "./input-methods/paper-pod";
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
      const { id: podId } = await createPod("", source);
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
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Icons.link className="h-4 w-4" />
              <span className="hidden sm:inline-block">链接</span>
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center gap-2">
              <Icons.fileText className="h-4 w-4" />
              <span className="hidden sm:inline-block">文件</span>
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <Icons.edit className="h-4 w-4" />
              <span className="hidden sm:inline-block">文本</span>
            </TabsTrigger>
            <TabsTrigger value="channel" className="flex items-center gap-2">
              <Icons.radio className="h-4 w-4" />
              <span className="hidden sm:inline-block">频道</span>
            </TabsTrigger>
            <TabsTrigger value="paper" className="flex items-center gap-2">
              <Icons.fileText className="h-4 w-4" />
              <span className="hidden sm:inline-block">论文</span>
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
            <TabsContent value="paper">
              <PaperPod onSubmit={handleCreate} isLoading={isCreating} />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
