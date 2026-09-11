import type { BusinessType } from "@prisma/client";
import { BusinessDashboard } from "@/components/admin/business-dashboard";

export function FnbDashboardView({
  businessName,
  businessType,
}: {
  businessName: string;
  businessType: BusinessType;
}) {
  return (
    <BusinessDashboard
      businessName={businessName}
      businessType={businessType}
    />
  );
}
