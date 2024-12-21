"use client";

import { useState } from "react";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PodSource } from "@/store/pod";

interface ResearchTopic {
  id: string;
  name: string;
  description: string;
  keywords: string;
}

const researchTopics: ResearchTopic[] = [
  {
    id: "ai-ml",
    name: "AI & 机器学习",
    description: "人工智能和机器学习领域的最新研究论文",
    keywords:
      "artificial intelligence,machine learning,deep learning,neural networks",
  },
  {
    id: "robotics",
    name: "机器人与自动化",
    description: "机器人技术、自动化系统和控制理论研究",
    keywords: "robotics,automation,control systems,autonomous systems",
  },
  {
    id: "cognitive-science",
    name: "认知科学",
    description: "认知科学、神经科学和心理学研究",
    keywords: "cognitive science,neuroscience,psychology,mental health",
  },
  {
    id: "quantum-computing",
    name: "量子计算",
    description: "量子计算和量子信息科学研究",
    keywords: "quantum computing,quantum information,quantum algorithms",
  },
  {
    id: "climate-science",
    name: "气候科学",
    description: "气候变化、环境科学和可持续发展研究",
    keywords: "climate change,environmental science,sustainability",
  },
];

interface PaperPodProps {
  onSubmit: (content: PodSource) => Promise<void>;
  isLoading: boolean;
}

export function PaperPod({ onSubmit, isLoading }: PaperPodProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [customKeywords, setCustomKeywords] = useState<string>("");

  const handleSubmit = async () => {
    if (!selectedTopic) return;

    const topic = researchTopics.find((t) => t.id === selectedTopic);
    if (!topic) return;

    const keywords = customKeywords
      ? `${topic.keywords},${customKeywords}`
      : topic.keywords;

    await onSubmit({
      type: "text",
      content: JSON.stringify({
        topicId: topic.id,
        keywords: keywords,
        name: topic.name,
        description: topic.description,
      }),
    });
  };

  return (
    <div className="grid w-full gap-4">
      <div className="flex items-center gap-2">
        <Icons.graduationCap className="h-5 w-5" />
        <span className="text-lg font-semibold">PaperPod</span>
      </div>
      <p className="text-sm text-muted-foreground">
        从 arXiv 获取最新研究论文并生成播客
      </p>
      <Select value={selectedTopic} onValueChange={setSelectedTopic}>
        <SelectTrigger>
          <SelectValue placeholder="选择研究领域" />
        </SelectTrigger>
        <SelectContent>
          {researchTopics.map((topic) => (
            <SelectItem key={topic.id} value={topic.id}>
              <div className="flex flex-col gap-1">
                <div>{topic.name}</div>
                <div className="text-xs text-muted-foreground">
                  {topic.description}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        placeholder="添加自定义关键词（可选，用逗号分隔）"
        value={customKeywords}
        onChange={(e) => setCustomKeywords(e.target.value)}
      />
      <Button
        onClick={handleSubmit}
        disabled={!selectedTopic || isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            正在生成科研播课...
          </>
        ) : (
          <>
            <Icons.sparkles className="mr-2 h-4 w-4" />
            生成科研播客
          </>
        )}
      </Button>
    </div>
  );
}
