"use client"

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useSettingStore } from "@/store/setting";
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
  const { podcastSettings } = useSettingStore();
  const id = params.id as string;
  const generationStartedRef = useRef(false);
  const dialogueMapRef = useRef<Map<number, string>>(new Map());
  const { pod, updateDialogue, deleteDialogue, updatePod } = usePods(id);
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
        description: "Pod对话已生成",
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

  const [ttsStates, setTtsStates] = useState<Record<string, { isLoading: boolean; isPlaying: boolean }>>({});
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    if (!messages.length) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === "assistant") {
      const regex = /\[\[(host[12])\]\](.*?)\]\]/g;
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
            hostNum === "host1" ? "host1" : "host2"
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
      console.log("pod.source", pod.source);
      await append(
        {
          role: "user",
          content:
            "请根据如下原始材料为我生成一个生动的播客脚本:\n\n" + pod.source,
        },
        {
          body: {
            source: pod.source,
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

  const handleTTS = async (dialogueId: string, text: string) => {
    try {
      setTtsStates(prev => ({
        ...prev,
        [dialogueId]: { isLoading: true, isPlaying: false }
      }));

      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, voice: "alloy" }),
      });

      if (!response.ok) {
        throw new Error("TTS request failed");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      // Clean up previous audio instance if it exists
      if (audioRefs.current[dialogueId]) {
        audioRefs.current[dialogueId].pause();
        URL.revokeObjectURL(audioRefs.current[dialogueId].src);
      }
      
      audioRefs.current[dialogueId] = audio;
      
      audio.addEventListener('ended', () => {
        setTtsStates(prev => ({
          ...prev,
          [dialogueId]: { isLoading: false, isPlaying: false }
        }));
        URL.revokeObjectURL(audioUrl);
        delete audioRefs.current[dialogueId];
      });

      audio.addEventListener('playing', () => {
        setTtsStates(prev => ({
          ...prev,
          [dialogueId]: { isLoading: false, isPlaying: true }
        }));
      });

      audio.play();
    } catch (error) {
      console.error(error);
      setTtsStates(prev => ({
        ...prev,
        [dialogueId]: { isLoading: false, isPlaying: false }
      }));
      toast({
        title: "语音合成失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    }
  };

  const stopTTS = (dialogueId: string) => {
    const audio = audioRefs.current[dialogueId];
    if (audio) {
      audio.pause();
      URL.revokeObjectURL(audio.src);
      delete audioRefs.current[dialogueId];
      setTtsStates(prev => ({
        ...prev,
        [dialogueId]: { isLoading: false, isPlaying: false }
      }));
    }
  };

  return (
    <div className="container mx-auto py-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Icons.ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-semibold">播客编辑</h1>
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

      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="text-lg">播客对话</CardTitle>
          <CardDescription>根据原始材料生成的播客内容</CardDescription>
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
                              const state = ttsStates[entry.id];
                              if (state?.isPlaying) {
                                stopTTS(entry.id);
                              } else {
                                handleTTS(entry.id, entry.content);
                              }
                            }}
                          >
                            {ttsStates[entry.id]?.isLoading ? (
                              <Icons.Loader2 className="h-4 w-4 animate-spin" />
                            ) : ttsStates[entry.id]?.isPlaying ? (
                              <Icons.Square className="h-4 w-4" />
                            ) : (
                              <Icons.Volume2 className="h-4 w-4" />
                            )}
                          </Button>
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
                      <p className="text-sm leading-relaxed">{entry.content}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
