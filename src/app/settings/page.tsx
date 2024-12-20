"use client";

import { useState } from "react";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Character {
  name: string;
  title: string;
  gender: "男性" | "女性";
  voice?: string;
}

interface Settings {
  outputLanguage: string;
  hostStyle: string;
  llmModel: string;
  ttsModel: string;
  characters: Character[];
}

const defaultSettings: Settings = {
  outputLanguage: "zh",
  hostStyle: "默认风格",
  llmModel: "Qwen2.5 72B",
  ttsModel: "Doubao TTS",
  characters: [
    {
      name: "马斯克",
      title: "著名科技企业家",
      gender: "男性",
    },
  ],
};

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const handleSave = () => {
    // TODO: Save settings to backend
    toast({
      title: "设置已保存",
      description: "您的偏好设置已更新",
    });
  };

  const addCharacter = () => {
    setSettings((prev) => ({
      ...prev,
      characters: [
        ...prev.characters,
        {
          name: "",
          title: "",
          gender: "男性",
        },
      ],
    }));
  };

  const removeCharacter = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      characters: prev.characters.filter((_, i) => i !== index),
    }));
  };

  const updateCharacter = (index: number, field: keyof Character, value: string) => {
    setSettings((prev) => ({
      ...prev,
      characters: prev.characters.map((char, i) =>
        i === index ? { ...char, [field]: value } : char
      ),
    }));
  };

  return (
    <div className="container py-10">
      <div className="flex flex-col space-y-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">设置</h1>
          <p className="text-muted-foreground">自定义您的播客生成偏好</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.settings className="h-5 w-5" />
              基础设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Icons.globe className="h-4 w-4" />
                  输出语言
                </Label>
                <Select
                  value={settings.outputLanguage}
                  onValueChange={(value) =>
                    setSettings((prev) => ({ ...prev, outputLanguage: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zh">中文</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Icons.podcast className="h-4 w-4" />
                  播客风格
                </Label>
                <Select
                  value={settings.hostStyle}
                  onValueChange={(value) =>
                    setSettings((prev) => ({ ...prev, hostStyle: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="默认风格">默认风格</SelectItem>
                    <SelectItem value="专业风格">专业风格</SelectItem>
                    <SelectItem value="轻松风格">轻松风格</SelectItem>
                    <SelectItem value="幽默风格">幽默风格</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Icons.bot className="h-4 w-4" />
                  LLM 模型
                </Label>
                <Select
                  value={settings.llmModel}
                  onValueChange={(value) =>
                    setSettings((prev) => ({ ...prev, llmModel: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Qwen2.5 72B">Qwen2.5 72B</SelectItem>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-4o">GPT-4 Optimized</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Icons.speaker className="h-4 w-4" />
                  TTS 模型
                </Label>
                <Select
                  value={settings.ttsModel}
                  onValueChange={(value) =>
                    setSettings((prev) => ({ ...prev, ttsModel: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Doubao TTS">Doubao TTS</SelectItem>
                    <SelectItem value="Azure TTS">Azure TTS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icons.users className="h-5 w-5" />
              播客角色
            </CardTitle>
            <Button variant="outline" size="sm" onClick={addCharacter}>
              <Icons.plus className="mr-2 h-4 w-4" />
              添加角色
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {settings.characters.map((character, index) => (
              <div key={index} className="relative grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>名字</Label>
                  <Input
                    value={character.name}
                    onChange={(e) => updateCharacter(index, "name", e.target.value)}
                    placeholder="角色名字"
                  />
                </div>
                <div className="space-y-2">
                  <Label>头衔</Label>
                  <Input
                    value={character.title}
                    onChange={(e) => updateCharacter(index, "title", e.target.value)}
                    placeholder="角色头衔"
                  />
                </div>
                <div className="space-y-2">
                  <Label>性别</Label>
                  <Select
                    value={character.gender}
                    onValueChange={(value) =>
                      updateCharacter(index, "gender", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="男性">男性</SelectItem>
                      <SelectItem value="女性">女性</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>声音</Label>
                  <Select
                    value={character.voice}
                    onValueChange={(value) =>
                      updateCharacter(index, "voice", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择声音" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="voice1">声音 1</SelectItem>
                      <SelectItem value="voice2">声音 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {settings.characters.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -right-12 top-8"
                    onClick={() => removeCharacter(index)}
                  >
                    <Icons.trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Icons.save className="mr-2 h-4 w-4" />
            保存设置
          </Button>
        </div>
      </div>
    </div>
  );
}
