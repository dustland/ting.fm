"use client";

import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { PodSource } from "@/store/pod";

interface PaperInfoProps {
  paper: NonNullable<PodSource["metadata"]>;
  className?: string;
  variant?: "default" | "compact";
}

export function PaperInfo({
  paper,
  className,
  variant = "default",
}: PaperInfoProps) {
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center gap-4 text-sm text-muted-foreground",
          className
        )}
      >
        {paper.createdAt && (
          <div className="flex items-center gap-2">
            <Icons.calendar className="h-4 w-4" />
            <span>
              {new Date(paper.createdAt).toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        )}
        {paper.authors && paper.authors.length > 0 && (
          <div className="flex items-center gap-2">
            <Icons.user className="h-4 w-4" />
            <span>{paper.authors.join(", ")}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-2 text-sm text-muted-foreground border rounded-lg p-4 bg-muted/30",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Icons.calendar className="h-4 w-4" />
        <span>
          发布于{" "}
          {new Date(
            paper.createdAt || new Date().toISOString()
          ).toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>
      {paper.updatedAt && paper.updatedAt !== paper.createdAt && (
        <div className="flex items-center gap-2">
          <Icons.clock className="h-4 w-4" />
          <span>
            更新于{" "}
            {new Date(paper.updatedAt).toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      )}
      {paper.authors && paper.authors.length > 0 && (
        <div className="flex items-center gap-2">
          <Icons.user className="h-4 w-4" />
          <span>作者: {paper.authors.join(", ")}</span>
        </div>
      )}
      {paper.categories && paper.categories.length > 0 && (
        <div className="flex items-center gap-2">
          <Icons.tag className="h-4 w-4" />
          <span>分类: {paper.categories.join(", ")}</span>
        </div>
      )}
      {paper.journal && (
        <div className="flex items-center gap-2">
          <Icons.book className="h-4 w-4" />
          <span>期刊: {paper.journal}</span>
        </div>
      )}
    </div>
  );
}
