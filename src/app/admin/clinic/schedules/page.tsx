import { ClinicSchedulesView } from "@/views/admin/clinic/schedules";

export default async function ClinicSchedulesPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; tab?: string; view?: string }>;
}) {
  const params = await searchParams;
  return (
    <ClinicSchedulesView
      date={params.date}
      tab={params.tab}
      view={params.view}
    />
  );
}
