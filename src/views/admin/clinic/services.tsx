import { Suspense } from "react";
import { ServicesWorkspace } from "@/components/admin/services/services-workspace";
import { requireUser } from "@/lib/current-user";
import { ensureClinicDemoServices, listServices } from "@/lib/services";

export async function ClinicServicesView() {
  const user = await requireUser();

  if (user.business.businessType === "CLINIC") {
    await ensureClinicDemoServices(user.businessId);
  }

  const services = await listServices(user.businessId);

  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-on-surface-variant">
          Loading services…
        </div>
      }
    >
      <ServicesWorkspace services={services} />
    </Suspense>
  );
}
