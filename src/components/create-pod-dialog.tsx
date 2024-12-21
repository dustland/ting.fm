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

interface CreatePodDialogProps {
  trigger?: React.ReactNode;
}

export function CreatePodDialog({ trigger }: CreatePodDialogProps) {
  return (
    <Dialog>
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
        <CreatePodCard />
      </DialogContent>
    </Dialog>
  );
}
