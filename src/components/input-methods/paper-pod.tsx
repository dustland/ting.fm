"use client";

import { useState } from "react";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PodSource } from "@/store/pod";
import { ArxivService, type ArxivPaper } from "@/lib/arxiv";

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
  const [papers, setPapers] = useState<ArxivPaper[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<ArxivPaper | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!selectedTopic) return;

    const topic = researchTopics.find((t) => t.value === selectedTopic);
    if (!topic) return;

    try {
      setIsSearching(true);
      const arxiv = new ArxivService();
      const keywords = customKeywords || topic.keywords;
      const results = await arxiv.searchPapers(keywords, 5);
      setPapers(results);
      if (results.length > 0) {
        setSelectedPaper(results[0]);
      }
    } catch (error) {
      console.error("Failed to fetch papers:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPaper) return;

    await onSubmit({
      type: "paper",
      content: JSON.stringify({
        paper: selectedPaper,
        topicId: selectedTopic,
      }),
      metadata: {
        title: selectedPaper.title,
        authors: selectedPaper.authors,
        summary: selectedPaper.summary,
        link: selectedPaper.link,
        pdfLink: selectedPaper.pdfLink,
        createdAt: selectedPaper.published,
        updatedAt: selectedPaper.updated,
        categories: selectedPaper.categories,
      },
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

      {selectedTopic && (
        <>
          <Input
            placeholder="添加自定义关键词（可选，用逗号分隔）"
            value={customKeywords}
            onChange={(e) => setCustomKeywords(e.target.value)}
          />

          <Button
            variant="secondary"
            className="w-full"
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                搜索论文中...
              </>
            ) : (
              <>
                <Icons.search className="mr-2 h-4 w-4" />
                搜索相关论文
              </>
            )}
          </Button>
        </>
      )}

      {papers.length > 0 && (
        <div className="space-y-4">
          <div className="text-sm font-medium">找到以下相关论文：</div>
          <Select
            value={selectedPaper?.id}
            onValueChange={(id) =>
              setSelectedPaper(papers.find((p) => p.id === id) || null)
            }
          >
            <SelectTrigger className="h-auto text-left py-2">
              <SelectValue placeholder="选择要转换的论文">
                {selectedPaper && (
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="font-medium line-clamp-2 break-words">
                      {selectedPaper.title}
                    </div>
                    <div className="text-sm text-muted-foreground break-words">
                      作者：{selectedPaper.authors.slice(0, 3).join(", ")}
                      {selectedPaper.authors.length > 3 &&
                        ` 等${selectedPaper.authors.length}位作者`}
                    </div>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="w-[var(--radix-select-trigger-width)] max-w-full">
              {papers.map((paper) => (
                <SelectItem
                  key={paper.id}
                  value={paper.id}
                  className="py-3"
                >
                  <div className="flex flex-col gap-1 min-w-0 max-w-full">
                    <div className="font-medium line-clamp-2 break-words">
                      {paper.title}
                    </div>
                    <div className="text-sm text-muted-foreground break-words">
                      作者：{paper.authors.slice(0, 3).join(", ")}
                      {paper.authors.length > 3 &&
                        ` 等${paper.authors.length}位作者`}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedPaper && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground line-clamp-4 break-words">
                {selectedPaper.summary}
              </div>
              <div className="text-sm text-muted-foreground">
                <div>
                  发布于：
                  {new Date(selectedPaper.published).toLocaleDateString()}
                </div>
                <div className="mt-1">
                  作者：{selectedPaper.authors.join("、")}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={isLoading || !selectedPaper}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            正在生成科研播课...
          </>
        ) : (
          <>
            <Icons.graduationCap className="mr-2 h-4 w-4" />
            生成科研播客
          </>
        )}
      </Button>
    </div>
  );
}
