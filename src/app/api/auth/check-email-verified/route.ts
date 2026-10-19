import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ verified: true });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { emailVerified: true, password: true },
  });

  if (!user || !user.password) {
    return NextResponse.json({ verified: true });
  }

  return NextResponse.json({ verified: !!user.emailVerified });
}
