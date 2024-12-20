import { NextRequest } from "next/server";
import { chromium } from "playwright";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import getMetaData from "metadata-scraper";

export interface CrawlRequest {
  url: string;
  settings?: {
    outputLanguage: string;
    hostStyle: string;
    llmModel: string;
    ttsModel: string;
    characters: Array<{
      name: string;
      title: string;
      gender: "男性" | "女性";
      voice?: string;
    }>;
  };
}

export interface CrawlResponse {
  id: string;
  metadata: {
    title: string;
    description: string;
    author?: string;
    publishDate?: string;
    url: string;
    siteName?: string;
    favicon?: string;
    image?: string;
    readingTime?: number;
    wordCount?: number;
  };
  content: string;
  script: Array<{
    role: string;
    content: string;
  }>;
}

interface ExtractedContent {
  title: string;
  content: string;
  textContent: string;
  length: number;
  excerpt: string;
  byline: string | null;
  dir: string;
  siteName: string | null;
  lang: string;
}

async function extractContent(url: string): Promise<ExtractedContent> {
  // Launch browser
  const browser = await chromium.launch({
    headless: true,
  });

  try {
    // Create a new context and page
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });
    const page = await context.newPage();

    // Navigate to the URL with timeout and wait until network is idle
    await page.goto(url, {
      timeout: 30000,
      waitUntil: "networkidle",
    });

    // Wait for the content to load
    await page.waitForLoadState("domcontentloaded");

    // Scroll to bottom to trigger lazy loading
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000); // Wait for any lazy-loaded content

    // Get the page content
    const html = await page.content();

    // Parse the HTML content with Readability
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      throw new Error("Failed to parse article content");
    }

    return {
      title: article.title,
      content: article.content,
      textContent: article.textContent,
      length: article.length,
      excerpt: article.excerpt,
      byline: article.byline,
      dir: article.dir,
      siteName: article.siteName,
      lang: article.lang || "en",
    };
  } finally {
    await browser.close();
  }
}

function estimateReadingTime(wordCount: number): number {
  const WORDS_PER_MINUTE = 200;
  return Math.ceil(wordCount / WORDS_PER_MINUTE);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CrawlRequest;
    const url = new URL(body.url);

    // Get metadata using metadata-scraper
    const metadata = await getMetaData(body.url);

    // Extract content using Playwright and Readability
    const article = await extractContent(body.url);

    // Calculate word count and reading time
    const wordCount = article.textContent.trim().split(/\s+/).length;
    const readingTime = estimateReadingTime(wordCount);

    // Get settings from user's preferences if not provided
    const settings = body.settings || {
      outputLanguage: "zh",
      hostStyle: "默认风格",
      llmModel: "Qwen2.5 72B",
      ttsModel: "Doubao TTS",
      characters: [
        {
          name: "主持人",
          title: "AI 播客主持人",
          gender: "男性",
        },
      ],
    };

    // TODO: Replace with actual AI script generation
    // This is just a mock response for now
    const response: CrawlResponse = {
      id: "test-" + Date.now(),
      metadata: {
        title: article.title || metadata.title || "未知标题",
        description: article.excerpt || metadata.description || "无描述",
        author: metadata.author
          ? (Array.isArray(metadata.author)
              ? metadata.author.join(", ") || "未知作者"
              : metadata.author)
          : article.byline || "未知作者",
        publishDate: metadata.published
          ? (Array.isArray(metadata.published)
              ? metadata.published[0]
              : metadata.published)
          : undefined,
        url: body.url,
        siteName: (article.siteName || metadata.publisher || url.hostname)?.toString() || undefined,
        favicon: metadata.icon || `https://${url.hostname}/favicon.ico`,
        image: metadata.image,
        readingTime,
        wordCount,
      },
      content: article.textContent,
      script: [
        {
          role: "主持人",
          content: `大家好，欢迎收听本期播客。今天我们要分享一篇来自 ${
            article.siteName || metadata.publisher || url.hostname
          } 的文章《${
            article.title || metadata.title || "未知标题"
          }》。这篇文章大约需要 ${readingTime} 分钟阅读。`,
        },
        {
          role: "主持人",
          content:
            article.excerpt ||
            metadata.description ||
            "这篇文章非常有趣，让我们一起来了解一下。",
        },
        {
          role: "主持人",
          content: "感谢收听，我们下期再见。",
        },
      ],
    };

    return Response.json(response);
  } catch (error) {
    console.error("Error crawling URL:", error);
    return Response.json({ error: "抓取网页内容时发生错误" }, { status: 500 });
  }
}
