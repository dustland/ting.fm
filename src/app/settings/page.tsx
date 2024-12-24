"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSettingStore } from "@/store/setting";
import { Icons } from "@/components/icons";

export default function SettingsPage() {
  const { podcastSettings, updatePodcastSettings, resetPodcastSettings } =
    useSettingStore();
  const { toast } = useToast();

  const handleReset = () => {
    resetPodcastSettings();
    toast({
      title: "设置已重置",
      description: "已恢复默认设置",
    });
  };

  const updateHost = (
    index: number,
    field: keyof (typeof podcastSettings.hosts)[0],
    value: string
  ) => {
    const newHosts = [...podcastSettings.hosts];
    newHosts[index] = {
      ...newHosts[index],
      [field]: value,
    };
    updatePodcastSettings({ hosts: newHosts });
  };

  return (
    <div className="container py-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">设置</h1>
        <Button variant="outline" onClick={handleReset}>
          <Icons.undo className="mr-2 h-4 w-4" />
          重置
        </Button>
      </div>

      <div className="space-y-6">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>输出语言</Label>
            <Select
              value={podcastSettings.outputLanguage}
              onValueChange={(value) =>
                updatePodcastSettings({ outputLanguage: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zh-CN">中文</SelectItem>
                <SelectItem value="en-US">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>主持风格</Label>
            <Select
              value={podcastSettings.hostStyle}
              onValueChange={(value) =>
                updatePodcastSettings({ hostStyle: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="轻松对话">轻松对话</SelectItem>
                <SelectItem value="专业讨论">专业讨论</SelectItem>
                <SelectItem value="深度探讨">深度探讨</SelectItem>
                <SelectItem value="娱乐闲聊">娱乐闲聊</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>对话时长 (分钟)</Label>
            <Select
              value={podcastSettings.duration.toString()}
              onValueChange={(value) =>
                updatePodcastSettings({ duration: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3分钟</SelectItem>
                <SelectItem value="5">5分钟</SelectItem>
                <SelectItem value="10">10分钟</SelectItem>
                <SelectItem value="15">15分钟</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>LLM 模型</Label>
            <Select
              value={podcastSettings.llmModel}
              onValueChange={(value: typeof podcastSettings.llmModel) =>
                updatePodcastSettings({ llmModel: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4 Optimized</SelectItem>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>TTS 模型</Label>
            <Select
              value={podcastSettings.ttsModel}
              onValueChange={(value: typeof podcastSettings.ttsModel) =>
                updatePodcastSettings({ ttsModel: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="doubao">豆包 TTS</SelectItem>
                <SelectItem value="tongyi">通义 TTS</SelectItem>
                <SelectItem value="openai">OpenAI TTS</SelectItem>
                <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <Label>主持人设置</Label>
          <div className="grid gap-4">
            {podcastSettings.hosts.map((host, index) => (
              <div key={host.id} className="grid gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>主持人 {index + 1} 名字</Label>
                  <Input
                    value={host.name}
                    onChange={(e) => updateHost(index, "name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>性别</Label>
                  <Select
                    value={host.gender}
                    onValueChange={(value: "male" | "female") =>
                      updateHost(index, "gender", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">男性</SelectItem>
                      <SelectItem value="female">女性</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>性格特点</Label>
                  <Input
                    value={host.personality}
                    onChange={(e) =>
                      updateHost(index, "personality", e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
