"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"
import { PodSource } from "@/store/pod";
import { toast } from "@/hooks/use-toast";

interface FileUploadProps {
  onSubmit: (title: string, source: PodSource) => Promise<void>;
  isLoading: boolean;
  onFileSelect?: (file: File) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
}

export function FileUpload({
  onSubmit,
  isLoading,
  onFileSelect,
  accept = {
    "text/plain": [".txt"],
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
      ".docx",
    ],
  },
  maxSize = 5242880, // 5MB
}: FileUploadProps) {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      let text = "";

      // Handle different file types
      if (file.type === "application/pdf") {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/extract-pdf", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to extract PDF text");
        }

        const data = await response.json();
        text = data.text;
      } else if (
        file.type === "application/msword" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/extract-doc", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to extract DOC text");
        }

        const data = await response.json();
        text = data.text;
      } else {
        // For txt and other text-based files
        text = await file.text();
      }

      await onSubmit(file.name.slice(0, 20), {
        type: "file",
        content: text,
        metadata: {
          title: file.name,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }
      });
    } catch (error) {
      toast({
        title: "错误",
        description: "文件上传失败，请重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file.size > maxSize) {
        setError("文件太大，请上传小于 5MB 的文件");
        return;
      }

      try {
        let content = '';

        // Handle different file types
        if (file.type === 'application/pdf') {
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch('/api/extract-pdf', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error('Failed to extract PDF text');
          }
          
          const data = await response.json();
          content = data.text;
        } else if (file.type === 'application/msword' || 
                  file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch('/api/extract-doc', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error('Failed to extract DOC text');
          }
          
          const data = await response.json();
          content = data.text;
        } else {
          // For txt and other text-based files
          content = await file.text();
        }

        await onSubmit(file.name.slice(0, 20), {
          type: "file",
          content: content, 
          metadata: {
            title: file.name,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          }
        });

        if (onFileSelect) {
          onFileSelect(file);
        }
      } catch (err) {
        console.error(err);
        setError("读取文件失败，请重试");
      }
    },
    [maxSize, onSubmit, onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center hover:bg-accent/50 cursor-pointer",
        isDragActive && "border-primary bg-accent",
        error && "border-destructive",
        isLoading && "opacity-50 pointer-events-none"
      )}
    >
      <input
        {...getInputProps()}
        type="file"
        onChange={handleFileChange}
        accept=".txt,.pdf,.doc,.docx"
        className="hidden"
      />
      <Icons.upload
        className={cn(
          "mb-4 h-8 w-8",
          isDragActive && "text-primary",
          error && "text-destructive"
        )}
      />
      <div className="space-y-2">
        <p className="text-sm font-medium">
          {isDragActive ? "放开以上传文件" : "拖放文件到此处或点击上传"}
        </p>
        <p className="text-xs text-muted-foreground">
          支持 PDF、DOC、DOCX、TXT 格式，最大 5MB
        </p>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
      {isLoading || loading ? (
        <>
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          处理中...
        </>
      ) : (
        "开始创作"
      )}
    </div>
  );
}
