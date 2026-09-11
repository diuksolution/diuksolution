import type { AdminShellUser } from "@/components/admin/sidebar/types";
import { requireUser } from "@/lib/current-user";

export function toAdminShellUser(
  user: Awaited<ReturnType<typeof requireUser>>,
): AdminShellUser {
  return {
    name: user.name,
    email: user.email,
    role: user.role,
    authProvider: user.authProvider,
    businessName: user.business.name,
    businessType: user.business.businessType,
  };
}
