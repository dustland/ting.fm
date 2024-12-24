import { NextResponse } from 'next/server';
import { monitorTopic, getTopPapers } from '@/lib/paper-monitor';
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { topic, query } = await req.json();

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("monitored_topics")
      .insert({
        name: topic,
        query: query,
        last_checked: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Start monitoring immediately
    await monitorTopic({
      id: data.id,
      name: data.name,
      query: data.query,
      lastChecked: new Date(data.last_checked),
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error creating topic:", error);
    return NextResponse.json(
      { error: "Failed to create topic" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get('topicId');

    if (!topicId) {
      return NextResponse.json({ error: 'Topic ID is required' }, { status: 400 });
    }

    const papers = await getTopPapers(topicId);
    return NextResponse.json(papers);
  } catch (error) {
    console.error('Error fetching papers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch papers' },
      { status: 500 }
    );
  }
}
