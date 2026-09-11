import type { AppointmentCopy } from "@/lib/appointment/types";
import { Icon } from "@/components/ui/icon";

export function DashboardHero({
  greeting,
  dateLabel,
  businessName,
  copy,
}: {
  greeting: string;
  dateLabel: string;
  businessName: string;
  copy: AppointmentCopy;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-2 py-0.5 font-mono text-[11px] text-on-surface-variant">
          <span className="size-1.5 animate-pulse rounded-full bg-primary" />
          SYSTEM ONLINE • AUTOMATION RATIO 82.4%
        </div>
        <h1 className="text-[30px] leading-9 font-semibold tracking-tight text-on-surface">
          {greeting}{" "}
          <span className="inline-block cursor-default transition-transform hover:rotate-12">
            👋
          </span>
        </h1>
        <p className="text-sm text-on-surface-variant">
          Here&apos;s what&apos;s happening at {businessName} today.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-on-surface-variant shadow-sm">
          <Icon name="calendar_month" className="text-[18px] text-primary" />
          <span className="text-xs font-semibold text-on-surface">{dateLabel}</span>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-medium text-on-surface shadow-sm transition-colors hover:bg-surface-container-high"
        >
          <Icon name="person_add" className="text-[18px] text-outline" />
          {copy.addCustomer}
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
        >
          <Icon name="add" className="text-[18px]" />
          {copy.newAppointment}
        </button>
      </div>
    </div>
  );
}
