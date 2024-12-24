"use client";

import { usePlayerStore } from "@/store/player";
import { FloatingPlayer } from "@/components/player";

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const { currentPod, isPlaying } = usePlayerStore();

  return (
    <>
      {children}
      {currentPod && isPlaying && <FloatingPlayer pod={currentPod} />}
    </>
  );
}
