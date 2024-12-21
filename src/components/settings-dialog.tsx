import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSettingStore } from "@/store/setting";
import { Icons } from "./icons";

export function SettingsDialog() {
  const { podcastSettings, updatePodcastSettings, resetPodcastSettings } =
    useSettingStore();
  const [localSettings, setLocalSettings] = React.useState(podcastSettings);
  const [open, setOpen] = React.useState(false);

  const handleSave = () => {
    updatePodcastSettings(localSettings);
    setOpen(false);
  };

  const handleReset = () => {
    resetPodcastSettings();
    setLocalSettings(podcastSettings);
  };

  const updateHostPersonality = (index: number, personality: string) => {
    setLocalSettings({
      ...localSettings,
      hosts: localSettings.hosts.map((host, i) =>
        i === index ? { ...host, personality } : host
      ),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Icons.settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>播客设置</DialogTitle>
          <DialogDescription>
            配置播客生成的相关参数，包括时长和主持人风格。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duration" className="text-right">
              时长（分钟）
            </Label>
            <Input
              id="duration"
              type="number"
              className="col-span-3"
              value={localSettings.duration}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  duration: parseInt(e.target.value),
                })
              }
            />
          </div>
          {localSettings.hosts.map((host, index) => (
            <div key={host.id} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={host.id} className="text-right">
                {host.gender === "male" ? "男" : "女"}主持人风格
              </Label>
              <Input
                id={host.id}
                className="col-span-3"
                value={host.personality}
                onChange={(e) => updateHostPersonality(index, e.target.value)}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            重置
          </Button>
          <Button onClick={handleSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
