import type { ReactNode } from "react";
import { requireUser } from "@/lib/current-user";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireUser();
  return children;
}
