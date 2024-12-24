"use client";

import { use, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DialogueLine } from "@/components/dialogue-line";
import { useToast } from "@/hooks/use-toast";
import { usePodChat } from "@/hooks/use-chat";
import { usePod } from "@/hooks/use-pods";
import { useSettingStore } from "@/store/setting";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { PodActions } from "@/components/pod-actions";

interface Props {
  params: Promise<{ id: string }>;
}

export default function PodPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { podcastSettings } = useSettingStore();
  const { pod, isLoading, isUpdating, updateDialogue } = usePod(id);
  const dialoguesEndRef = useRef<HTMLDivElement>(null);
  const {
    append,
    isLoading: isGeneratingDialogues,
    dialogues,
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
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center gap-4 p-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.push("/pods")}
          >
            <Icons.chevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            <h1 className="lg:text-lg font-semibold">{pod.title}</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 container p-2">
        {/* Content Area */}
        <div className="flex flex-col h-full">
          <Tabs defaultValue="dialogues" className="flex flex-col flex-1">
            <div className="flex flex-wrap items-center w-full justify-between gap-2">
              <TabsList>
                <TabsTrigger value="source" className="px-3">
                  原文
                </TabsTrigger>
                <TabsTrigger value="dialogues" className="px-3">
                  剧本
                </TabsTrigger>
              </TabsList>

              <Button
                onClick={() => handleGenerateDialogues()}
                variant="outline"
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
                    <span>
                      {dialogues?.length ? "重新生成剧本" : "生成剧本"}
                    </span>
                  </>
                )}
              </Button>
            </div>

            <TabsContent value="source" className="flex-1">
              <Card className="h-full flex flex-col">
                <CardContent className="h-full p-0">
                  <ScrollArea className="h-full" type="always">
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

            <TabsContent value="dialogues" className="flex-1 mt-2">
              <Card className="h-full flex flex-col">
                <CardContent className="h-full p-0">
                  <ScrollArea className="h-full" type="always">
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
      </div>

      {/* Pod Actions */}
      <div className="sticky bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-2 px-4">
          <PodActions pod={pod} />
        </div>
      </div>
    </div>
  );
}
