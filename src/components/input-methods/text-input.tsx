"use client"

import { useState } from "react"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface TextInputProps {
  onTextSubmit: (text: string) => void
}

export function TextInput({ onTextSubmit }: TextInputProps) {
  const [text, setText] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = () => {
    if (!text.trim()) {
      setError("请输入内容")
      return
    }

    if (text.length < 50) {
      setError("内容太短，请至少输入 50 个字符")
      return
    }

    setError("")
    onTextSubmit(text)
  }

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="输入或粘贴文本内容"
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setError("")
        }}
        className={`min-h-[200px] ${error ? "border-destructive" : ""}`}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          已输入 {text.length} 个字符
        </p>
        <Button onClick={handleSubmit}>
          <Icons.text className="mr-2 h-4 w-4" />
          生成播客
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
