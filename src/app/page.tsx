import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-center justify-center space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold sm:text-5xl">
            欢迎使用 Ting.fm
          </h1>
          <p className="text-muted-foreground">
            使用 AI 生成高质量的播客内容
          </p>
        </div>
        <div className="w-full max-w-md space-y-4">
          <Button asChild className="w-full">
            <Link href="/create">
              <Icons.create className="mr-2 h-4 w-4" />
              开始创建
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/discover">
              <Icons.discover className="mr-2 h-4 w-4" />
              发现内容
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <Icons.upload className="h-8 w-8 mb-2" />
            <CardTitle>多种输入方式</CardTitle>
            <CardDescription>支持文件、链接、文本和预设频道等多种输入方式</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Icons.text className="h-8 w-8 mb-2" />
            <CardTitle>智能生成</CardTitle>
            <CardDescription>使用先进的 AI 技术，生成自然流畅的播客脚本</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Icons.share className="h-8 w-8 mb-2" />
            <CardTitle>分享与发现</CardTitle>
            <CardDescription>轻松分享和发现有趣的播客内容</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
