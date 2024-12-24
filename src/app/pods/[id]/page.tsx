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
          podId: id,
          segments: audioResults.map((r) => ({
            // Extract just the filename from the full URL
            url: r.url.split('/').pop()!,
            duration: 0
          }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Merge API error:", errorData);
        throw new Error(errorData.error || "合并音频失败");
      }

      const { publicUrl: mergedAudioUrl } = await response.json();

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
    if (!pod?.audioUrl) {
      toast({
        title: "错误",
        description: "请先生成播客音频",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsPublishing(true);
      const newStatus = pod.status === "published" ? "draft" : "published";

      const updatedPod = {
        ...pod,
        status: newStatus as "draft" | "ready" | "published",
        updatedAt: new Date().toISOString(),
      };

      await updatePod(updatedPod);

      toast({
        description: newStatus === "published" ? "已发布" : "已取消发布",
      });
    } catch (error) {
      console.error("Error publishing pod:", error);
      toast({
        variant: "destructive",
        description: "发布失败，请稍后再试",
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
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 mt-4">
          <Tabs defaultValue="source" className="flex-1">
            <div className="flex items-center w-full justify-between gap-2 mb-4">
              <TabsList className="h-8">
                <TabsTrigger value="source" className="text-xs px-3">
                  原文内容
                </TabsTrigger>
                <TabsTrigger value="dialogues" className="text-xs px-3">
                  播客剧本
                </TabsTrigger>
              </TabsList>

              {dialogues?.length ? (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleGenerateDialogues()}
                    variant="outline"
                    size="sm"
                    disabled={isGeneratingDialogues}
                    className="h-8"
                  >
                    {isGeneratingDialogues ? (
                      <>
                        <Icons.spinner className="h-3.5 w-3.5 animate-spin mr-2" />
                        <span>生成中...</span>
                      </>
                    ) : (
                      <>
                        <Icons.wand className="h-3.5 w-3.5 mr-2" />
                        <span>重新生成剧本</span>
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleGeneratePodcast}
                    variant="outline"
                    size="sm"
                    disabled={isGeneratingPodcast}
                    className="h-8"
                  >
                    {isGeneratingPodcast ? (
                      <>
                        <Icons.spinner className="h-3.5 w-3.5 animate-spin mr-2" />
                        <span>生成中...</span>
                      </>
                    ) : (
                      <>
                        <Icons.podcast className="h-3.5 w-3.5 mr-2" />
                        <span>重新生成播客</span>
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => handleGenerateDialogues()}
                  size="sm"
                  disabled={isGeneratingDialogues}
                  className="h-8"
                >
                  {isGeneratingDialogues ? (
                    <>
                      <Icons.spinner className="h-3.5 w-3.5 animate-spin mr-2" />
                      <span>生成中...</span>
                    </>
                  ) : (
                    <>
                      <Icons.wand className="h-3.5 w-3.5 mr-2" />
                      <span>生成剧本</span>
                    </>
                  )}
                </Button>
              )}
            </div>

            <TabsContent value="source" className="flex-1 min-h-0">
              <Card className="h-full">
                <CardContent className="p-0 h-full">
                  <ScrollArea className="h-full">
                    {pod?.source ? (
                      <div className="p-4 prose prose-sm max-w-none">
                        <div className="flex items-center gap-2 mb-4">
                          {getSourceTypeIcon(pod.source.type)}
                          <span className="text-sm text-muted-foreground">
                            {getSourceTypeText(pod.source.type)}
                          </span>
                        </div>
                        <div className="whitespace-pre-wrap">
                          {pod.source.content}
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
                        </div>
                      ) : (
                        <>
                          {dialogues.map((dialogue, index) => (
                            <DialogueLine
                              key={dialogue.id}
                              dialogue={dialogue}
                              onEdit={handleEdit}
                            />
                          ))}
                          <div ref={dialoguesEndRef} />
                        </>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Floating Player */}
        {dialogues?.length > 0 && (
          <FloatingPlayer
            pod={{
              id: pod.id,
              title: pod.title,
              audioUrl: pod.audioUrl,
              status: pod.status,
              summary: pod.summary
            }}
            onGenerate={handleGeneratePodcast}
            onPublish={handlePublish}
            isGenerating={isGeneratingPodcast}
            isPublishing={isPublishing}
          />
        )}
      </div>
    </div>
  );
}
