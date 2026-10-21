"use server";

import { forgotPasswordSchema } from "@/lib/zod";
import { prisma } from "@/lib/db";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";
import { rateLimiters, checkRateLimit, getIP, rateLimitKey, retryAfterSeconds } from "@/lib/rate-limit";

export async function forgotPassword(values: { email: string }) {
  const { email } = forgotPasswordSchema.parse(values);

  const ip = await getIP();
  const rl = await checkRateLimit(
    rateLimiters.forgotPassword,
    rateLimitKey(ip)
  );

  if (!rl.success) {
    const retryAfter = retryAfterSeconds(rl.reset);
    const minutes = Math.ceil(retryAfter / 60);
    return {
      success: false as const,
      error: `Too many attempts. Please try again in ${minutes} minutes.`,
    };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to prevent email enumeration
  if (!user || !user.password) {
    return { success: true as const };
  }

  const resetToken = await generatePasswordResetToken(email);
  await sendPasswordResetEmail(email, resetToken.token);

  return { success: true as const };
}
