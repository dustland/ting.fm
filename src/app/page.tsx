"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUpload } from "@/components/input-methods/file-upload";
import { UrlInput } from "@/components/input-methods/url-input";
import { TextInput } from "@/components/input-methods/text-input";
import { ChannelSelect } from "@/components/input-methods/channel-select";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (content: string) => {
    setIsGenerating(true);
    try {
      // TODO: Create podcast and get ID
      const podcastId = "test-id"; // This should come from your API
      toast({
        title: "创建成功",
        description: "正在跳转到预览页面...",
      });
      router.push(`/pods/${podcastId}`);
    } catch (error) {
      toast({
        title: "创建失败",
        description: "处理内容时出错，请重试",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-center justify-center space-y-8">
        <div className="space-y-4 text-center pt-8">
          <h1 className="text-3xl font-bold sm:text-5xl">Ting.FM</h1>
          <p className="text-muted-foreground">
            使用 AI 生成高质量的播客内容。
          </p>
        </div>

        <Card className="w-full max-w-2xl p-6">
          <Tabs defaultValue="channel" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="channel">频道</TabsTrigger>
              <TabsTrigger value="text">文本</TabsTrigger>
              <TabsTrigger value="url">链接</TabsTrigger>
              <TabsTrigger value="file">文件</TabsTrigger>
            </TabsList>
            <TabsContent value="channel">
              <ChannelSelect onSubmit={handleSubmit} isLoading={isGenerating} />
            </TabsContent>
            <TabsContent value="file">
              <FileUpload onSubmit={handleSubmit} isLoading={isGenerating} />
            </TabsContent>
            <TabsContent value="url">
              <UrlInput onSubmit={handleSubmit} isLoading={isGenerating} />
            </TabsContent>
            <TabsContent value="text">
              <TextInput onSubmit={handleSubmit} isLoading={isGenerating} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
