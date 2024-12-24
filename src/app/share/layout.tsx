import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { PlayerProvider } from "@/components/player-provider";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Ting.fm - 分享播客",
  description: "在 Ting.fm 上收听播客",
};

export default function ShareLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PlayerProvider>
      <div className={cn("min-h-screen bg-background")}>
        <main className="flex-1">{children}</main>
        <Toaster />
      </div>
    </PlayerProvider>
  );
}
