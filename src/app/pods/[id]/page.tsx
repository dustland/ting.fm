"use client"

import { useParams } from "next/navigation"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function PodcastPage() {
  const params = useParams()
  const { toast } = useToast()
  const id = params.id as string

  const handleGenerate = async () => {
    toast({
      title: "开始生成",
      description: "正在将内容转换为播客音频...",
    })
    // TODO: Implement audio generation logic
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">播客预览</h1>
          <Button onClick={handleGenerate}>
            <Icons.audio className="mr-2 h-4 w-4" />
            生成音频
          </Button>
        </div>
        <Card className="p-6">
          {/* TODO: Add podcast preview and editing interface */}
          <p className="text-muted-foreground">播客 ID: {id}</p>
        </Card>
      </div>
    </div>
  )
}
