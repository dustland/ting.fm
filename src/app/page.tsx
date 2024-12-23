"use client";

import { CreatePodCard } from "@/components/create-pod-card";

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex flex-col items-center p-2">
      <div className="w-full max-w-3xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 my-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Ting<span className="text-emerald-500">.</span>fm
          </h1>
          <p className="text-lg text-muted-foreground">
            从任何文本内容中生成生动的播客对话。
          </p>
        </div>

        {/* Create Pod Card */}
        <CreatePodCard />
      </div>
    </main>
  );
}
