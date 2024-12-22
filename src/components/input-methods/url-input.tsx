"use client"

import { useState } from "react"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CrawlRequest } from "@/app/api/scrape/route"
import { PodSource } from "@/store/pod";

interface UrlInputProps {
  onSubmit: (title: string, source: PodSource) => Promise<void>;
  isLoading: boolean;
}

export function UrlInput({ onSubmit, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState(
    "https://www.bbc.com/news/articles/cp319jx719po"
  );
  const [error, setError] = useState("");
  const [isCrawling, setIsCrawling] = useState(false);

  const handleSubmit = async () => {
    if (!url) {
      setError("请输入 URL");
      return;
    }

    try {
      // Validate URL format
      new URL(url);
      setError("");
      setIsCrawling(true);

      // Call API to crawl URL
      const response = await fetch("/api/scrape", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
        } as CrawlRequest),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();
      await onSubmit(data.title, data);
    } catch (err) {
      if (err instanceof TypeError && err.message.includes("URL")) {
        setError("请输入有效的 URL");
      } else {
        setError("抓取网页内容时出错，请重试");
        console.error("Error crawling URL:", err);
      }
    } finally {
      setIsCrawling(false);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center space-y-2 min-h-32">
        <Input
          type="url"
          placeholder="输入文章或博客的 URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
          className={error ? "border-destructive" : ""}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isLoading) {
              handleSubmit();
            }
          }}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isLoading || isCrawling}
        className="w-full"
      >
        {isCrawling || isLoading ? (
          <>
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            正在抓取网页内容...
          </>
        ) : (
          "开始创作"
        )}
      </Button>
    </div>
  );
}
