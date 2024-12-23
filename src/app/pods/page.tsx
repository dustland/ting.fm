"use client";

import { useMemo } from "react";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { usePods } from "@/hooks/use-pods";
import { type Pod } from "@/store/pod";
import { CreatePodCard } from "@/components/create-pod-card";
import { CreatePodDialog } from "@/components/create-pod-dialog";
import { PodCard } from "@/components/pod-card";

export default function PodsPage() {
  const { pods } = usePods();

  const podsList = useMemo(() => {
    return Object.values(pods as Record<string, Pod>).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [pods]);

  return (
    <div className="container p-2">
      <div className="mb-4 sm:mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">我的播客</h1>
            <p className="text-muted-foreground">管理您的所有播客</p>
          </div>
          {podsList.length > 0 && (
            <CreatePodDialog
              trigger={
                <Button>
                  <Icons.plus className="mr-2 h-4 w-4" />
                  新建播客
                </Button>
              }
            />
          )}
        </div>
      </div>

      {podsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold">还没有播客</h2>
            <p className="text-muted-foreground">创建您的第一个播客吧！</p>
          </div>
          <CreatePodCard className="max-w-full lg:max-w-2xl w-full" />
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {podsList.map((pod) => (
            <PodCard key={pod.id} podId={pod.id} />
          ))}
        </div>
      )}
    </div>
  );
}
