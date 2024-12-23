import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"
import { FloatingPlayer } from "@/components/player"; // Added import statement
import { cn } from "@/lib/utils"; // Added import statement

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
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
          <FloatingPlayer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
