import { Suspense } from "react";
import { DoctorListWorkspace } from "@/components/admin/practitioners/doctor-list-workspace";
import { requireUser } from "@/lib/current-user";
import {
  ensureClinicDemoDoctors,
  listPractitioners,
} from "@/lib/practitioners";

export async function ClinicDoctorsView() {
  const user = await requireUser();

  if (user.business.businessType === "CLINIC") {
    await ensureClinicDemoDoctors(user.businessId);
  }

  const doctors = await listPractitioners(user.businessId);

  return (
    <Suspense fallback={<div className="p-6 text-sm text-on-surface-variant">Loading doctors…</div>}>
      <DoctorListWorkspace doctors={doctors} />
    </Suspense>
  );
}
