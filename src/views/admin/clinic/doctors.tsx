import { Suspense } from "react";
import { DoctorListWorkspace } from "@/components/admin/practitioners/doctor-list-workspace";
import { requireUser } from "@/lib/current-user";
import {
  ensureClinicDemoDoctors,
  listPractitioners,
} from "@/lib/practitioners";
import { listServices } from "@/lib/services";

export async function ClinicDoctorsView() {
  const user = await requireUser();

  if (user.business.businessType === "CLINIC") {
    await ensureClinicDemoDoctors(user.businessId);
  }

  const [doctors, services] = await Promise.all([
    listPractitioners(user.businessId),
    listServices(user.businessId),
  ]);

  return (
    <Suspense fallback={<div className="p-6 text-sm text-on-surface-variant">Loading doctors…</div>}>
      <DoctorListWorkspace
        doctors={doctors}
        catalogServices={services.map((item) => ({
          id: item.id,
          name: item.name,
        }))}
      />
    </Suspense>
  );
}
