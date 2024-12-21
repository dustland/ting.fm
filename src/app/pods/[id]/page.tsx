"use client"

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useSettingsStore } from "@/stores/settings";
import { usePods } from "@/hooks/use-pods";
import { useChat } from "@/hooks/use-chat";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ScrollArea } from "@radix-ui/react-scroll-area";

export default function PodcastPage() {
  const params = useParams();
  const { toast } = useToast();
  const { podcastSettings } = useSettingsStore();
  const id = params.id as string;
  const generationStartedRef = useRef(false);
  const dialogueMapRef = useRef<Map<number, string>>(new Map());
  const {
    pod,
    saveSource,
    updateTopics,
    updateDialogue,
    deleteDialogue,
    updatePod,
  } = usePods(id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingDialogueId, setEditingDialogueId] = useState<string | null>(
    null
  );
  const [editingContent, setEditingContent] = useState("");
  const [editingHost, setEditingHost] = useState("");
  const { messages, append, isLoading } = useChat({
    onFinish: () => {
      dialogueMapRef.current.clear();
      updatePod(id, { status: "ready" });
      toast({
        title: "生成完成",
        description: "播客对话已生成",
      });
      setIsGenerating(false);
    },
    onError: (error) => {
      console.error(error);
      dialogueMapRef.current.clear();
      toast({
        title: "生成失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
      setIsGenerating(false);
    },
  });

  useEffect(() => {
    if (!messages.length) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === "assistant") {
      const regex = /\[\[host([12])\]\](.*?)\[\]/g;
      let match;
      let index = 0;
      const newDialogues: Array<{
        index: number;
        hostNum: string;
        content: string;
      }> = [];

      while ((match = regex.exec(lastMessage.content)) !== null) {
        const [, hostNum, content] = match;
        newDialogues.push({ index, hostNum, content: content.trim() });
        index++;
      }

      newDialogues.forEach(({ index, hostNum, content }) => {
        const existingContent = dialogueMapRef.current.get(index);
        if (existingContent !== content) {
          dialogueMapRef.current.set(index, content);
          const dialogueId = `dialogue-${index}`;
          updateDialogue(
            id,
            dialogueId,
            content,
            hostNum === "1" ? "host1" : "host2"
          );
        }
      });
    }
  }, [messages, id, updateDialogue]);

  const handleGenerate = useCallback(async () => {
    if (!pod?.source) {
      toast({
        title: "无内容",
        description: "请等待内容抓取完成",
      });
      return;
    }

    dialogueMapRef.current.clear();
    setIsGenerating(true);
    toast({
      title: "生成对话",
      description: "正在生成播客对话内容...",
    });

    try {
      await append(
        {
          role: "user",
          content: pod.source,
        },
        {
          body: {
            format: "podcast",
            podcastOptions: podcastSettings,
          },
        }
      );
    } catch (error) {
      console.error(error);
      toast({
        title: "生成失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  }, [pod?.source, podcastSettings, append, toast]);

  useEffect(() => {
    console.log("pod source", pod?.dialogue);
    if (
      pod?.source &&
      (!pod.dialogue || pod.dialogue.length === 0) &&
      !generationStartedRef.current &&
      !isGenerating
    ) {
      generationStartedRef.current = true;
      handleGenerate();
    }
  }, [pod?.source, pod?.dialogue, handleGenerate, isGenerating]);

  const handleEditDialogue = (
    dialogueId: string,
    content: string,
    host: string
  ) => {
    updateDialogue(id, dialogueId, content, host);
    setEditingDialogueId(null);
    setEditingContent("");
    setEditingHost("");
  };

  const handleDeleteDialogue = (dialogueId: string) => {
    deleteDialogue(id, dialogueId);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Icons.ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">播客编辑</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">预览</Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !pod?.source}
          >
            {isGenerating ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Icons.Wand className="mr-2 h-4 w-4" />
                重新生成
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left side - Topics */}
        <div className="col-span-3">
          <Card className="h-[calc(100vh-8rem)]">
            <CardHeader>
              <CardTitle className="text-lg">主题列表</CardTitle>
              <CardDescription>从源材料中提取的主题</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-16rem)]">
                <div className="space-y-2">
                  {pod?.topics?.map((topic, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent"
                    >
                      <span className="text-sm">{topic}</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon">
                          <Icons.Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Icons.Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Conversations */}
        <div className="col-span-9">
          <Card className="h-[calc(100vh-8rem)]">
            <CardHeader>
              <CardTitle className="text-lg">对话脚本</CardTitle>
              <CardDescription>可编辑的对话内容</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-16rem)]">
                <div className="space-y-4">
                  {pod?.dialogue?.map((entry, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex flex-col space-y-2 rounded-lg p-4",
                        entry.host === "user" ? "bg-accent" : "border"
                      )}
                    >
                      {editingDialogueId === entry.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="min-h-[100px]"
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingDialogueId(null);
                                setEditingContent("");
                                setEditingHost("");
                              }}
                            >
                              取消
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleEditDialogue(
                                  entry.id,
                                  editingContent,
                                  editingHost
                                )
                              }
                            >
                              保存
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback>
                                  {entry.host[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">
                                {entry.host === "user" ? "主持人" : "嘉宾"}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingDialogueId(entry.id);
                                  setEditingContent(entry.content);
                                  setEditingHost(entry.host);
                                }}
                              >
                                <Icons.Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteDialogue(entry.id)}
                              >
                                <Icons.Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm leading-relaxed">
                            {entry.content}
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
