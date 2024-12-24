import { Metadata } from "next";
import { notFound } from "next/navigation";
import { AudioPlayer } from "@/components/player";
import { createClient } from "@/lib/supabase/server";

interface SharePageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  try {
    const { data: pod } = await supabase
      .from("pods")
      .select("title")
      .eq("id", id)
      .single();

    if (!pod) {
      return {
        title: "播客 - Ting.fm",
        description: "在 Ting.fm 上收听播客",
      };
    }

    return {
      title: `${pod.title} - Ting.fm`,
      description: "在 Ting.fm 上收听播客",
    };
  } catch (error) {
    return {
      title: "播客 - Ting.fm",
      description: "在 Ting.fm 上收听播客",
    };
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  try {
    const { data: pod, error } = await supabase
      .from("pods")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !pod) {
      notFound();
    }

    const formattedPod = {
      id: pod.id,
      title: pod.title,
      audioUrl: pod.audio_url,
      status: pod.status,
      summary: pod.source?.metadata?.summary,
    };

    return (
      <div className="container max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="w-full max-w-2xl">
            <AudioPlayer pod={formattedPod} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("[SHARE_PAGE]", error);
    notFound();
  }
}
