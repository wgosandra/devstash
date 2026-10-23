import { prisma } from "@/lib/db";

export async function getPinnedItems(userId: string) {
  return prisma.item.findMany({
    where: { userId, isPinned: true },
    orderBy: { updatedAt: "desc" },
    include: {
      type: true,
      tags: { include: { tag: true } },
    },
  });
}

export async function getRecentItems(userId: string, limit = 10) {
  return prisma.item.findMany({
    where: { userId, isPinned: false },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      type: true,
      tags: { include: { tag: true } },
    },
  });
}

export async function getItemStats(userId: string) {
  const [totalItems, favoriteItems] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.item.count({ where: { userId, isFavorite: true } }),
  ]);

  return { totalItems, favoriteItems };
}

export async function getItemsByType(userId: string, typeSlug: string) {
  return prisma.item.findMany({
    where: {
      userId,
      type: { slug: typeSlug },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      type: true,
      tags: { include: { tag: true } },
    },
  });
}

export async function getItemTypeBySlug(slug: string) {
  return prisma.itemType.findFirst({
    where: { slug },
  });
}

export async function getItemTypesWithCounts(userId: string) {
  const types = await prisma.itemType.findMany({
    where: {
      OR: [{ isSystem: true }, { userId }],
    },
    include: {
      _count: { select: { items: { where: { userId } } } },
    },
    orderBy: { name: "asc" },
  });

  return types.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    icon: t.icon ?? "File",
    color: t.color ?? "#6b7280",
    isSystem: t.isSystem,
    itemCount: t._count.items,
  }));
}
