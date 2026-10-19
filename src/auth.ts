import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signInSchema } from "@/lib/zod";
import authConfig from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const { email, password } = signInSchema.parse(credentials);

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        return user;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },
  },
});
