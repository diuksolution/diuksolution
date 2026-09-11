import type { BusinessType } from "@prisma/client";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/current-user";

export function getAdminHome(type: BusinessType) {
  if (type === "CLINIC") {
    return "/admin/clinic";
  }

  if (type === "BARBERSHOP") {
    return "/admin/salon";
  }

  return "/admin/fnb";
}

export async function requireWorkspace(allowedTypes: BusinessType[]) {
  const user = await requireUser();

  if (!allowedTypes.includes(user.business.businessType)) {
    redirect(getAdminHome(user.business.businessType));
  }

  return user;
}
