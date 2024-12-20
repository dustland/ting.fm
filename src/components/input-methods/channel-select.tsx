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
  onChannelSubmit: (channel: Channel, customKeywords?: string) => void
}

export function ChannelSelect({ onChannelSubmit }: ChannelSelectProps) {
  const [selectedChannel, setSelectedChannel] = useState<string>("")
  const [customKeywords, setCustomKeywords] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = () => {
    if (!selectedChannel) {
      setError("请选择一个频道")
      return
    }

    const channel = predefinedChannels.find((c) => c.id === selectedChannel)
    if (!channel) {
      setError("无效的频道")
      return
    }

    setError("")
    onChannelSubmit(channel, customKeywords.trim() || undefined)
  }

  return (
    <div className="space-y-4">
      <Select
        value={selectedChannel}
        onValueChange={(value) => {
          setSelectedChannel(value)
          setError("")
        }}
      >
        <SelectTrigger className={error ? "border-destructive" : ""}>
          <SelectValue placeholder="选择预设频道" />
        </SelectTrigger>
        <SelectContent>
          {predefinedChannels.map((channel) => (
            <SelectItem key={channel.id} value={channel.id}>
              <div className="flex flex-col space-y-1">
                <div className="font-medium">{channel.name}</div>
                <div className="text-xs text-muted-foreground">
                  {channel.description}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        placeholder="可选：添加自定义关键词，用逗号分隔"
        value={customKeywords}
        onChange={(e) => setCustomKeywords(e.target.value)}
      />

      <div className="flex justify-end">
        <Button onClick={handleSubmit}>
          <Icons.channel className="mr-2 h-4 w-4" />
          开始生成
        </Button>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
