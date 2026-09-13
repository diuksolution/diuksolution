import { ClinicAppointmentsView } from "@/views/admin/clinic/appointments";

export default async function ClinicAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  return <ClinicAppointmentsView date={params.date} />;
}
