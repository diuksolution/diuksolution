import Link from "next/link";
import type { AppointmentCopy } from "@/lib/appointment/types";
import type { PractitionerData } from "@/lib/appointment/dashboard-data";
import { Icon } from "@/components/ui/icon";

const toneClass = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  success: "bg-success/10 text-success",
};

export function OperationsColumn({
  copy,
  practitioners,
}: {
  copy: AppointmentCopy;
  practitioners: PractitionerData[];
}) {
  return (
    <div className="space-y-5 lg:col-span-4">
      <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-on-surface">
            {copy.availabilityTitle}
          </h2>
          <Link
            href={copy.practitionersHref}
            className="inline-flex items-center gap-0.5 text-xs font-semibold text-primary hover:text-primary-dark"
          >
            {copy.manageRosters}
            <Icon name="arrow_forward" className="text-[14px]" />
          </Link>
        </div>
        <div className="space-y-2">
          {practitioners.map((person) => (
            <div
              key={person.id}
              className="flex items-center justify-between rounded-xl bg-surface-container-low p-3"
            >
              <div className="flex min-w-0 items-center gap-2">
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold ${toneClass[person.tone]}`}
                >
                  {person.initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-on-surface">
                    {person.name}
                  </p>
                  <p className="truncate text-[11px] text-on-surface-variant">
                    {person.specialty}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                {person.status === "available" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-success">
                    <span className="size-1.5 rounded-full bg-success" />
                    Available
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-high px-1.5 py-0.5 font-mono text-[10px] font-medium text-on-surface-variant">
                    <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                    In Treatment
                  </span>
                )}
                <p className="mt-0.5 text-[11px] text-on-surface-variant">
                  {person.nextLabel}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative space-y-4 overflow-hidden rounded-2xl bg-white p-5 shadow-sm">
        <div className="pointer-events-none absolute -right-6 -bottom-6 size-32 rounded-full bg-primary/5" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
              <Icon name="smart_toy" className="text-[18px]" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-on-surface">
                DIUK AI Engine
              </h3>
              <p className="text-[11px] text-on-surface-variant">
                Autonomous Orchestrator
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-success">
            <span className="size-1.5 animate-pulse rounded-full bg-success" />
            ACTIVE
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-surface-container-low p-2 text-center">
          <div className="p-1.5">
            <p className="text-lg leading-none font-semibold text-primary">82.4%</p>
            <p className="mt-0.5 text-[11px] text-on-surface-variant">Handled</p>
          </div>
          <div className="p-1.5">
            <p className="text-lg leading-none font-semibold text-on-surface">64</p>
            <p className="mt-0.5 text-[11px] text-on-surface-variant">Bookings/wk</p>
          </div>
          <div className="p-1.5">
            <p className="text-lg leading-none font-semibold text-secondary">127</p>
            <p className="mt-0.5 text-[11px] text-on-surface-variant">Leads Cap.</p>
          </div>
        </div>
        <Link
          href={`${copy.workspaceBase}/workflows`}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-surface-container-high px-3 py-2 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container"
        >
          <Icon name="tune" className="text-[16px] text-primary" />
          Manage Workflows & Prompts
        </Link>
      </section>
    </div>
  );
}
