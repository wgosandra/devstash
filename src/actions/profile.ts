"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { changePasswordSchema } from "@/lib/zod";
import { signOut } from "@/auth";

export async function changePassword(values: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const { currentPassword, newPassword } = changePasswordSchema.parse(values);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!user?.password) {
    return { success: false, error: "No password set for this account" };
  }

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    return { success: false, error: "Current password is incorrect" };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword },
  });

  return { success: true };
}

export async function deleteAccount() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  await prisma.user.delete({
    where: { id: session.user.id },
  });

  await signOut({ redirectTo: "/sign-in" });
}
