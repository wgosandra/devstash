import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import { rateLimiters, checkRateLimit, getIP, rateLimitKey, retryAfterSeconds } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    const ip = await getIP();
    const rl = await checkRateLimit(
      rateLimiters.resendVerification,
      rateLimitKey(ip, email)
    );

    if (!rl.success) {
      const retryAfter = retryAfterSeconds(rl.reset);
      return NextResponse.json(
        {
          success: false,
          error: `Too many attempts. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`,
        },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { emailVerified: true, password: true },
    });

    if (!user || !user.password || user.emailVerified) {
      return NextResponse.json({ success: true });
    }

    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(email, verificationToken.token);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
