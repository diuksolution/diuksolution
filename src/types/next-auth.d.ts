import type { AuthProvider, BusinessType, Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      businessId: string;
      businessType: BusinessType;
      authProvider: AuthProvider;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    businessId?: string;
    businessType?: BusinessType;
    authProvider?: AuthProvider;
  }
}
