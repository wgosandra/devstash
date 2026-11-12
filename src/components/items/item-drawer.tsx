"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { iconMap } from "@/components/dashboard/icon-map";
import {
  Star,
  Pin,
  Copy,
  Pencil,
  Trash2,
  Tag,
  FolderOpen,
  Info,
  ExternalLink,
} from "lucide-react";
import type { ContentType } from "@/generated/prisma/client";

type ItemDetail = {
  id: string;
  title: string;
  description: string | null;
  contentType: ContentType;
  content: string | null;
  language: string | null;
  url: string | null;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  type: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    color: string | null;
  };
  tags: { tag: { name: string } }[];
  collections: { collection: { id: string; name: string } }[];
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start gap-3">
        <Skeleton className="size-10 rounded-lg" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-5 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-5 w-12" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-12" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-14 rounded-md" />
          <Skeleton className="h-6 w-14 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function ItemDrawer({
  itemId,
  open,
  onOpenChange,
}: {
  itemId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!itemId || !open) {
      setItem(null);
      return;
    }

    setLoading(true);
    fetch(`/api/items/${itemId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => setItem(data))
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [itemId, open]);

  const handleCopy = async () => {
    if (!item) return;
    const text =
      item.contentType === "URL" ? item.url : item.content;
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const TypeIcon = item ? iconMap[item.type.icon ?? "File"] : null;
  const color = item?.type.color ?? "#6b7280";
  const tags = item?.tags.map((t) => t.tag.name) ?? [];
  const collections = item?.collections.map((c) => c.collection) ?? [];
  const contentLines = item?.content?.split("\n") ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={true}
        className="w-full overflow-y-auto sm:max-w-lg"
      >
        {loading ? (
          <>
            <SheetTitle className="sr-only">Loading item</SheetTitle>
            <DrawerSkeleton />
          </>
        ) : item ? (
          <div className="flex flex-col gap-5 p-6">
            {/* Header: icon + title + badges */}
            <div className="flex items-start gap-3 pr-8">
              {TypeIcon && (
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: color + "1f", color }}
                >
                  <TypeIcon className="size-5" />
                </span>
              )}
              <div className="flex flex-col gap-1.5">
                <SheetTitle className="text-base font-semibold tracking-tight">
                  {item.title}
                </SheetTitle>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: color + "1f", color }}
                  >
                    {item.type.name}
                  </span>
                  {item.language && (
                    <span className="rounded-full bg-[#1e1e24] px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
                      {item.language}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-1 border-y border-border py-2">
              <Tooltip>
                <TooltipTrigger
                  className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-[#1e1e24] hover:text-foreground"
                >
                  <Star
                    className={`size-3.5 ${item.isFavorite ? "fill-yellow-300 text-yellow-300" : ""}`}
                  />
                  <span className={item.isFavorite ? "text-yellow-300" : ""}>
                    Favorite
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {item.isFavorite ? "Remove from favorites" : "Add to favorites"}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-[#1e1e24] hover:text-foreground"
                >
                  <Pin
                    className={`size-3.5 ${item.isPinned ? "fill-foreground text-foreground" : ""}`}
                  />
                  <span className={item.isPinned ? "text-foreground" : ""}>
                    Pin
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {item.isPinned ? "Unpin item" : "Pin item"}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-[#1e1e24] hover:text-foreground"
                  onClick={handleCopy}
                >
                  <Copy className="size-3.5" />
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </TooltipTrigger>
                <TooltipContent>Copy content to clipboard</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-[#1e1e24] hover:text-foreground"
                >
                  <Pencil className="size-3.5" />
                  <span>Edit</span>
                </TooltipTrigger>
                <TooltipContent>Edit item</TooltipContent>
              </Tooltip>

              <div className="flex-1" />

              <Tooltip>
                <TooltipTrigger
                  className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-red-400/70 transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 className="size-3.5" />
                </TooltipTrigger>
                <TooltipContent>Delete item</TooltipContent>
              </Tooltip>
            </div>

            {/* Description */}
            {item.description && (
              <section className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Description
                </span>
                <p className="text-sm leading-relaxed text-foreground">
                  {item.description}
                </p>
              </section>
            )}

            {/* Content */}
            {item.contentType === "TEXT" && item.content && (
              <section className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Content
                </span>
                <div className="overflow-hidden rounded-lg border border-[#1e1e24] bg-[#0b0b0d]">
                  <pre className="max-h-80 overflow-auto p-0 font-mono text-xs leading-relaxed">
                    <table className="w-full border-collapse">
                      <tbody>
                        {contentLines.map((line, i) => (
                          <tr key={i} className="hover:bg-[#ffffff06]">
                            <td className="select-none border-r border-[#1e1e24] px-3 py-0 text-right align-top text-[#5c5c66]">
                              {i + 1}
                            </td>
                            <td className="px-3 py-0 text-[#b4b4bc]">
                              {line || " "}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </pre>
                </div>
              </section>
            )}

            {/* URL */}
            {item.contentType === "URL" && item.url && (
              <section className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  URL
                </span>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-[#1e1e24] bg-[#0b0b0d] px-3 py-2.5 font-mono text-xs text-[#b4b4bc] transition-colors hover:text-foreground"
                >
                  <ExternalLink className="size-3.5 shrink-0" />
                  <span className="truncate">{item.url}</span>
                </a>
              </section>
            )}

            {/* File */}
            {item.contentType === "FILE" && item.fileName && (
              <section className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  File
                </span>
                <div className="flex items-center gap-2.5 rounded-lg border border-[#1e1e24] bg-[#0b0b0d] px-3 py-2.5">
                  <span className="text-xs text-foreground">
                    {item.fileName}
                  </span>
                  {item.fileSize && (
                    <span className="font-mono text-[11.5px] text-[#5c5c66]">
                      {item.fileSize < 1024
                        ? `${item.fileSize} B`
                        : item.fileSize < 1024 * 1024
                          ? `${(item.fileSize / 1024).toFixed(1)} KB`
                          : `${(item.fileSize / (1024 * 1024)).toFixed(1)} MB`}
                    </span>
                  )}
                </div>
              </section>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <section className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <Tag className="size-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Tags
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-[#1e1e24] px-2 py-1 font-mono text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Collections */}
            {collections.length > 0 && (
              <section className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <FolderOpen className="size-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Collections
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {collections.map((col) => (
                    <span
                      key={col.id}
                      className="rounded-md bg-[#1e1e24] px-2 py-1 text-xs text-muted-foreground"
                    >
                      {col.name}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Details */}
            <section className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <Info className="size-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  Details
                </span>
              </div>
              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="text-foreground">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Updated</span>
                  <span className="text-foreground">
                    {formatDate(item.updatedAt)}
                  </span>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <>
            <SheetTitle className="sr-only">Item not found</SheetTitle>
            <div className="flex flex-col items-center justify-center py-16 text-sm text-muted-foreground">
              Item not found.
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
