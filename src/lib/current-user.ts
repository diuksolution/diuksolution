import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { remember } from "@/lib/cache/store";
import { prisma } from "@/lib/prisma";

export const getCurrentUser = cache(async () => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  return remember(`user:${userId}`, 30_000, () =>
    prisma.user.findUnique({
      where: { id: userId },
      include: { business: true },
    }),
  );
});

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
