import { redirect } from "next/navigation";
import { getAdminHome } from "@/lib/admin-workspace";
import { requireUser } from "@/lib/current-user";

export default async function AdminIndexPage() {
  const user = await requireUser();
  redirect(getAdminHome(user.business.businessType));
}
