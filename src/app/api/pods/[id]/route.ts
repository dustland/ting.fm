import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, getUser } from "@/lib/supabase/server";

const podSchema = z.object({
  title: z.string(),
  url: z.string().optional(),
  source: z
    .object({
      type: z.enum(["url", "file", "text", "paper"]),
      content: z.string(),
      metadata: z
        .object({
          favicon: z.string().optional(),
          title: z.string(),
          image: z.string().optional(),
          authors: z.array(z.string()).optional(),
          summary: z.string().optional(),
          link: z.string().optional(),
          categories: z.array(z.string()).optional(),
          wordCount: z.number().optional(),
          siteName: z.string().optional(),
          readingTime: z.number().optional(),
          createdAt: z.string().optional(),
          updatedAt: z.string().optional(),
          pdfLink: z.string().optional(),
          doi: z.string().optional(),
          journal: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  dialogues: z
    .array(
      z.object({
        id: z.string(),
        host: z.string(),
        content: z.string(),
        audioUrl: z.string().optional(),
      })
    )
    .optional(),
  audioUrl: z.string().optional(),
  status: z.enum(["draft", "ready", "published"]).optional(),
});

// GET /api/pods/[id]
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const user = await getUser();
    const resolvedParams = await params;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: pod, error } = await supabase
      .from("pods")
      .select("*")
      .eq("id", resolvedParams.id)
      .eq("user_id", user.id)
      .single();

    if (error) throw error;
    if (!pod) {
      return NextResponse.json({ error: "Pod not found" }, { status: 404 });
    }
    console.log("pod", pod);

    // Convert snake_case to camelCase
    const formattedPod = {
      id: pod.id,
      title: pod.title,
      url: pod.url,
      source: pod.source,
      dialogues: pod.dialogues || [],
      audioUrl: pod.audio_url,
      createdAt: pod.created_at,
      updatedAt: pod.updated_at,
      status: pod.status,
    };

    return NextResponse.json(formattedPod);
  } catch (error) {
    console.error("[POD_GET]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PATCH /api/pods/[id]
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const supabase = await createClient();
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: pod, error } = await supabase
      .from("pods")
      .update(body)
      .eq("id", id)
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
      source: pod.source,
      dialogues: pod.dialogues || [],
      audioUrl: pod.audio_url,
      createdAt: pod.created_at,
      updatedAt: pod.updated_at,
      status: pod.status,
    };

    return NextResponse.json(formattedPod);
  } catch (error) {
    console.error("[PATCH_POD]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE /api/pods/[id]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const user = await getUser();
    const resolvedParams = await params;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("pods")
      .delete()
      .eq("id", resolvedParams.id)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POD_DELETE]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
