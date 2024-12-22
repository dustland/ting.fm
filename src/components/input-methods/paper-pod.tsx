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
  value: string;
  label: string;
  description: string;
  keywords: string;
}

const researchTopics: ResearchTopic[] = [
  {
    value: "psychology",
    label: "心理学",
    description: "心理学、认知科学和行为研究",
    keywords: "psychology,cognitive science,behavioral science",
  },
  {
    value: "ai-ml",
    label: "AI & 机器学习",
    description: "人工智能和机器学习领域的最新研究论文",
    keywords:
      "artificial intelligence,machine learning,deep learning,neural networks",
  },
  {
    value: "robotics",
    label: "机器人与自动化",
    description: "机器人技术、自动化系统和控制理论研究",
    keywords: "robotics,automation,control systems,mechatronics",
  },
  {
    value: "cognitive-science",
    label: "认知科学",
    description: "认知科学、神经科学和心理学研究",
    keywords: "cognitive science,neuroscience,psychology",
  },
  {
    value: "quantum-computing",
    label: "量子计算",
    description: "量子计算和量子信息科学研究",
    keywords: "quantum computing,quantum information,quantum mechanics",
  },
  {
    value: "other",
    label: "其他",
    description: "其他领域的最新研究论文",
    keywords: "",
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

    const topic = researchTopics.find((t) => t.value === selectedTopic);
    if (!topic) return;

    const keywords = customKeywords || topic.keywords;
    await onSubmit({
      type: "text",
      content: JSON.stringify({
        topicId: topic.value,
        keywords: keywords,
        name: topic.label,
        description: topic.description,
      }),
    });
  };

  return (
    <div className="grid w-full gap-4">
      <p className="text-sm text-muted-foreground">
        从 arXiv 获取最新研究论文并生成播客
      </p>
      <Select value={selectedTopic} onValueChange={setSelectedTopic}>
        <SelectTrigger className="h-20 text-left">
          <SelectValue placeholder="选择研究领域">
            {selectedTopic && (
              <div className="flex flex-col">
                <div className="font-medium">
                  {researchTopics.find((t) => t.value === selectedTopic)?.label}
                </div>
                <div className="text-sm text-muted-foreground">
                  {
                    researchTopics.find((t) => t.value === selectedTopic)
                      ?.description
                  }
                </div>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {researchTopics.map((topic) => (
            <SelectItem key={topic.value} value={topic.value} className="py-3">
              <div>
                <div className="font-medium">{topic.label}</div>
                <div className="text-sm text-muted-foreground">
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
