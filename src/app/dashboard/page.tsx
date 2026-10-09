import {
  Layers,
  FolderOpen,
  Star,
  Heart,
  Pin,
  Clock,
  ExternalLink,
} from "lucide-react";
import { iconMap } from "@/components/dashboard/icon-map";
import {
  getRecentCollections,
  getTotalCollectionCount,
} from "@/lib/db/collections";
import { getPinnedItems, getRecentItems, getItemStats } from "@/lib/db/items";
import { prisma } from "@/lib/db";
import type { ContentType } from "@/generated/prisma/client";

// TODO: replace with real auth
const DEMO_USER_EMAIL = "demo@devstash.io";

type DashboardItem = {
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

export default async function DashboardPage() {
  const user = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
  });

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-8 text-muted-foreground">
        <p>No demo user found. Run the seed script first.</p>
      </div>
    );
  }

  const [
    dbCollections,
    pinnedItems,
    recentItems,
    itemStats,
    totalCollections,
  ] = await Promise.all([
    getRecentCollections(user.id),
    getPinnedItems(user.id),
    getRecentItems(user.id),
    getItemStats(user.id),
    getTotalCollectionCount(user.id),
  ]);

  const favoriteCollections = dbCollections.filter((c) => c.isFavorite).length;

  const stats = [
    {
      label: "Total Items",
      value: itemStats.totalItems,
      icon: Layers,
      color: "#3b82f6",
    },
    {
      label: "Collections",
      value: totalCollections,
      icon: FolderOpen,
      color: "#8b5cf6",
    },
    {
      label: "Favorite Items",
      value: itemStats.favoriteItems,
      icon: Star,
      color: "#fde047",
    },
    {
      label: "Favorite Collections",
      value: favoriteCollections,
      icon: Heart,
      color: "#ec4899",
    },
  ];

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {itemStats.totalItems} items across {totalCollections} collections
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 rounded-xl border border-border bg-[#111114] p-4"
          >
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: stat.color + "1a" }}
            >
              <stat.icon
                className="size-[18px]"
                style={{ color: stat.color }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-semibold tracking-tight text-foreground">
                {stat.value}
              </span>
              <span className="text-xs text-muted-foreground">
                {stat.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Collections */}
      <section className="flex flex-col gap-3.5">
        <div className="flex items-center gap-2">
          <FolderOpen className="size-3.5 text-muted-foreground" />
          <h2 className="text-[13px] font-semibold text-foreground">
            Collections
          </h2>
          <div className="flex-1" />
          <a
            href="/collections"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            View all
          </a>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {dbCollections.map((col) => (
            <div
              key={col.id}
              className="flex cursor-pointer flex-col gap-3.5 rounded-xl border bg-[#111114] p-4 transition-colors hover:border-[#2e2e34] hover:bg-[#131317]"
              style={{ borderColor: col.dominantColor + "40" }}
            >
              <div className="flex items-start gap-2">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-[14.5px] font-semibold tracking-tight">
                    {col.name}
                  </span>
                  <span className="text-xs leading-relaxed text-muted-foreground">
                    {col.description}
                  </span>
                </div>
                {col.isFavorite && (
                  <Star className="size-3.5 shrink-0 fill-yellow-300 text-yellow-300" />
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {col.typeIcons.map((t) => {
                  const Icon = iconMap[t.icon];
                  return Icon ? (
                    <span
                      key={t.id}
                      className="flex size-6 items-center justify-center rounded-[7px]"
                      style={{
                        backgroundColor: t.color + "1f",
                        color: t.color,
                      }}
                    >
                      <Icon className="size-[13px]" />
                    </span>
                  ) : null;
                })}
                <div className="flex-1" />
                <span className="font-mono text-xs text-[#5c5c66]">
                  {col.itemCount} items
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pinned Items — only show if there are pinned items */}
      {pinnedItems.length > 0 && (
        <section className="flex flex-col gap-3.5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Pin className="size-3.5" />
            <h2 className="text-[13px] font-semibold text-foreground">
              Pinned
            </h2>
            <span className="font-mono text-xs text-[#5c5c66]">
              {pinnedItems.length}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {pinnedItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Items */}
      <section className="flex flex-col gap-3.5">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="size-3.5" />
          <h2 className="text-[13px] font-semibold text-foreground">Recent</h2>
          <span className="font-mono text-xs text-[#5c5c66]">
            {recentItems.length}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {recentItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}

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

function ItemCard({ item }: { item: DashboardItem }) {
  const Icon = iconMap[item.type.icon ?? "File"];
  const color = item.type.color ?? "#6b7280";
  const tags = item.tags.map((t) => t.tag.name);

  return (
    <div className="flex cursor-pointer flex-col gap-3 rounded-xl border border-border bg-[#111114] p-3.5 transition-colors hover:border-[#2e2e34] hover:bg-[#131317]">
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
