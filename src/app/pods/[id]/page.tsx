"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DialogueLine } from "@/components/dialogue-line";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { usePodChat } from "@/hooks/use-chat";
import { usePods } from "@/hooks/use-pods";
import { useSettingStore } from "@/store/setting";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface Props {
  params: Promise<{ id: string }>;
}

export default function PodPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false);
  const { podcastSettings } = useSettingStore();
  const { pod, updateDialogue } = usePods(id);
  const { append } = usePodChat({
    podId: id,
    options: podcastSettings,
    onError: (error) => {
      console.error(error);
      toast({
        title: "对话生成失败",
        description: "请稍后再试",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!pod) {
      router.push("/pods");
    }
  }, [pod, router]);

  const handleGenerateDialogues = async () => {
    if (!pod?.source) return;

    try {
      setIsLoading(true);
      await append({
        role: "user",
        content: pod.source.content,
      });
    } catch (error) {
      console.error("Error generating dialogue:", error);
      toast({
        title: "对话生成失败",
        description: "请稍后再试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePodcast = async () => {
    if (!pod?.dialogues?.length) {
      toast({
        title: "错误",
        description: "没有对话内容可以生成",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGeneratingPodcast(true);
      const audioPromises = pod.dialogues.map(async (dialogue) => {
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: dialogue.content,
            voice: dialogue.host === "host1" ? "onyx" : "nova",
          }),
        });

        if (!response.ok) {
          throw new Error(`生成音频失败: ${dialogue.content.slice(0, 20)}...`);
        }

        return await response.blob();
      });

      // Generate all audio files
      const audioBlobs = await Promise.all(audioPromises);

      // Create audio elements and play them in sequence
      const audioElements = audioBlobs.map((blob) => {
        const audio = new Audio(URL.createObjectURL(blob));
        return audio;
      });

      // Download as a single file
      const combinedBlob = new Blob(audioBlobs, { type: "audio/mpeg" });
      const url = URL.createObjectURL(combinedBlob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${pod.title || "podcast"}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "成功",
        description: "播客已生成并开始下载",
      });
    } catch (error) {
      toast({
        title: "错误",
        description: error instanceof Error ? error.message : "生成播客失败",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPodcast(false);
    }
  };

  const handleEdit = async (dialogueId: string, content: string) => {
    try {
      const dialogue = pod?.dialogues?.find((d) => d.id === dialogueId);
      if (!dialogue) throw new Error("对话不存在");

      updateDialogue(id, dialogueId, content, dialogue.host);
    } catch (error) {
      toast({
        title: "错误",
        description: error instanceof Error ? error.message : "更新对话失败",
        variant: "destructive",
      });
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

  const getSourceTypeText = (type: string) => {
    switch (type) {
      case "url":
        return "网页";
      case "file":
        return "文件";
      case "text":
        return "文本";
      case "channel":
        return "主动探寻";
      default:
        return "文本";
    }
  };

  const isDisabled = !pod?.source || isLoading;
  const canGeneratePodcast = pod?.dialogues && pod.dialogues.length > 0;

  return (
    <div className="h-[calc(100vh-var(--navbar-height))] container flex flex-col py-2">
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col min-h-0">
        <div className="flex-none">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">
              {pod?.title || pod?.source?.metadata?.title || "未命名播客"}
            </h2>
          </div>
          {pod?.source && (
            <div className="flex flex-col space-y-2 mt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    {getSourceTypeIcon(pod.source.type)}
                    <span>{getSourceTypeText(pod.source.type)}</span>
                  </Badge>
                  {pod.source.metadata?.wordCount && (
                    <Badge
                      variant="secondary"
                      className="flex items-center space-x-2"
                    >
                      <Icons.text className="h-4 w-4" />
                      <span>{pod.source.metadata.wordCount} 字</span>
                    </Badge>
                  )}
                  {pod.source.metadata?.readingTime && (
                    <Badge
                      variant="secondary"
                      className="flex items-center space-x-2"
                    >
                      <Icons.clock className="h-4 w-4" />
                      <span>{pod.source.metadata.readingTime} 分钟</span>
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleGenerateDialogues}
                    disabled={isDisabled}
                    className="flex items-center gap-2"
                  >
                    <Icons.wand className="h-4 w-4" />
                    {isLoading ? "生成中..." : "生成对话"}
                  </Button>
                  <Button
                    onClick={handleGeneratePodcast}
                    disabled={!canGeneratePodcast || isGeneratingPodcast}
                    className="flex items-center gap-2"
                  >
                    <Icons.podcast className="h-4 w-4" />
                    {isGeneratingPodcast ? "生成中..." : "生成播客"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <Tabs
          defaultValue="dialogues"
          className="flex-1 flex flex-col min-h-0 mt-6"
        >
          <TabsList className="flex-none grid w-full grid-cols-2">
            <TabsTrigger value="dialogues" className="flex items-center gap-2">
              <Icons.podcast className="h-4 w-4" />
              播客对话
            </TabsTrigger>
            <TabsTrigger value="source" className="flex items-center gap-2">
              <Icons.text className="h-4 w-4" />
              原文内容
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dialogues" className="flex-1 min-h-0">
            <Card className="h-full">
              <CardContent className="p-0 h-full">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    {pod?.dialogues?.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Icons.podcast className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>还没有对话内容</p>
                        <p className="text-sm">点击"生成对话"开始创建</p>
                      </div>
                    ) : (
                      pod?.dialogues?.map((dialogue) => (
                        <DialogueLine
                          key={dialogue.id}
                          id={dialogue.id}
                          host={dialogue.host}
                          content={dialogue.content}
                          onEdit={handleEdit}
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="source" className="flex-1 min-h-0 mt-4">
            <Card className="h-full">
              <CardContent className="p-0 h-full">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    {pod?.source ? (
                      <div className="prose prose-sm max-w-none space-y-4">
                        {pod.source.metadata && (
                          <div className="flex items-start space-x-4 not-prose">
                            {pod.source.metadata.image && (
                              <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
                                <Image
                                  src={pod.source.metadata.image}
                                  alt={pod.source.metadata.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0 space-y-1">
                              {pod.source.metadata.url && (
                                <a
                                  href={pod.source.metadata.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-medium hover:underline flex items-center space-x-1 text-muted-foreground"
                                >
                                  {pod.source.metadata.favicon && (
                                    <Image
                                      src={pod.source.metadata.favicon}
                                      alt=""
                                      width={16}
                                      height={16}
                                      className="rounded"
                                    />
                                  )}
                                  <span className="truncate">
                                    {pod.source.metadata.siteName ||
                                      pod.source.metadata.url}
                                  </span>
                                </a>
                              )}
                              {pod.source.metadata.publishDate && (
                                <div className="text-sm text-muted-foreground flex items-center space-x-2">
                                  <Icons.calendar className="h-4 w-4" />
                                  <span>
                                    {new Date(
                                      pod.source.metadata.publishDate
                                    ).toLocaleDateString("zh-CN", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="border-t pt-4">
                          <p className="whitespace-pre-wrap">
                            {pod.source.content}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Icons.text className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>没有原文内容</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
