import { NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/supabase/server";

// GET /api/pods/[id]
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: pod, error } = await supabase
      .from("pods")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (error) throw error;
    if (!pod) {
      return NextResponse.json({ error: "Pod not found" }, { status: 404 });
    }

    // Convert snake_case to camelCase
    const formattedPod = {
      id: pod.id,
      title: pod.title,
      url: pod.url,
      source: pod.source,
      dialogues: pod.dialogues || [],
      createdAt: pod.created_at,
      updatedAt: pod.updated_at,
      status: pod.status,
    };

    return NextResponse.json(formattedPod);
  } catch (error) {
    console.error("[POD_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/pods/[id]
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("pods")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POD_DELETE]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH /api/pods/[id]
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updates = await req.json();

    const { data: pod, error } = await supabase
      .from("pods")
      .update(updates)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;
    if (!pod) {
      return NextResponse.json({ error: "Pod not found" }, { status: 404 });
    }

    // Convert snake_case to camelCase
    const formattedPod = {
      id: pod.id,
      title: pod.title,
      url: pod.url,
      source: pod.source,
      dialogues: pod.dialogues || [],
      createdAt: pod.created_at,
      updatedAt: pod.updated_at,
      status: pod.status,
    };

    return NextResponse.json(formattedPod);
  } catch (error) {
    console.error("[POD_UPDATE]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
