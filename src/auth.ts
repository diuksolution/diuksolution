import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

function readProfileEmail(profile: unknown): string | null {
  if (!profile || typeof profile !== "object" || !("email" in profile)) {
    return null;
  }

  return typeof profile.email === "string" ? normalizeEmail(profile.email) : null;
}

function isExplicitlyUnverified(profile: unknown): boolean {
  if (!profile || typeof profile !== "object" || !("email_verified" in profile)) {
    return false;
  }

  const value = profile.email_verified;
  return value === false || value === "false" || value === 0;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username =
          typeof credentials?.username === "string"
            ? normalizeUsername(credentials.username)
            : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!username || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { username },
        });

        if (
          !user ||
          user.authProvider !== "CREDENTIALS" ||
          !user.password
        ) {
          return null;
        }

        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "credentials") {
        return true;
      }

      if (account?.provider !== "google") {
        return false;
      }

      const email = user.email
        ? normalizeEmail(user.email)
        : readProfileEmail(profile);
      if (!email) {
        console.warn("[auth] Google sign-in denied: no email on the Google account.");
        return false;
      }

      if (isExplicitlyUnverified(profile)) {
        console.warn(`[auth] Google sign-in denied: ${email} is not verified by Google.`);
        return false;
      }

      const existing = await prisma.user.findUnique({
        where: { email },
      });

      if (!existing || existing.authProvider !== "GOOGLE") {
        console.warn(
          `[auth] Google sign-in denied: ${email} is not a registered Google user.`,
        );
        return false;
      }

      await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: user.name ?? existing.name,
          image: user.image ?? existing.image,
          googleId: account.providerAccountId,
        },
      });

      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: normalizeEmail(user.email) },
          include: { business: true },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.businessId = dbUser.businessId;
          token.businessType = dbUser.business.businessType;
          token.authProvider = dbUser.authProvider;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "STAFF";
        session.user.businessId = token.businessId as string;
        session.user.businessType = token.businessType as
          | "CLINIC"
          | "FNB"
          | "BARBERSHOP"
          | "GYM"
          | "TOURISM"
          | "OTHER";
        session.user.authProvider = token.authProvider as
          | "GOOGLE"
          | "CREDENTIALS";
      }

      return session;
    },
  },
});
