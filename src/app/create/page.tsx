"use client"

import { useState } from "react"
import { Icons } from "@/components/icons"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUpload } from "@/components/input-methods/file-upload"
import { UrlInput } from "@/components/input-methods/url-input"
import { TextInput } from "@/components/input-methods/text-input"
import { ChannelSelect } from "@/components/input-methods/channel-select"
import { useToast } from "@/hooks/use-toast"

export default function CreatePage() {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)

  const handleFileSelect = async (file: File) => {
    setIsGenerating(true)
    try {
      // TODO: 实现文件上传和内容生成逻辑
      toast({
        title: "文件已上传",
        description: `正在处理文件：${file.name}`,
      })
    } catch (error) {
      toast({
        title: "上传失败",
        description: "处理文件时出错，请重试",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUrlSubmit = async (url: string) => {
    setIsGenerating(true)
    try {
      // TODO: 实现 URL 内容提取和生成逻辑
      toast({
        title: "URL 已提交",
        description: "正在提取内容并生成播客",
      })
    } catch (error) {
      toast({
        title: "处理失败",
        description: "提取 URL 内容时出错，请重试",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTextSubmit = async (text: string) => {
    setIsGenerating(true)
    try {
      // TODO: 实现文本内容生成逻辑
      toast({
        title: "文本已提交",
        description: "正在生成播客内容",
      })
    } catch (error) {
      toast({
        title: "生成失败",
        description: "处理文本时出错，请重试",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleChannelSubmit = async (
    channel: { id: string; name: string; keywords: string },
    customKeywords?: string
  ) => {
    setIsGenerating(true)
    try {
      // TODO: 实现频道内容生成逻辑
      toast({
        title: "频道已选择",
        description: `正在从"${channel.name}"频道生成内容`,
      })
    } catch (error) {
      toast({
        title: "生成失败",
        description: "处理频道内容时出错，请重试",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">创建播客</h1>
          <p className="text-muted-foreground">
            选择输入方式，我们将帮您生成高质量的播客内容
          </p>
        </div>

        <Tabs defaultValue="file" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="file" disabled={isGenerating}>
              <Icons.upload className="mr-2 h-4 w-4" />
              文件
            </TabsTrigger>
            <TabsTrigger value="url" disabled={isGenerating}>
              <Icons.link className="mr-2 h-4 w-4" />
              链接
            </TabsTrigger>
            <TabsTrigger value="text" disabled={isGenerating}>
              <Icons.text className="mr-2 h-4 w-4" />
              文本
            </TabsTrigger>
            <TabsTrigger value="channel" disabled={isGenerating}>
              <Icons.channel className="mr-2 h-4 w-4" />
              频道
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-4">
            <FileUpload onFileSelect={handleFileSelect} />
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <UrlInput onUrlSubmit={handleUrlSubmit} />
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <TextInput onTextSubmit={handleTextSubmit} />
          </TabsContent>

          <TabsContent value="channel" className="space-y-4">
            <ChannelSelect onChannelSubmit={handleChannelSubmit} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
