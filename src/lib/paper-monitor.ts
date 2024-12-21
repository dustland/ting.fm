import { ArxivService, ArxivPaper } from './arxiv';
import { createClient } from './supabase/client';

export interface MonitoredTopic {
  id: string;
  name: string;
  query: string;
  lastChecked: Date;
}

export class PaperMonitor {
  private arxivService: ArxivService;
  private supabase = createClient();

  constructor() {
    this.arxivService = new ArxivService();
  }

  async monitorTopic(topic: MonitoredTopic): Promise<ArxivPaper[]> {
    try {
      const papers = await this.arxivService.searchPapers(topic.query);
      
      // Store papers in database
      const { error } = await this.supabase
        .from('papers')
        .upsert(
          papers.map(paper => ({
            arxiv_id: paper.id,
            title: paper.title,
            authors: paper.authors,
            summary: paper.summary,
            published_date: paper.published,
            pdf_link: paper.pdfLink,
            topic_id: topic.id,
            processed: false,
          }))
        );

      if (error) throw error;

      // Update last checked timestamp
      await this.supabase
        .from('monitored_topics')
        .update({ last_checked: new Date().toISOString() })
        .eq('id', topic.id);

      return papers;
    } catch (error) {
      console.error('Error monitoring papers:', error);
      throw error;
    }
  }

  async getTopPapers(topicId: string, limit: number = 10): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('papers')
      .select('*')
      .eq('topic_id', topicId)
      .eq('processed', false)
      .order('published_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
}
