"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { AppointmentCopy } from "@/lib/appointment/types";
import type { AppointmentRowData } from "@/lib/appointment/dashboard-data";
import { Icon } from "@/components/ui/icon";

type Filter = "all" | "confirmed" | "waiting";

const tagClass: Record<AppointmentRowData["tag"], string> = {
  vip: "bg-primary/10 text-primary font-bold uppercase",
  returning: "bg-surface-container-high text-on-surface-variant",
  new: "bg-secondary/10 text-secondary",
};

const tagLabel: Record<AppointmentRowData["tag"], string> = {
  vip: "VIP",
  returning: "Returning",
  new: "New Lead",
};

export function AppointmentsBoard({
  copy,
  appointments,
  total,
  confirmedCount,
  waitingCount,
}: {
  copy: AppointmentCopy;
  appointments: AppointmentRowData[];
  total: number;
  confirmedCount: number;
  waitingCount: number;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const rows = useMemo(() => {
    if (filter === "all") {
      return appointments;
    }
    return appointments.filter((row) => row.status === filter);
  }, [appointments, filter]);

  return (
    <section className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm lg:col-span-8">
      <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-[22px] leading-7 font-semibold text-on-surface">
            Today&apos;s Appointments
          </h2>
          <p className="text-[13px] text-on-surface-variant">
            {copy.appointmentsSubtitle}
          </p>
        </div>
        <div className="flex items-center gap-1 self-start rounded-xl bg-surface-container-low p-0.5 sm:self-auto">
          {(
            [
              ["all", `All (${total})`],
              ["confirmed", `Confirmed (${confirmedCount})`],
              ["waiting", `Waiting (${waitingCount})`],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-lg px-3 py-0.5 text-xs font-medium transition-colors ${
                filter === value
                  ? "bg-white font-semibold text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 px-5 pb-5">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex flex-col justify-between gap-3 rounded-xl bg-surface-container-low p-4 transition-colors hover:bg-surface-container sm:flex-row sm:items-center"
          >
            <div className="flex min-w-0 items-start gap-4 sm:items-center">
              <div className="shrink-0 rounded-lg bg-surface-container-high px-2 py-1.5 font-mono text-[11px] font-semibold text-on-surface">
                {row.time}
              </div>
              <div className="min-w-0 space-y-0.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="truncate text-sm font-semibold text-on-surface">
                    {row.customer}
                  </span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] ${tagClass[row.tag]}`}
                  >
                    {tagLabel[row.tag]}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-on-surface-variant">
                  <span className="font-medium text-on-surface">
                    {row.practitioner}
                  </span>
                  <span>•</span>
                  <span>{row.location}</span>
                  <span>•</span>
                  <span className="truncate text-primary">{row.service}</span>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
              {row.status === "confirmed" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 font-mono text-[11px] font-medium text-success">
                  <span className="size-1.5 rounded-full bg-success" />
                  Confirmed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-error/10 px-2 py-0.5 font-mono text-[11px] font-medium text-error">
                  <span className="size-1.5 rounded-full bg-error" />
                  Waiting Deposit
                </span>
              )}
              {row.action === "checkin" ? (
                <button
                  type="button"
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-primary-dark"
                >
                  {copy.checkIn}
                </button>
              ) : null}
              {row.action === "qris" ? (
                <button
                  type="button"
                  className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-secondary-dark"
                >
                  Send QRIS
                </button>
              ) : null}
              {row.action === "details" ? (
                <button
                  type="button"
                  className="rounded-lg bg-surface-container-high px-3 py-1.5 text-xs font-medium text-on-surface hover:bg-surface-container"
                >
                  Details
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between bg-surface-container-low p-4">
        <span className="text-[11px] text-on-surface-variant">
          Displaying {rows.length} of {total} booked consultations
        </span>
        <Link
          href={`${copy.workspaceBase}/appointments`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark"
        >
          View All Appointments
          <Icon name="arrow_forward" className="text-[16px]" />
        </Link>
      </div>
    </section>
  );
}
