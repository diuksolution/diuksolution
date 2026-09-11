import type { ReactNode } from "react";
import { toAdminShellUser } from "@/components/admin/sidebar/to-shell-user";
import { requireWorkspace } from "@/lib/admin-workspace";
import { FnbWorkspace } from "@/views/admin/fnb/workspace";

export default async function FnbLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireWorkspace(["FNB", "GYM", "TOURISM", "OTHER"]);

  return <FnbWorkspace user={toAdminShellUser(user)}>{children}</FnbWorkspace>;
}
