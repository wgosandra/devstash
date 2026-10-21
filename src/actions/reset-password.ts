"use server";

import bcrypt from "bcryptjs";
import { resetPasswordSchema } from "@/lib/zod";
import { prisma } from "@/lib/db";
import { getPasswordResetTokenByToken } from "@/lib/tokens";
import { rateLimiters, checkRateLimit, getIP, rateLimitKey, retryAfterSeconds } from "@/lib/rate-limit";

export async function resetPassword(values: {
  token: string;
  password: string;
  confirmPassword: string;
}) {
  const ip = await getIP();
  const rl = await checkRateLimit(
    rateLimiters.resetPassword,
    rateLimitKey(ip)
  );

  if (!rl.success) {
    const retryAfter = retryAfterSeconds(rl.reset);
    const minutes = Math.ceil(retryAfter / 60);
    return {
      success: false as const,
      error: "rate_limited" as const,
      message: `Too many attempts. Please try again in ${minutes} minutes.`,
    };
  }

  const { token, password } = resetPasswordSchema.parse(values);

  const resetToken = await getPasswordResetTokenByToken(token);

  if (!resetToken) {
    return { success: false, error: "invalid" as const };
  }

  if (new Date() > resetToken.expires) {
    await prisma.verificationToken.delete({
      where: { token },
    });
    return { success: false, error: "expired" as const };
  }

  const user = await prisma.user.findUnique({
    where: { email: resetToken.email },
  });

  if (!user) {
    return { success: false, error: "invalid" as const };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  await prisma.verificationToken.delete({
    where: { token },
  });

  return { success: true };
}
