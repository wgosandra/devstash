"use server";

import { rateLimiters, checkRateLimit, getIP, rateLimitKey, retryAfterSeconds } from "@/lib/rate-limit";

export async function checkSignInRateLimit(email: string) {
  const ip = await getIP();
  const rl = await checkRateLimit(
    rateLimiters.login,
    rateLimitKey(ip, email)
  );

  if (!rl.success) {
    const retryAfter = retryAfterSeconds(rl.reset);
    const minutes = Math.ceil(retryAfter / 60);
    return {
      allowed: false as const,
      error: `Too many login attempts. Please try again in ${minutes} minutes.`,
    };
  }

  return { allowed: true as const };
}
