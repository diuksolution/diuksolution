import type { ReactNode } from "react";
import { toAdminShellUser } from "@/components/admin/sidebar/to-shell-user";
import { requireWorkspace } from "@/lib/admin-workspace";
import { SalonWorkspace } from "@/views/admin/salon/workspace";

export default async function SalonLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireWorkspace(["BARBERSHOP"]);

  return (
    <SalonWorkspace user={toAdminShellUser(user)}>{children}</SalonWorkspace>
  );
}
