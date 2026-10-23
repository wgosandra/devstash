import { Pin, Star, ExternalLink } from "lucide-react";
import { iconMap } from "@/components/dashboard/icon-map";
import type { ContentType } from "@/generated/prisma/client";

export type ItemCardData = {
  id: string;
  title: string;
  description: string | null;
  contentType: ContentType;
  content: string | null;
  language: string | null;
  url: string | null;
  fileName: string | null;
  fileSize: number | null;
  isFavorite: boolean;
  isPinned: boolean;
  updatedAt: Date;
  type: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  };
  tags: { tag: { name: string } }[];
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ItemCard({ item }: { item: ItemCardData }) {
  const Icon = iconMap[item.type.icon ?? "File"];
  const color = item.type.color ?? "#6b7280";
  const tags = item.tags.map((t) => t.tag.name);

  return (
    <div
      className="flex cursor-pointer flex-col gap-3 rounded-xl border border-border bg-[#111114] p-3.5 transition-colors hover:border-[#2e2e34] hover:bg-[#131317]"
      style={{ borderLeftColor: color + "70", borderLeftWidth: 3 }}
    >
      {/* Header: type icon + type name + language + pin/fav */}
      <div className="flex items-center gap-2">
        {Icon && (
          <span
            className="flex size-[26px] shrink-0 items-center justify-center rounded-[7px]"
            style={{
              backgroundColor: color + "1f",
              color: color,
            }}
          >
            <Icon className="size-3.5" />
          </span>
        )}
        <span className="text-xs font-medium text-muted-foreground">
          {item.type.name}
        </span>
        {item.language && (
          <span className="font-mono text-[11.5px] text-[#5c5c66]">
            · {item.language}
          </span>
        )}
        <div className="flex-1" />
        {item.isPinned && <Pin className="size-3 text-muted-foreground" />}
        {item.isFavorite && (
          <Star className="size-3 fill-yellow-300 text-yellow-300" />
        )}
      </div>

      {/* Title + description */}
      <div className="flex flex-col gap-1">
        <span className="truncate text-[14.5px] font-semibold tracking-tight">
          {item.title}
        </span>
        {item.description && (
          <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {item.description}
          </span>
        )}
      </div>

      {/* Content preview */}
      {item.contentType === "TEXT" && item.content && (
        <pre className="h-[72px] overflow-hidden whitespace-pre rounded-lg border border-[#18181c] bg-[#0b0b0d] px-3 py-2.5 font-mono text-xs leading-relaxed text-[#b4b4bc]">
          {item.content}
        </pre>
      )}
      {item.contentType === "URL" && item.url && (
        <div className="flex h-[72px] items-center gap-2.5 rounded-lg border border-[#18181c] bg-[#0b0b0d] px-3 text-muted-foreground">
          <ExternalLink className="size-4 shrink-0" />
          <span className="truncate font-mono text-xs">{item.url}</span>
        </div>
      )}
      {item.contentType === "FILE" && item.fileName && (
        <div className="flex h-[72px] items-center gap-2.5 rounded-lg border border-[#18181c] bg-[#0b0b0d] px-3 text-muted-foreground">
          <span className="text-xs text-foreground">{item.fileName}</span>
          {item.fileSize && (
            <span className="font-mono text-[11.5px] text-[#5c5c66]">
              {formatFileSize(item.fileSize)}
            </span>
          )}
        </div>
      )}

      {/* Tags + updated */}
      <div className="flex items-center gap-1.5">
        <div className="flex min-w-0 flex-1 gap-1 overflow-hidden">
          {tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="shrink-0 rounded-md bg-[#18181c] px-1.5 py-0.5 font-mono text-[11.5px] text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
        <span className="shrink-0 text-xs text-[#5c5c66]">
          {timeAgo(item.updatedAt)}
        </span>
      </div>
    </div>
  );
}
