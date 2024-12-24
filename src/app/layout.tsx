import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"
import { FloatingPlayer } from "@/components/player";
import { cn } from "@/lib/utils";

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
          <div className="relative isolate flex h-screen flex-col">
            <Navbar />
            <div className="relative flex-1 overflow-hidden">
              <div className="absolute inset-0 overflow-y-auto">
                <main className="min-h-full">{children}</main>
              </div>
            </div>
          </div>
          <FloatingPlayer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
