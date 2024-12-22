"use client";

import { use, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DialogueLine } from "@/components/dialogue-line";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { usePodChat } from "@/hooks/use-chat";
import { usePod } from "@/hooks/use-pods";
import { usePodStore } from "@/store/pod";
import { useSettingStore } from "@/store/setting";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { PaperInfo } from "@/components/paper-info";

interface Props {
  params: Promise<{ id: string }>;
}

export default function PodPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false);
  const { podcastSettings } = useSettingStore();
  const { pod, status, updatePod } = usePod(id);
  const { updateDialogue } = usePodStore();
  const scrollRef = useRef<HTMLDivElement>(null);
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
    if (!pod && !status.isLoading) {
      toast({
        title: "播客不存在",
        description: "正在返回播客列表",
        variant: "destructive",
      });
      router.push("/pods");
    }
  }, [pod, router, status.isLoading, toast]);

  if (!pod) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleGenerateDialogues = async () => {
    if (!pod?.source) return;

    try {
      const response = await append({
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
      const audioPromises = pod.dialogues.map(async (dialogue, index) => {
        const response = await fetch("/api/tts", {
          method: "POST",
          credentials: "include",
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

        const data = await response.json();

        // Update dialogue with audio URL
        await updateDialogue(id, dialogue.id, dialogue.content, dialogue.host);
        return {
          url: data.url,
          dialogueId: dialogue.id,
        };
      });

      // Generate all audio files
      const audioResults = await Promise.all(audioPromises);

      // Update each dialogue with its audio URL
      for (const { url, dialogueId } of audioResults) {
        const dialogue = pod.dialogues.find((d) => d.id === dialogueId);
        if (dialogue) {
          await updateDialogue(id, dialogueId, dialogue.content, dialogue.host);
        }
      }

      toast({
        title: "成功",
        description: "音频已生成完成",
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

  console.log(pod);

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
                      <Icons.documentText className="h-4 w-4" />
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
                  {pod.dialogues?.length > 0 ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleGenerateDialogues}
                        className="flex items-center gap-2"
                      >
                        <Icons.wand className="h-4 w-4" />
                        重新生成剧本
                      </Button>
                      <Button
                        onClick={handleGeneratePodcast}
                        disabled={isGeneratingPodcast}
                        className="flex items-center gap-2"
                      >
                        <Icons.podcast className="h-4 w-4" />
                        {isGeneratingPodcast ? "生成中..." : "生成播客"}
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleGenerateDialogues}
                      className="flex items-center gap-2"
                    >
                      <Icons.wand className="h-4 w-4" />
                      生成剧本
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <Tabs
          defaultValue="source"
          className="flex-1 flex flex-col min-h-0 mt-6"
        >
          <TabsList className="flex-none grid w-full grid-cols-2">
            <TabsTrigger value="source" className="flex items-center gap-2">
              <Icons.text className="h-4 w-4" />
              原文内容
            </TabsTrigger>
            <TabsTrigger value="dialogues" className="flex items-center gap-2">
              <Icons.podcast className="h-4 w-4" />
              播客对话
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
                          audioUrl={dialogue.audioUrl}
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
                  {pod?.source ? (
                    <div className="p-6 space-y-6">
                      {/* Source Type Badge */}
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          {pod.source.type === "url" && (
                            <Icons.link className="h-4 w-4" />
                          )}
                          {pod.source.type === "file" && (
                            <Icons.upload className="h-4 w-4" />
                          )}
                          {pod.source.type === "text" && (
                            <Icons.text className="h-4 w-4" />
                          )}
                          {pod.source.type === "paper" && (
                            <Icons.sparkles className="h-4 w-4 text-emerald-500" />
                          )}
                          <span>
                            {pod.source.type === "url" && "网页内容"}
                            {pod.source.type === "file" && "上传文件"}
                            {pod.source.type === "text" && "文本输入"}
                            {pod.source.type === "paper" && "AI 助手"}
                          </span>
                        </Badge>
                        {pod.source.metadata?.wordCount && (
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Icons.documentText className="h-4 w-4" />
                            <span>{pod.source.metadata.wordCount} 字</span>
                          </div>
                        )}
                      </div>

                      {/* Metadata Section */}
                      {pod.source.metadata && (
                        <div className="flex items-start gap-6 p-4 bg-muted/50 rounded-lg">
                          {/* Image */}
                          {pod.source.metadata.image && (
                            <div className="relative w-32 h-32 rounded-lg overflow-hidden shrink-0 bg-background">
                              <Image
                                src={pod.source.metadata.image}
                                alt={pod.source.metadata.title || ""}
                                fill
                                sizes="128px"
                                className="object-cover"
                              />
                            </div>
                          )}

                          {/* Metadata Details */}
                          <div className="flex-1 min-w-0 space-y-3">
                            {/* Title */}
                            {pod.source.metadata.title && (
                              <h3 className="font-semibold text-lg line-clamp-2">
                                {pod.source.metadata.title}
                              </h3>
                            )}

                            {/* URL */}
                            {pod.source.metadata.url && (
                              <a
                                href={pod.source.metadata.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm hover:underline flex items-center gap-2 text-muted-foreground"
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
                                <Icons.externalLink className="h-3 w-3 shrink-0" />
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Content Section */}
                      <div className="prose prose-sm max-w-none">
                        {pod.source.type === "paper" && pod.source.metadata && (
                          <div className="space-y-6">
                            {pod.source.metadata.summary && (
                              <div className="mt-4">
                                <h3 className="font-medium text-sm mb-2">
                                  摘要
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {pod.source.metadata.summary}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                        {pod.source.type !== "paper" && pod.source.content && (
                          <div className="space-y-4">
                            {pod.source.content
                              .split("\n")
                              .map((paragraph, index) => (
                                <p
                                  key={index}
                                  className="text-sm text-muted-foreground"
                                >
                                  {paragraph}
                                </p>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
                      <Icons.file className="h-12 w-12 mb-4 opacity-50" />
                      <p>还没有内容</p>
                      <p className="text-sm">请先添加内容再生成对话</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
