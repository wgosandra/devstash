import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getItemsByType, getItemTypeBySlug } from "@/lib/db/items";
import { ItemCard } from "@/components/items/item-card";
import { iconMap } from "@/components/dashboard/icon-map";

export default async function ItemsListPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const { type: typeSlug } = await params;

  const itemType = await getItemTypeBySlug(typeSlug);
  if (!itemType) notFound();

  const items = await getItemsByType(session.user.id, typeSlug);

  const Icon = iconMap[itemType.icon ?? "File"];
  const color = itemType.color ?? "#6b7280";

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      {/* Page header */}
      <div className="flex items-center gap-3">
        {Icon && (
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: color + "1a", color }}
          >
            <Icon className="size-[18px]" />
          </span>
        )}
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {itemType.name}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      {/* Items grid */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          {Icon && (
            <span
              className="mb-3 flex size-12 items-center justify-center rounded-xl"
              style={{ backgroundColor: color + "1a", color }}
            >
              <Icon className="size-6" />
            </span>
          )}
          <p className="text-sm font-medium text-foreground">
            No {itemType.name.toLowerCase()} yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Items you add will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
