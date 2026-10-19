import crypto from "crypto";
import { prisma } from "@/lib/db";

const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;

export async function generateVerificationToken(email: string) {
  const token = crypto.randomUUID();
  const expires = new Date(
    Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
  );

  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  const verificationToken = await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  return verificationToken;
}

export async function getVerificationTokenByToken(token: string) {
  return prisma.verificationToken.findUnique({ where: { token } });
}
