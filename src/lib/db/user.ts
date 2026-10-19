import { prisma } from "@/lib/db";

export async function getProfileData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      password: true,
      createdAt: true,
      accounts: { select: { provider: true } },
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    hasPassword: !!user.password,
    createdAt: user.createdAt,
    providers: user.accounts.map((a) => a.provider),
  };
}

export async function getItemTypeBreakdown(userId: string) {
  const types = await prisma.itemType.findMany({
    where: {
      OR: [{ isSystem: true }, { userId }],
    },
    select: {
      name: true,
      icon: true,
      color: true,
      _count: { select: { items: { where: { userId } } } },
    },
    orderBy: { name: "asc" },
  });

  return types.map((t) => ({
    name: t.name,
    icon: t.icon ?? "File",
    color: t.color ?? "#6b7280",
    count: t._count.items,
  }));
}
