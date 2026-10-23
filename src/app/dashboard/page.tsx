import Link from "next/link";
import {
  Layers,
  FolderOpen,
  Star,
  Heart,
  Pin,
  Clock,
} from "lucide-react";
import { iconMap } from "@/components/dashboard/icon-map";
import { ItemCard } from "@/components/items/item-card";
import {
  getRecentCollections,
  getTotalCollectionCount,
} from "@/lib/db/collections";
import { getPinnedItems, getRecentItems, getItemStats } from "@/lib/db/items";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const user = { id: session.user.id };

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
          <Link
            href="/collections"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            View all
          </Link>
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
                  {col.description && (
                    <span className="text-xs leading-relaxed text-muted-foreground">
                      {col.description}
                    </span>
                  )}
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

