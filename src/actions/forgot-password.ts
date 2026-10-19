"use server";

import { forgotPasswordSchema } from "@/lib/zod";
import { prisma } from "@/lib/db";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";

export async function forgotPassword(values: { email: string }) {
  const { email } = forgotPasswordSchema.parse(values);

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to prevent email enumeration
  if (!user || !user.password) {
    return { success: true };
  }

  const resetToken = await generatePasswordResetToken(email);
  await sendPasswordResetEmail(email, resetToken.token);

  return { success: true };
}
