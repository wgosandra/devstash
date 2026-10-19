import crypto from "crypto";
import { prisma } from "@/lib/db";

const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;
const PASSWORD_RESET_TOKEN_EXPIRY_HOURS = 1;
const PASSWORD_RESET_PREFIX = "pwd-reset:";

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

export async function generatePasswordResetToken(email: string) {
  const token = crypto.randomUUID();
  const expires = new Date(
    Date.now() + PASSWORD_RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
  );
  const identifier = `${PASSWORD_RESET_PREFIX}${email}`;

  await prisma.verificationToken.deleteMany({
    where: { identifier },
  });

  const resetToken = await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  return resetToken;
}

export async function getPasswordResetTokenByToken(token: string) {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record || !record.identifier.startsWith(PASSWORD_RESET_PREFIX)) {
    return null;
  }

  return {
    ...record,
    email: record.identifier.slice(PASSWORD_RESET_PREFIX.length),
  };
}
