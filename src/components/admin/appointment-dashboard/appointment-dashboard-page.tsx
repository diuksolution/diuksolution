import { AppointmentDashboard } from "@/components/admin/appointment-dashboard";
import { getAppointmentCopy } from "@/lib/appointment/copy";
import { getAppointmentDashboardData } from "@/lib/appointment/dashboard-data";
import type { AppointmentBusinessType } from "@/lib/appointment/types";
import { requireUser } from "@/lib/current-user";

function jakartaGreeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      hour: "numeric",
      hour12: false,
    }).format(new Date()),
  );

  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 18) {
    return "Good afternoon";
  }
  return "Good evening";
}

function jakartaDateLabel() {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());
}

export async function AppointmentDashboardPage({
  businessType,
}: {
  businessType: AppointmentBusinessType;
}) {
  const user = await requireUser();
  const copy = getAppointmentCopy(businessType);

  return (
    <AppointmentDashboard
      businessName={user.business.name}
      copy={copy}
      data={getAppointmentDashboardData(copy, user.business.name)}
      greeting={`${jakartaGreeting()}, ${user.name?.split(" ")[0] ?? "Admin"}`}
      dateLabel={`Today, ${jakartaDateLabel()}`}
    />
  );
}
