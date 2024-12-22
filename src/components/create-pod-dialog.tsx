"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Icons } from "./icons";
import { CreatePodCard } from "./create-pod-card";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CreatePodDialogProps {
  trigger?: React.ReactNode;
}

export function CreatePodDialog({ trigger }: CreatePodDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleCreated = (podId: string) => {
    setOpen(false);
    router.push(`/pods/${podId}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Icons.create className="mr-2 h-4 w-4" />
            新建播客
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>创建新播客</DialogTitle>
        </DialogHeader>
        <CreatePodCard onCreated={handleCreated} />
      </DialogContent>
    </Dialog>
  );
}
