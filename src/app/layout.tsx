import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils";
import { PlayerProvider } from "@/components/player-provider";

export const metadata: Metadata = {
  title: "Ting.fm - Podcast AI",
  description: "使用AI生成高质量的播客内容",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PlayerProvider>
            <div className="relative isolate flex h-screen flex-col">
              <Navbar />
              <main className="h-[calc(100vh-var(--navbar-height))] overflow-y-auto">
                {children}
              </main>
            </div>
            <Toaster />
          </PlayerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
