import { SchedulesWorkspace } from "@/components/admin/schedules";
import { requireUser } from "@/lib/current-user";
import { getCalendarPayload } from "@/lib/schedules/calendar";
import { getDoctorHoursForDate } from "@/lib/schedules/doctor-hours";

type TabId = "doctors" | "calendar";

function resolveTab(value?: string | null): TabId {
  return value === "calendar" ? "calendar" : "doctors";
}

export async function ClinicSchedulesView({
  date,
  tab,
  view,
}: {
  date?: string;
  tab?: string;
  view?: string;
}) {
  const user = await requireUser();
  const activeTab = resolveTab(tab);

  const [doctorHours, calendar] = await Promise.all([
    getDoctorHoursForDate(user.businessId, date),
    getCalendarPayload(user.businessId, { date, view }),
  ]);

  return (
    <SchedulesWorkspace
      doctorHours={doctorHours}
      calendar={calendar}
      initialTab={activeTab}
    />
  );
}
