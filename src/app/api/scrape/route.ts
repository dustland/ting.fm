import { NextRequest } from "next/server";
import FirecrawlApp from "@mendable/firecrawl-js";
import { Pod, PodSource } from "@/store/pod";
import { nanoid } from "nanoid";

if (!process.env.FIRECRAWL_API_KEY) {
  throw new Error("FIRECRAWL_API_KEY is not set");
}

const app = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY,
});

export interface CrawlRequest {
  url: string;
}

interface FirecrawlResponse {
  success: boolean;
  data: {
    markdown: string;
    html: string;
    metadata: {
      title: string;
      description: string;
      language: string;
      keywords: string;
      robots: string;
      ogTitle: string;
      ogDescription: string;
      ogUrl: string;
      ogImage: string;
      ogLocaleAlternate: string[];
      ogSiteName: string;
      sourceURL: string;
      statusCode: number;
    };
  }[];
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

    const crawlResponse = await app.crawlUrl(url, {
      limit: 100,
      scrapeOptions: {
        formats: ["markdown", "html"],
      },
    });

    if (!crawlResponse.success) {
      throw new Error(`Failed to crawl: ${crawlResponse.error}`);
    }

    // Ensure we have at least one document
    if (!crawlResponse.data || crawlResponse.data.length === 0) {
      throw new Error("No content found from the URL");
    }

    // Take the first document from the crawl results
    const firstDoc = crawlResponse.data[0];
    const markdown = firstDoc.markdown || "";
    const html = firstDoc.html || "";
    const metadata = firstDoc.metadata || {};

    const wordCount = countWords(markdown);
    const readingTime = estimateReadingTime(wordCount);

    const response: Pod = {
      id: nanoid(),
      title: metadata.ogTitle || metadata.title || "未知标题",
      dialogues: [],
      source: {
        type: "url",
        metadata: {
          title: metadata.ogTitle || metadata.title || "未知标题",
          description: metadata.ogDescription || metadata.description || "无描述",
          authors: [],
          url,
          siteName: metadata.ogSiteName || parsedUrl.hostname,
          favicon: `https://${parsedUrl.hostname}/favicon.ico`,
          image: metadata.ogImage,
          readingTime,
          wordCount,
        },
        content: markdown
          .replace(/\u0000/g, "") // Remove null characters
          .split("\n")
          .filter((line) => line.trim())
          .join("\n"),
      },
      createdAt: new Date().toISOString(),
      status: "draft",
    };

    return Response.json(response);
  } catch (error) {
    console.error("Error crawling URL:", error);
    return Response.json({ error: "抓取网页内容时发生错误" }, { status: 500 });
  }
}
