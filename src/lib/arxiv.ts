import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

export interface ArxivPaper {
  id: string;
  title: string;
  authors: string[];
  summary: string;
  published: string;
  updated: string;
  link: string;
  pdfLink: string;
  categories: string[];
}

interface PdfResponse {
  text: string;
}

export class ArxivService {
  private parser: XMLParser;
  private baseUrl = "http://export.arxiv.org/api/query";

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });
  }

  async searchPapers(
    query: string,
    maxResults: number = 10
  ): Promise<ArxivPaper[]> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          search_query: `all:${query}`,
          start: "0",
          max_results: maxResults.toString(),
          sortBy: "submittedDate",
          sortOrder: "descending",
        },
      });

      const parsed = this.parser.parse(response.data);
      const entries = parsed.feed.entry;

      if (!entries) return [];

      const papers = (Array.isArray(entries) ? entries : [entries]).map(
        (entry: any) => ({
          id: entry.id,
          title: entry.title.replace(/\n/g, " ").trim(),
          authors: Array.isArray(entry.author)
            ? entry.author.map((a: any) => a.name)
            : [entry.author.name],
          summary: entry.summary.replace(/\n/g, " ").trim(),
          published: entry.published,
          updated: entry.updated,
          link: entry.id,
          pdfLink: Array.isArray(entry.link)
            ? entry.link.find((l: any) => l["@_title"] === "pdf")?.["@_href"]
            : entry.link["@_href"],
          categories: Array.isArray(entry.category)
            ? entry.category.map((c: any) => c["@_term"])
            : [entry.category["@_term"]],
        })
      );

      return papers;
    } catch (error) {
      console.error("Error fetching papers from arXiv:", error);
      throw error;
    }
  }

  async getPaperSource(id: string): Promise<string> {
    // Convert arXiv URL to source URL
    // Example: https://arxiv.org/pdf/2312.12456.pdf -> https://arxiv.org/e-print/2312.12456
    const paperId = id
      .replace(/^(https?:\/\/)?arxiv\.org\/(?:pdf|abs)\//, "")
      .replace(".pdf", "");
    const sourceUrl = `https://arxiv.org/e-print/${paperId}`;

    try {
      const response = await fetch(sourceUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch paper source: ${response.statusText}`);
      }

      // ArXiv returns the source in tar.gz format
      const sourceData = await response.arrayBuffer();

      // For now, we'll use the PDF version as fallback
      // In a production environment, we should:
      // 1. Extract the tar.gz
      // 2. Find the main .tex file
      // 3. Parse the LaTeX content
      // 4. Convert to plain text while maintaining structure
      const pdfUrl = `https://arxiv.org/pdf/${paperId}.pdf`;
      return this.extractPdfContent(pdfUrl);
    } catch (error) {
      console.error("Error fetching paper source:", error);
      throw error;
    }
  }

  async extractPdfContent(pdfUrl: string): Promise<string> {
    try {
      const response = await fetch("/api/scrape/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ url: pdfUrl }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error(`Invalid response type: ${contentType}`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to extract PDF content");
      }

      return data.text || "";
    } catch (error) {
      console.error("Error extracting PDF content:", error);
      throw error;
    }
  }
}
