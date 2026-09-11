import { requireUser } from "@/lib/current-user";
import { FnbDashboardView } from "@/views/admin/fnb/dashboard";

export default async function FnbDashboardPage() {
  const user = await requireUser();

  return (
    <FnbDashboardView
      businessName={user.business.name}
      businessType={user.business.businessType}
    />
  );
}
