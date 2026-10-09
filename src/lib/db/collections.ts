import { prisma } from "@/lib/db";

export async function getRecentCollections(userId: string, limit = 6) {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      items: {
        include: {
          item: {
            include: { type: true },
          },
        },
      },
    },
  });

  return collections.map((col) => {
    const items = col.items.map((ic) => ic.item);
    const typeCounts = new Map<string, { count: number; color: string }>();

    for (const item of items) {
      const existing = typeCounts.get(item.typeId);
      if (existing) {
        existing.count++;
      } else {
        typeCounts.set(item.typeId, {
          count: 1,
          color: item.type.color ?? "#6b7280",
        });
      }
    }

    let dominantColor = "#6b7280";
    let maxCount = 0;
    for (const [, value] of typeCounts) {
      if (value.count > maxCount) {
        maxCount = value.count;
        dominantColor = value.color;
      }
    }

    const typeIcons = [...new Set(items.map((i) => i.typeId))].map((typeId) => {
      const item = items.find((i) => i.typeId === typeId)!;
      return {
        id: item.type.id,
        icon: item.type.icon ?? "File",
        color: item.type.color ?? "#6b7280",
      };
    });

    return {
      id: col.id,
      name: col.name,
      description: col.description,
      isFavorite: col.isFavorite,
      itemCount: items.length,
      dominantColor,
      typeIcons,
    };
  });
}
