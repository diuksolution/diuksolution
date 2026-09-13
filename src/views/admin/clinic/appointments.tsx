import { DayCalendarWorkspace } from "@/components/admin/appointments";
import { getDayScheduleData } from "@/lib/appointment/day-schedule";
import { requireUser } from "@/lib/current-user";

export async function ClinicAppointmentsView({
  date,
}: {
  date?: string;
}) {
  const user = await requireUser();
  const data = await getDayScheduleData(user.businessId, date);

  return (
    <DayCalendarWorkspace
      data={data}
      chatBaseHref="/admin/clinic/chat"
    />
  );
}
