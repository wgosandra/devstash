"use client";

import { createContext, useContext, useState } from "react";
import { ItemDrawer } from "@/components/items/item-drawer";

const ItemDrawerContext = createContext<((id: string) => void) | null>(null);

export function useItemDrawer() {
  const ctx = useContext(ItemDrawerContext);
  if (!ctx) throw new Error("useItemDrawer must be used within ItemsClientWrapper");
  return ctx;
}

export function ItemsClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = (id: string) => {
    setSelectedItemId(id);
    setDrawerOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setDrawerOpen(open);
    if (!open) setSelectedItemId(null);
  };

  return (
    <ItemDrawerContext value={openDrawer}>
      {children}
      <ItemDrawer
        itemId={selectedItemId}
        open={drawerOpen}
        onOpenChange={handleOpenChange}
      />
    </ItemDrawerContext>
  );
}
