"use client"

import { useState } from "react"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CrawlRequest } from "@/app/api/crawl/route"

interface UrlInputProps {
  onSubmit: (content: string) => Promise<void>
  isLoading: boolean
}

export function UrlInput({ onSubmit, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!url) {
      setError("请输入 URL")
      return
    }

    try {
      // Validate URL format
      new URL(url)
      setError("")

      // Call API to crawl URL
      const response = await fetch("/api/crawl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
        } as CrawlRequest),
      })

      if (!response.ok) {
        throw new Error("API request failed")
      }

      const data = await response.json()
      await onSubmit(JSON.stringify(data))
    } catch (err) {
      if (err instanceof TypeError && err.message.includes("URL")) {
        setError("请输入有效的 URL")
      } else {
        setError("抓取网页内容时出错，请重试")
        console.error("Error crawling URL:", err)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Input
          type="url"
          placeholder="输入文章或博客的 URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
          className={error ? "border-destructive" : ""}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isLoading) {
              handleSubmit()
            }
          }}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
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
