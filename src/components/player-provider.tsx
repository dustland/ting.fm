"use client";

import { usePathname } from "next/navigation";
import { usePlayerStore } from "@/store/player";
import { FloatingPlayer } from "@/components/player";

export function PlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { currentPod } = usePlayerStore();
  const isPodDetailPage = pathname.startsWith("/pods/");

  return (
    <>
      {children}
      {currentPod && <FloatingPlayer pod={currentPod} />}
    </>
  );
}
