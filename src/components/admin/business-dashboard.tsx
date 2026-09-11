import type { BusinessType } from "@prisma/client";
import { BUSINESS_TYPE_LABELS } from "@/lib/business-type";

type BusinessDashboardProps = {
  businessName: string;
  businessType: BusinessType;
};

function DashboardCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-2xl border border-outline-variant bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold tracking-wide text-primary uppercase">
        {title}
      </p>
      <h2 className="mt-2 text-xl font-semibold text-on-surface">
        {description}
      </h2>
      <p className="mt-2 text-sm text-on-surface-variant">
        This shell is ready for a business-specific dashboard. More modules can
        be added from here without changing the auth or routing structure.
      </p>
    </section>
  );
}

export function BusinessDashboard({
  businessName,
  businessType,
}: BusinessDashboardProps) {
  if (businessType === "CLINIC") {
    return (
      <DashboardCard
        title="Clinic dashboard"
        description={`${businessName} is using the clinic workspace.`}
      />
    );
  }

  if (businessType === "FNB") {
    return (
      <DashboardCard
        title="F&B dashboard"
        description={`${businessName} is using the F&B workspace.`}
      />
    );
  }

  return (
    <DashboardCard
      title={`${BUSINESS_TYPE_LABELS[businessType]} dashboard`}
      description={`${businessName} does not have a dedicated dashboard yet.`}
    />
  );
}
