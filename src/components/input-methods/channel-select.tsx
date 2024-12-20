"use client"

import { useState } from "react"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface Channel {
  id: string
  name: string
  description: string
  keywords: string
}

const predefinedChannels: Channel[] = [
  {
    id: "mental-health",
    name: "心理健康",
    description: "关注心理健康和个人成长的文章和研究",
    keywords: "心理健康,压力管理,情绪调节,心理咨询",
  },
  {
    id: "tech-news",
    name: "科技新闻",
    description: "最新的科技新闻和趋势分析",
    keywords: "人工智能,科技创新,数字化转型,互联网",
  },
  {
    id: "business",
    name: "商业资讯",
    description: "商业新闻和市场分析",
    keywords: "创业,投资,市场分析,商业战略",
  },
]

interface ChannelSelectProps {
  onSubmit: (content: string) => Promise<void>
  isLoading: boolean
}

export function ChannelSelect({ onSubmit, isLoading }: ChannelSelectProps) {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [customKeywords, setCustomKeywords] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!selectedChannel) {
      setError("请选择一个频道")
      return
    }

    try {
      const content = JSON.stringify({
        channel: selectedChannel,
        customKeywords: customKeywords.trim() || undefined,
      })
      await onSubmit(content)
    } catch (err) {
      setError("处理内容时出错，请重试")
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Select
          onValueChange={(value) => {
            const channel = predefinedChannels.find((c) => c.id === value)
            setSelectedChannel(channel || null)
            setError("")
          }}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="选择一个频道" />
          </SelectTrigger>
          <SelectContent>
            {predefinedChannels.map((channel) => (
              <SelectItem key={channel.id} value={channel.id}>
                {channel.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedChannel && (
          <div className="rounded-md bg-muted p-4">
            <p className="text-sm font-medium">{selectedChannel.description}</p>
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">
                默认关键词：{selectedChannel.keywords}
              </p>
            </div>
          </div>
        )}

        <Input
          placeholder="添加自定义关键词（可选，用逗号分隔）"
          value={customKeywords}
          onChange={(e) => setCustomKeywords(e.target.value)}
          disabled={!selectedChannel || isLoading}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!selectedChannel || isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            处理中...
          </>
        ) : (
          "开始创作"
        )}
      </Button>
    </div>
  )
}
