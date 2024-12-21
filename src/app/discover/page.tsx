"use client"

import { useState } from "react"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface Pod {
  id: string
  title: string
  description: string
  duration: string
  createdAt: string
  tags: string[]
}

// 模拟数据
const mockPods: Pod[] = [
  {
    id: "1",
    title: "人工智能发展趋势分析",
    description: "探讨 AI 技术的最新发展和未来趋势，包括大语言模型、机器学习等领域的突破。",
    duration: "15:30",
    createdAt: "2024-12-20",
    tags: ["科技", "AI", "趋势分析"],
  },
  {
    id: "2",
    title: "心理健康：如何应对工作压力",
    description: "分享实用的压力管理技巧和心理调节方法，帮助你在工作中保持良好的心理状态。",
    duration: "20:45",
    createdAt: "2024-12-19",
    tags: ["心理健康", "职场", "压力管理"],
  },
  {
    id: "3",
    title: "创业公司融资策略",
    description: "详细解析创业公司在不同阶段的融资策略，包括风险投资、天使投资等多种方式。",
    duration: "25:15",
    createdAt: "2024-12-18",
    tags: ["创业", "融资", "商业"],
  },
]

export default function DiscoverPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isPlaying, setIsPlaying] = useState<string | null>(null)

  const filteredPods = mockPods.filter(
    (pod) =>
      pod.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pod.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pod.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  )

  const handlePlay = (id: string) => {
    setIsPlaying(id === isPlaying ? null : id)
    // TODO: 实现播放逻辑
  }

  const handleShare = (id: string) => {
    // TODO: 实现分享逻辑
  }

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">发现播客</h1>
            <p className="text-muted-foreground">
              探索由 AI 生成的精彩播客内容
            </p>
          </div>
          <Input
            type="search"
            placeholder="搜索播客..."
            className="max-w-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPods.map((pod) => (
            <Card key={pod.id}>
              <CardHeader>
                <CardTitle>{pod.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {pod.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {pod.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Icons.clock className="h-4 w-4" />
                  <span>{pod.duration}</span>
                  <span>•</span>
                  <span>{pod.createdAt}</span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePlay(pod.id)}
                  >
                    {isPlaying === pod.id ? (
                      <Icons.pause className="h-4 w-4" />
                    ) : (
                      <Icons.play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleShare(pod.id)}
                  >
                    <Icons.share className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
