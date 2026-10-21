import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

const isConfigured =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

function createLimiter(
  tokens: number,
  window: Parameters<typeof Ratelimit.slidingWindow>[1],
  prefix: string
): Ratelimit | null {
  if (!isConfigured) return null;

  return new Ratelimit({
    redis: new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    }),
    limiter: Ratelimit.slidingWindow(tokens, window),
    prefix,
  });
}

export const rateLimiters = {
  login: createLimiter(5, "15 m", "rl:login"),
  register: createLimiter(3, "1 h", "rl:register"),
  forgotPassword: createLimiter(3, "1 h", "rl:forgot-password"),
  resetPassword: createLimiter(5, "15 m", "rl:reset-password"),
  resendVerification: createLimiter(3, "15 m", "rl:resend-verification"),
};

type RateLimitResult =
  | { success: true }
  | { success: false; reset: number };

export async function checkRateLimit(
  limiter: Ratelimit | null,
  key: string
): Promise<RateLimitResult> {
  if (!limiter) return { success: true };

  try {
    const result = await limiter.limit(key);
    if (result.success) return { success: true };
    return { success: false, reset: result.reset };
  } catch {
    return { success: true };
  }
}

export async function getIP(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}

export function rateLimitKey(ip: string, email?: string): string {
  return email ? `${ip}:${email.toLowerCase()}` : ip;
}

export function retryAfterSeconds(resetMs: number): number {
  return Math.ceil((resetMs - Date.now()) / 1000);
}
