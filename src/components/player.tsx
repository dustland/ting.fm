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
  const { currentPod, isVisible, hide } = usePlayerStore();
  const isPodDetailPage = pathname.startsWith("/pods/");
  const isSharePage = pathname.startsWith("/share/");

  // Don't show on pod detail pages or share pages
  if (isPodDetailPage || isSharePage) return null;

  // Don't show if not visible
  if (!isVisible) return null;

  // Don't show if no pod data
  if (!pod && !currentPod) return null;

  const activePod = pod || currentPod;
  if (!activePod?.audioUrl) return null;

  return <PodPlayer pod={activePod} variant="floating" onClose={hide} />;
}
