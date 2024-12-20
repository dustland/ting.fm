"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onSubmit: (content: string) => Promise<void>
  isLoading: boolean
  onFileSelect?: (file: File) => void
  accept?: Record<string, string[]>
  maxSize?: number
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
  const [error, setError] = useState<string>("")

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        if (file.size > maxSize) {
          setError("文件太大，请上传小于 5MB 的文件")
          return
        }
        try {
          const text = await file.text()
          await onSubmit(text)
        } catch (err) {
          setError("读取文件失败，请重试")
        }
        if (onFileSelect) {
          onFileSelect(file)
        }
      }
    },
    [maxSize, onSubmit, onFileSelect]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    multiple: false,
  })

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
      <input {...getInputProps()} />
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
      {isLoading ? (
        <>
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          处理中...
        </>
      ) : (
        "开始创作"
      )}
    </div>
  )
}
