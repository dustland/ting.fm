import { NextResponse } from "next/server";
import { Pod } from "@/store/pod";
import { createClient, getUser } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const user = await getUser();

    console.log("user", user);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: pods, error } = await supabase
      .from("pods")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Convert snake_case to camelCase
    const formattedPods = pods?.map((pod) => ({
      id: pod.id,
      title: pod.title,
      audioUrl: pod.audio_url,
      source: pod.source,
      dialogues: pod.dialogues || [],
      createdAt: pod.created_at,
      updatedAt: pod.updated_at,
      status: pod.status,
    }));

    return NextResponse.json(formattedPods);
  } catch (error) {
    console.error("[PODS_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pod = await req.json();
    console.log("creating pod", pod);

    // Convert camelCase to snake_case and add timestamps
    const now = new Date().toISOString();
    const dbPod = {
      title: pod.title,
      source: pod.source,
      dialogues: pod.dialogues || [],
      audio_url: pod.audioUrl,
      created_at: now,
      updated_at: now,
      status: pod.status || "draft",
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from("pods")
      .insert([dbPod])
      .select()
      .single();

    if (error) throw error;

    // Convert back to camelCase for response
    const formattedPod = {
      id: data.id,
      title: data.title,
      source: data.source,
      dialogues: data.dialogues || [],
      audioUrl: data.audio_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      status: data.status || "draft",
    };

    return NextResponse.json(formattedPod);
  } catch (error) {
    console.error("[PODS_POST]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const supabase = await createClient();
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, ...updates } = await req.json();

    // Convert camelCase to snake_case
    const dbUpdates = {
      ...(updates.title && { title: updates.title }),
      ...(updates.source && { source: updates.source }),
      ...(updates.dialogues && { dialogues: updates.dialogues }),
      ...(updates.audioUrl && { audio_url: updates.audioUrl }),
      ...(updates.status && { status: updates.status }),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("pods")
      .update(dbUpdates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    // Convert back to camelCase for response
    const formattedPod = {
      id: data.id,
      title: data.title,
      source: data.source,
      dialogues: data.dialogues || [],
      audioUrl: data.audio_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      status: data.status,
    };

    return NextResponse.json(formattedPod);
  } catch (error) {
    console.error("[PODS_PUT]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("pods")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PODS_DELETE]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
