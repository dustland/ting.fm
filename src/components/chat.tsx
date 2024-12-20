"use client";

import { useRef, useEffect } from "react";
import { useChat } from "@/hooks/use-chat";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/components/icons";
import { Message } from "ai";

interface ChatProps {
  format?: "text" | "podcast";
  initialMessage?: Message;
  onResponse?: (response: Response) => void;
  className?: string;
}

export function Chat({
  format = "text",
  initialMessage,
  onResponse,
  className,
}: ChatProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    append,
    setMessages,
  } = useChat({
    format,
    onResponse,
  });

  useEffect(() => {
    if (initialMessage) {
      setMessages([initialMessage]);
    }
  }, [initialMessage, setMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Card className={cn("flex h-[600px] flex-col", className)}>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={cn(
                "flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                message.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              {message.content}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icons.spinner className="h-4 w-4 animate-spin" />
              正在思考...
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-destructive">
              <Icons.error className="h-4 w-4" />
              {error.message}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-start gap-2 border-t p-4"
      >
        <Textarea
          rows={1}
          placeholder={
            format === "podcast" ? "输入内容，生成播客脚本..." : "输入消息..."
          }
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as any);
            }
          }}
          className="min-h-[44px] resize-none"
        />
        <Button type="submit" disabled={isLoading}>
          发送
        </Button>
      </form>
    </Card>
  );
}
