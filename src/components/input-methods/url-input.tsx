"use client"

import { useState } from "react"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface UrlInputProps {
  onUrlSubmit: (url: string) => void
}

export function UrlInput({ onUrlSubmit }: UrlInputProps) {
  const [url, setUrl] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = () => {
    if (!url) {
      setError("请输入 URL")
      return
    }

    try {
      new URL(url)
      setError("")
      onUrlSubmit(url)
    } catch {
      setError("请输入有效的 URL")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input
          type="url"
          placeholder="输入文章或视频的 URL"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value)
            setError("")
          }}
          className={error ? "border-destructive" : ""}
        />
        <Button onClick={handleSubmit}>
          <Icons.link className="mr-2 h-4 w-4" />
          提取内容
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
