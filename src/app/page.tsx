"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUpload } from "@/components/input-methods/file-upload";
import { UrlInput } from "@/components/input-methods/url-input";
import { TextInput } from "@/components/input-methods/text-input";
import { ChannelSelect } from "@/components/input-methods/channel-select";
import { useToast } from "@/hooks/use-toast";
import { usePods } from "@/hooks/use-pods";

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const { createPod } = usePods();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (source: string) => {
    setIsGenerating(true);
    try {
      const podId = createPod("New Podcast", source);
      toast({
        title: "创建成功",
        description: "正在跳转到预览页面...",
      });
      router.push(`/pods/${podId}`);
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
    <main className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-3xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Ting.fm
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            使用 AI 生成精彩的播客内容
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-medium">开始创建</CardTitle>
            <CardDescription>
              选择合适的输入方式，快速生成高质量的播客内容
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Tabs defaultValue="url" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="url">链接</TabsTrigger>
                <TabsTrigger value="file">文件</TabsTrigger>
                <TabsTrigger value="text">文本</TabsTrigger>
                <TabsTrigger value="channel">频道</TabsTrigger>
              </TabsList>
              <div className="mt-4 space-y-4">
                <TabsContent value="url">
                  <UrlInput onSubmit={handleSubmit} isLoading={isGenerating} />
                </TabsContent>
                <TabsContent value="file">
                  <FileUpload
                    onSubmit={handleSubmit}
                    isLoading={isGenerating}
                  />
                </TabsContent>
                <TabsContent value="text">
                  <TextInput onSubmit={handleSubmit} isLoading={isGenerating} />
                </TabsContent>
                <TabsContent value="channel">
                  <ChannelSelect
                    onSubmit={handleSubmit}
                    isLoading={isGenerating}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
