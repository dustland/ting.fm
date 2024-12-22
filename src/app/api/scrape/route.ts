import { NextRequest } from "next/server";
import { chromium } from "playwright";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import getMetaData from "metadata-scraper";

export interface CrawlRequest {
  url: string;
}

export interface CrawlResponse {
  title: string;
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
  const browser = await chromium.launch({
    headless: true,
  });

  try {
    // Create a new context and page with more realistic browser settings
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 800 },
      extraHTTPHeaders: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        DNT: "1",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        Pragma: "no-cache",
        "Cache-Control": "no-cache",
      },
    });

    const page = await context.newPage();

    // Add request interception for better error handling
    page.on("response", (response) => {
      if (response.status() === 403) {
        throw new Error(
          "Access denied by the website. The site might be blocking automated access."
        );
      }
    });

    // Navigate to the URL with timeout and wait until network is idle
    await page.goto(url, {
      timeout: 30000,
      waitUntil: "networkidle",
    });

    // Random delay to appear more human-like
    await page.waitForTimeout(Math.random() * 1000 + 1000);

    // Wait for the content to load
    await page.waitForLoadState("domcontentloaded");

    // Scroll to bottom gradually to trigger lazy loading
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve(true);
          }
        }, 100);
      });
    });

    await page.waitForTimeout(2000); // Wait for any lazy-loaded content

    const html = await page.content();

    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      throw new Error("Failed to extract content from URL");
    }

    return article;
  } finally {
    await browser.close();
  }
}

function estimateReadingTime(wordCount: number): number {
  const WORDS_PER_MINUTE = 200;
  return Math.ceil(wordCount / WORDS_PER_MINUTE);
}

function countWords(text: string): number {
  // Remove HTML tags and trim
  const cleanText = text.replace(/<[^>]*>/g, "").trim();

  // Count Chinese characters (including Japanese and Korean characters)
  const cjkCount = (
    cleanText.match(
      /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g
    ) || []
  ).length;

  // Count English words
  const englishWords = cleanText
    .replace(/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g, "") // Remove CJK characters
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  // Chinese characters count as one word each, add them to English word count
  return cjkCount + englishWords;
}

export async function POST(req: NextRequest) {
  try {
    const { url } = (await req.json()) as CrawlRequest;
    const parsedUrl = new URL(url);

    // Get metadata using metadata-scraper
    const metadata = await getMetaData(url);

    // Extract content using Playwright and Readability
    const article = await extractContent(url);

    // Calculate word count and reading time
    const wordCount = countWords(article.textContent);
    const readingTime = estimateReadingTime(wordCount);
    const title = article.title || metadata.title || "未知标题";

    const response: CrawlResponse = {
      title,
      metadata: {
        title,
        description: article.excerpt || metadata.description || "无描述",
        author: metadata.author
          ? Array.isArray(metadata.author)
            ? metadata.author.join(", ")
            : metadata.author
          : article.byline || undefined,
        publishDate: metadata.published
          ? Array.isArray(metadata.published)
            ? metadata.published[0]
            : metadata.published
          : undefined,
        url,
        siteName: (
          article.siteName ||
          metadata.publisher ||
          parsedUrl.hostname
        )?.toString(),
        favicon: metadata.icon || `https://${parsedUrl.hostname}/favicon.ico`,
        image: metadata.image,
        readingTime,
        wordCount,
      },
      content: article.textContent
        .replace(/\u0000/g, "") // Remove null characters
        .split("\n")
        .filter((line) => line.trim())
        .join("\n"),
    };

    return Response.json(response);
  } catch (error) {
    console.error("Error crawling URL:", error);
    return Response.json({ error: "抓取网页内容时发生错误" }, { status: 500 });
  }
}
