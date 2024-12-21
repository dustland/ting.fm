import { useChat as useVercelChat, Message } from "ai/react";

interface UseChatOptions {
  format?: "text" | "podcast";
  onResponse?: (response: Response) => void;
  onError?: (error: Error) => void;
  onFinish?: (message: Message) => void;
}

export function useChat({
  format = "text",
  onFinish,
  onResponse,
  onError,
}: UseChatOptions = {}) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    append,
    reload,
    stop,
    setMessages,
  } = useVercelChat({
    api: "/api/chat",
    body: {
      format,
    },
    onResponse: (response) => {
      onResponse?.(response);
    },
    onError: (error) => {
      onError?.(error);
    },
    onFinish: (message) => {
      onFinish?.(message);
    },
  });

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    append,
    reload,
    stop,
    setMessages,
  };
}
