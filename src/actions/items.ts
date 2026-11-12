"use server";

import { auth } from "@/auth";
import { updateItemSchema } from "@/lib/zod";
import { updateItem as updateItemQuery } from "@/lib/db/items";

export async function updateItem(
  itemId: string,
  values: {
    title: string;
    description?: string | null;
    content?: string | null;
    url?: string | null;
    language?: string | null;
    tags: string[];
  }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Not authenticated" };
  }

  const parsed = updateItemSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  const { url, ...rest } = parsed.data;

  try {
    const updated = await updateItemQuery(itemId, session.user.id, {
      ...rest,
      url: url === "" ? null : (url ?? null),
    });
    return { success: true as const, data: updated };
  } catch {
    return { success: false as const, error: "Item not found or access denied" };
  }
}
