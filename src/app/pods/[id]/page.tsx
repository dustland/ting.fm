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
import { useSettingStore } from "@/store/setting";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FloatingPlayer } from "@/components/player";

interface Props {
  params: Promise<{ id: string }>;
}

export default function PodPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false); // Add this line
  const { podcastSettings } = useSettingStore();
  const { pod, isLoading, isUpdating, updatePod, updateDialogue } = usePod(id);
  const dialoguesEndRef = useRef<HTMLDivElement>(null);
  const {
    append,
    isLoading: isGeneratingDialogues,
    dialogues,
    stop,
  } = usePodChat({
    podId: id,
    options: podcastSettings,
    onError: () => {
      toast({
        title: "对话生成失败",
        description: "请稍后再试",
        variant: "destructive",
      });
    },
  });

  // Only redirect if pod is not found after loading is complete
  useEffect(() => {
    if (!isLoading && !isUpdating && !pod) {
      toast({
        title: "播客不存在",
        description: "正在返回播客列表",
        variant: "destructive",
      });
      router.push("/pods");
    }
  }, [pod, router, isLoading, isUpdating, toast]);

  useEffect(() => {
    if (dialoguesEndRef.current) {
      dialoguesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [dialogues?.length]);

  // Show loading state while loading or updating
  if (isLoading || isUpdating || !pod) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleGenerateDialogues = async () => {
    if (!pod?.source) return;

    try {
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
    }
  };

  const handleGeneratePodcast = async () => {
    if (!dialogues?.length) {
      toast({
        title: "错误",
        description: "没有对话内容可以生成",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGeneratingPodcast(true);

      // Function to handle a single TTS request with timeout
      const generateAudioWithTimeout = async (
        dialogue: (typeof dialogues)[0]
      ) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        try {
          const response = await fetch("/api/tts", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: dialogue.content,
              voice: dialogue.host === "奥德彪" ? "onyx" : "nova",
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("TTS API error:", errorData);
            throw new Error(
              `生成音频失败: ${dialogue.content.slice(0, 20)}... (${
                response.status
              })`
            );
          }

          const data = await response.json();
          return {
            url: data.url,
            dialogueId: dialogue.id,
          };
        } catch (error: any) {
          if (error.name === "AbortError") {
            throw new Error(
              `生成音频超时: ${dialogue.content.slice(0, 20)}...`
            );
          }
          throw error;
        } finally {
          clearTimeout(timeoutId);
        }
      };

      // Generate individual audio files with progress tracking
      const audioPromises = dialogues.map((dialogue, index) =>
        generateAudioWithTimeout(dialogue).catch((error) => {
          console.error(`Error generating audio for dialogue ${index}:`, error);
          throw error;
        })
      );

      // Generate all audio files in parallel with overall timeout
      const audioResults = await Promise.all(audioPromises).catch((error) => {
        toast({
          title: "生成音频失败",
          description: error.message || "请稍后再试",
          variant: "destructive",
        });
        throw error;
      });

      // Update all dialogues with their audio URLs
      const updatedDialogues = dialogues.map((dialogue) => {
        const audioResult = audioResults.find(
          (r) => r.dialogueId === dialogue.id
        );
        return audioResult
          ? { ...dialogue, audioUrl: audioResult.url }
          : dialogue;
      });

      // Generate merged audio
      const response = await fetch("/api/tts/merge", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audioUrls: audioResults.map((r) => r.url),
        }),
      });

      if (!response.ok) {
        throw new Error("合并音频失败");
      }

      const { url: mergedAudioUrl } = await response.json();

      // Update pod with all audio URLs in one call
      if (pod) {
        await updatePod({
          ...pod,
          audioUrl: mergedAudioUrl,
          dialogues: updatedDialogues,
          updatedAt: new Date().toISOString(),
        });
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

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      await updatePod({
        ...pod,
        status: pod?.status === "published" ? "ready" : "published",
        updatedAt: new Date().toISOString(),
      });
      toast({
        description: pod?.status === "published" ? "已取消发布" : "已发布",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "发布失败",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleEdit = async (dialogueId: string, content: string) => {
    try {
      const dialogue = dialogues?.find((d) => d.id === dialogueId);
      if (!dialogue) throw new Error("对话不存在");

      await updateDialogue({ ...dialogue, content });
      toast({
        title: "成功",
        description: "对话已更新",
      });
    } catch (error) {
      toast({
        title: "错误",
        description: error instanceof Error ? error.message : "更新对话失败",
        variant: "destructive",
      });
    }
  };

  const handleStopGenerating = () => {
    stop();
    setIsGeneratingPodcast(false);
  };

  const getSourceTypeIcon = (type: string) => {
    switch (type) {
      case "url":
        return <Icons.link className="h-4 w-4" />;
      case "file":
        return <Icons.upload className="h-4 w-4" />;
      case "text":
        return <Icons.text className="h-4 w-4" />;
      case "arxiv":
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
      case "arxiv":
        return "论文";
      default:
        return "文本";
    }
  };

  return (
    <div className="h-[calc(100vh-var(--navbar-height))] container flex flex-col p-2">
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col min-h-0">
        {/* Header Section */}
        <div className="flex-none space-y-2">
          {/* Back Button and Title */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="shrink-0"
            >
              <Icons.chevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg sm:text-xl font-semibold truncate">
              {pod?.title}
            </h1>
          </div>

          {/* Metadata and Audio Player */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              {pod?.source?.metadata?.wordCount && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Icons.documentText className="h-3 w-3" />
                  <span>{pod.source.metadata.wordCount} 字</span>
                </Badge>
              )}
              {pod?.source?.metadata?.readingTime && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Icons.clock className="h-3 w-3" />
                  <span>{pod.source.metadata.readingTime} 分钟</span>
                </Badge>
              )}
            </div>

            {pod?.audioUrl && (
              <div className="flex items-center gap-2 ml-auto order-last w-full sm:w-auto mt-2 sm:mt-0">
                <FloatingPlayer
                  pod={{ id: pod.id, title: pod.title, audioUrl: pod.audioUrl }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  asChild
                >
                  <a
                    href={pod.audioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="下载音频"
                  >
                    <Icons.download className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => handleGenerateDialogues()}
              variant={dialogues?.length ? "outline" : "default"}
              disabled={isGeneratingDialogues}
              className="flex items-center gap-2"
            >
              {isGeneratingDialogues ? (
                <>
                  <Icons.spinner className="h-4 w-4 animate-spin" />
                  <span>生成剧本中...</span>
                </>
              ) : dialogues?.length ? (
                <>
                  <Icons.wand className="h-4 w-4" />
                  <span>重新生成剧本</span>
                </>
              ) : (
                <>
                  <Icons.wand className="h-4 w-4" />
                  <span>生成剧本</span>
                </>
              )}
            </Button>

            <Button
              onClick={() => handleGeneratePodcast()}
              disabled={isGeneratingPodcast || !dialogues?.length}
              className="flex items-center gap-2"
            >
              {isGeneratingPodcast ? (
                <>
                  <Icons.spinner className="h-4 w-4 animate-spin" />
                  <span>生成播客中...</span>
                </>
              ) : (
                <>
                  <Icons.podcast className="h-4 w-4" />
                  <span>生成播客</span>
                </>
              )}
            </Button>

            {pod?.audioUrl && (
              <Button
                variant={pod?.status === "published" ? "default" : "outline"}
                size="sm"
                className="h-8 ml-auto"
                onClick={handlePublish}
                disabled={isPublishing || isUpdating}
              >
                {isPublishing ? (
                  <>
                    <Icons.spinner className="h-3 w-3 animate-spin" />
                    <span>处理中...</span>
                  </>
                ) : (
                  <>
                    <Icons.publish className="h-3 w-3" />
                    <span>
                      {pod?.status === "published" ? "取消发布" : "发布"}
                    </span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs
          defaultValue="source"
          className="flex-1 flex flex-col min-h-0 mt-3 sm:mt-6"
        >
          <TabsList className="flex-none grid w-full grid-cols-3 p-0.5">
            <TabsTrigger
              value="source"
              className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
            >
              <Icons.text className="h-3 w-3 sm:h-4 sm:w-4" />
              原文内容
            </TabsTrigger>
            <TabsTrigger
              value="dialogues"
              className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
            >
              <Icons.podcast className="h-3 w-3 sm:h-4 sm:w-4" />
              播客剧本
            </TabsTrigger>
            <TabsTrigger
              value="podcast"
              className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
              disabled={!dialogues?.length}
            >
              <Icons.headphones className="h-3 w-3 sm:h-4 sm:w-4" />
              播客
            </TabsTrigger>
          </TabsList>

          <TabsContent value="source" className="flex-1 min-h-0">
            <Card className="h-full">
              <CardContent className="p-0 h-full">
                <ScrollArea className="h-full">
                  {pod?.source ? (
                    <div className="p-2 sm:p-6">
                      {/* Header Section */}
                      {pod.source && (
                        <div className="flex flex-col space-y-2 sm:space-y-4 pb-3 sm:pb-6 border-b">
                          {/* Title and External Link */}
                          <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
                            {pod.source.metadata?.title || pod.title}
                          </h1>

                          {/* Metadata Section */}
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                            {/* Type Badge */}
                            {pod.source.type === "paper" &&
                              pod.source.metadata?.categories &&
                              pod.source.metadata.categories[0] && (
                                <div className="flex items-center gap-2 w-full">
                                  <Icons.arxiv className="h-4 w-4 shrink-0" />
                                  {pod.source.metadata.categories.map(
                                    (category, index) => (
                                      <span
                                        key={index}
                                        className="nowrap max-w-48 truncate p-1 border rounded-md bg-muted/50"
                                      >
                                        {category}
                                      </span>
                                    )
                                  )}
                                </div>
                              )}
                            {/* Dates */}
                            {pod.source.metadata?.createdAt && (
                              <div className="flex items-center gap-1">
                                <Icons.calendar className="h-4 w-4" />
                                <span>
                                  发布于{" "}
                                  {new Date(
                                    pod.source.metadata.createdAt
                                  ).toLocaleDateString("zh-CN")}
                                </span>
                              </div>
                            )}

                            {/* Links */}
                            {pod.source.metadata?.link && (
                              <a
                                href={pod.source.metadata.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1"
                              >
                                <Icons.externalLink className="h-4 w-4" />
                                <span>原文</span>
                              </a>
                            )}

                            {pod.source.metadata?.pdfLink && (
                              <a
                                href={pod.source.metadata.pdfLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1"
                              >
                                <Icons.fileText className="h-4 w-4" />
                                <span>PDF</span>
                              </a>
                            )}
                            {/* Authors */}
                            {pod.source.metadata?.authors &&
                              pod.source.metadata.authors.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Icons.users className="h-4 w-4" />
                                  <span>
                                    {pod.source.metadata.authors.join(", ")}
                                  </span>
                                </div>
                              )}
                          </div>
                        </div>
                      )}

                      {/* Content Section */}
                      <div className="mt-3 sm:mt-6">
                        {pod.source.type === "paper" && pod.source.metadata && (
                          <div className="space-y-3 sm:space-y-6">
                            {pod.source.metadata.summary && (
                              <div className="mt-2 sm:mt-4">
                                <h3 className="font-medium text-sm mb-1 sm:mb-2">
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
                    <div className="p-8 text-center text-muted-foreground">
                      <p>播客内容加载中...</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dialogues" className="flex-1 min-h-0">
            <Card className="h-full">
              <CardContent className="relative p-0 h-full">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    {!dialogues?.length ? (
                      <div className="flex flex-col items-center justify-center min-h-[400px] py-8 gap-6">
                        <div className="flex flex-col items-center gap-4">
                          <Icons.podcast className="h-16 w-16 text-muted-foreground" />
                          <p className="text-lg text-muted-foreground">
                            根据原文内容生成播客剧本
                          </p>
                        </div>
                        <Button
                          onClick={handleGenerateDialogues}
                          className="gap-2"
                        >
                          {isGeneratingDialogues ? (
                            <>
                              <Icons.spinner className="h-4 w-4 animate-spin" />
                              <span>正在生成播客剧本...</span>
                            </>
                          ) : (
                            <>
                              <Icons.wand className="h-4 w-4" />
                              <span>生成播客剧本</span>
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      dialogues?.map((dialogue) => (
                        <DialogueLine
                          key={dialogue.id}
                          dialogue={dialogue}
                          onEdit={handleEdit}
                        />
                      ))
                    )}
                  </div>
                  <div ref={dialoguesEndRef} />
                </ScrollArea>
                {isGeneratingDialogues && (
                  <div className="absolute top-2 right-2">
                    <Button
                      variant="destructive"
                      onClick={handleStopGenerating}
                      className="flex items-center gap-2"
                    >
                      <Icons.stop className="h-4 w-4 animate-spin" />
                      <span>停止生成</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="podcast" className="flex-1 min-h-0 relative">
            <Card className="absolute inset-0">
              <CardContent className="p-0 h-full">
                <ScrollArea className="h-full">
                  <div className="p-2 sm:p-6 space-y-6">
                    {/* Audio Player Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-lg sm:text-xl font-semibold mb-2">
                            {pod?.title}
                          </h2>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {pod?.source?.metadata?.wordCount && (
                              <div className="flex items-center gap-1">
                                <Icons.documentText className="h-3.5 w-3.5" />
                                <span>{pod.source.metadata.wordCount}字</span>
                              </div>
                            )}
                            {pod?.source?.metadata?.readingTime && (
                              <div className="flex items-center gap-1">
                                <Icons.clock className="h-3.5 w-3.5" />
                                <span>
                                  {pod.source.metadata.readingTime}分钟
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-3">
                        <FloatingPlayer
                          pod={{
                            id: pod.id,
                            title: pod.title,
                            audioUrl: pod.audioUrl,
                          }}
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">简介</h3>
                      <p className="text-sm text-muted-foreground">
                        {pod?.source?.metadata?.summary ||
                          pod?.source?.content?.slice(0, 200)}
                        ...
                      </p>
                    </div>

                    {/* Source Links */}
                    {(pod?.source?.metadata?.link ||
                      pod?.source?.metadata?.pdfLink) && (
                      <div className="flex flex-wrap gap-2">
                        {pod.source.metadata.link && (
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={pod.source.metadata.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5"
                            >
                              <Icons.externalLink className="h-3.5 w-3.5" />
                              原文
                            </a>
                          </Button>
                        )}
                        {pod.source.metadata.pdfLink && (
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={pod.source.metadata.pdfLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5"
                            >
                              <Icons.fileText className="h-3.5 w-3.5" />
                              PDF
                            </a>
                          </Button>
                        )}
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
