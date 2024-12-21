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

export class ArxivService {
  private parser: XMLParser;
  private baseUrl = 'http://export.arxiv.org/api/query';

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });
  }

  async searchPapers(query: string, maxResults: number = 10): Promise<ArxivPaper[]> {
    const params = new URLSearchParams({
      search_query: `all:${query}`,
      start: '0',
      max_results: maxResults.toString(),
      sortBy: 'submittedDate',
      sortOrder: 'descending',
    });

    try {
      const response = await axios.get(`${this.baseUrl}?${params}`);
      const parsed = this.parser.parse(response.data);
      const entries = parsed.feed.entry;

      if (!entries) return [];

      const papers = (Array.isArray(entries) ? entries : [entries]).map((entry: any) => ({
        id: entry.id,
        title: entry.title.replace(/\n/g, ' ').trim(),
        authors: Array.isArray(entry.author) 
          ? entry.author.map((a: any) => a.name)
          : [entry.author.name],
        summary: entry.summary.replace(/\n/g, ' ').trim(),
        published: entry.published,
        updated: entry.updated,
        link: entry.id,
        pdfLink: Array.isArray(entry.link) 
          ? entry.link.find((l: any) => l['@_title'] === 'pdf')?.['@_href']
          : entry.link['@_href'],
        categories: Array.isArray(entry.category) 
          ? entry.category.map((c: any) => c['@_term'])
          : [entry.category['@_term']],
      }));

      return papers;
    } catch (error) {
      console.error('Error fetching papers from arXiv:', error);
      throw error;
    }
  }
}
