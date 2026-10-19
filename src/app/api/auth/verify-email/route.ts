import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getVerificationTokenByToken } from "@/lib/tokens";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/verify-email?status=invalid", request.url)
    );
  }

  const verificationToken = await getVerificationTokenByToken(token);

  if (!verificationToken) {
    return NextResponse.redirect(
      new URL("/verify-email?status=invalid", request.url)
    );
  }

  if (verificationToken.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: { token },
    });

    return NextResponse.redirect(
      new URL(
        `/verify-email?status=expired&email=${encodeURIComponent(verificationToken.identifier)}`,
        request.url
      )
    );
  }

  await prisma.user.update({
    where: { email: verificationToken.identifier },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.delete({
    where: { token },
  });

  return NextResponse.redirect(
    new URL("/verify-email?status=success", request.url)
  );
}
