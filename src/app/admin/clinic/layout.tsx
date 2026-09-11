import type { ReactNode } from "react";
import { toAdminShellUser } from "@/components/admin/sidebar/to-shell-user";
import { requireWorkspace } from "@/lib/admin-workspace";
import { ClinicWorkspace } from "@/views/admin/clinic/workspace";

export default async function ClinicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireWorkspace(["CLINIC"]);

  return (
    <ClinicWorkspace user={toAdminShellUser(user)}>{children}</ClinicWorkspace>
  );
}
