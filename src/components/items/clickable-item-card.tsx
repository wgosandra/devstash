"use client";

import { useItemDrawer } from "@/components/items/items-client-wrapper";
import { ItemCard, type ItemCardData } from "@/components/items/item-card";

export function ClickableItemCard({ item }: { item: ItemCardData }) {
  const openDrawer = useItemDrawer();

  return <ItemCard item={item} onClick={() => openDrawer(item.id)} />;
}
