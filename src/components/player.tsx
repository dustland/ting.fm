"use client";

import { usePlayerStore } from "@/store/player";
import { usePathname } from "next/navigation";
import { Pod } from "@/store/pod";
import { PodPlayer } from "@/components/pod-player";

interface PlayerProps {
  pod: Pod;
}

export function FloatingPlayer({ pod }: PlayerProps) {
  const pathname = usePathname();
  const { isPlaying, hide } = usePlayerStore();
  const isSharePage = pathname.startsWith("/share/");

  // Don't show if no pod data
  if (!pod?.audioUrl) return null;

  // Don't show if not playing
  if (!isPlaying) return null;

  // Don't show on pod detail pages or share pages
  if (isSharePage) return null;

  return <PodPlayer pod={pod} variant="floating" onClose={hide} />;
}
