import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/pods/discover
export async function GET(req: Request) {
  try {
    const supabase = await createClient();

    const { data: pods, error } = await supabase
      .from("published_pods")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Convert snake_case to camelCase
    const formattedPods = pods.map((pod) => ({
      id: pod.id,
      title: pod.title,
      source: pod.source,
      dialogues: pod.dialogues || [],
      audioUrl: pod.audio_url,
      createdAt: pod.created_at,
      updatedAt: pod.updated_at,
      status: pod.status,
    }));

    return NextResponse.json(formattedPods);
  } catch (error) {
    console.error("[GET_DISCOVER_PODS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
