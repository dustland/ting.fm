"use client"

import { useState } from "react"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea";
import { PodSource } from "@/store/pod";

interface TextInputProps {
  onSubmit: (content: PodSource) => Promise<void>;
  isLoading: boolean;
}

export function TextInput({ onSubmit, isLoading }: TextInputProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError("请输入内容");
      return;
    }

    if (text.length < 50) {
      setError("内容太短，请至少输入 50 个字符");
      return;
    }

    try {
      setError("");
      await onSubmit({
        type: "text",
        metadata: {
          title: text.slice(0, 20),
          description: text.slice(0, 100),
        },
        content: text,
      });
    } catch (err) {
      setError("处理内容时出错，请重试");
      console.error("Error processing text:", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder="输入或粘贴文本内容"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading}
          className="min-h-[200px] resize-none"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <p className="text-xs text-muted-foreground">
          已输入 {text.length} 个字符
        </p>
      </div>

      <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            处理中...
          </>
        ) : (
          "开始创作"
        )}
      </Button>
    </div>
  );
}
