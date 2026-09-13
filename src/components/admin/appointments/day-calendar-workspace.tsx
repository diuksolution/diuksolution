"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { CrmBookingStatus } from "@prisma/client";
import { Icon } from "@/components/ui/icon";
import type { DayScheduleData } from "@/lib/appointment/day-schedule";
import { shiftDateKey } from "@/lib/appointment/day-schedule";
import {
  BOOKING_STATUS_LABELS,
  MANUAL_BOOKING_STATUSES,
} from "@/lib/crm/labels";

const STATUS_ORDER: CrmBookingStatus[] = [
  "BOOKED",
  "DP",
  "PAID",
  "DONE",
  "CANCELLED",
];

const statusClass: Record<CrmBookingStatus, string> = {
  BOOKED: "bg-info/15 text-info border-info/30",
  DP: "bg-warning/15 text-warning border-warning/30",
  PAID: "bg-secondary/10 text-secondary border-secondary/25",
  DONE: "bg-success/15 text-success border-success/30",
  CANCELLED: "bg-error/15 text-error border-error/30",
};

export function DayCalendarWorkspace({
  data,
  chatBaseHref = "/admin/clinic/chat",
}: {
  data: DayScheduleData;
  chatBaseHref?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function goToDate(nextDate: string) {
    const params = new URLSearchParams();
    params.set("date", nextDate);
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  }

  async function updateStatus(id: string, status: CrmBookingStatus) {
    if (!MANUAL_BOOKING_STATUSES.includes(status)) {
      return;
    }

    setError(null);
    setSavingId(id);

    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to update status.");
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface">
            Appointments
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Daily schedule · {data.label}
            {data.isToday ? " · Today" : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => goToDate(shiftDateKey(data.date, -1))}
            disabled={pending}
            className="inline-flex size-10 items-center justify-center rounded-xl border border-outline-variant bg-white text-on-surface hover:bg-surface-container-low disabled:opacity-60"
            aria-label="Previous day"
          >
            <Icon name="chevron_left" className="text-[22px]" />
          </button>

          <label className="inline-flex items-center gap-2 rounded-xl border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface shadow-sm">
            <Icon name="calendar_month" className="text-[18px] text-primary-dark" />
            <input
              type="date"
              value={data.date}
              onChange={(event) => {
                if (event.target.value) {
                  goToDate(event.target.value);
                }
              }}
              className="bg-transparent font-medium text-on-surface outline-none"
            />
          </label>

          <button
            type="button"
            onClick={() => goToDate(shiftDateKey(data.date, 1))}
            disabled={pending}
            className="inline-flex size-10 items-center justify-center rounded-xl border border-outline-variant bg-white text-on-surface hover:bg-surface-container-low disabled:opacity-60"
            aria-label="Next day"
          >
            <Icon name="chevron_right" className="text-[22px]" />
          </button>

          {!data.isToday ? (
            <button
              type="button"
              onClick={() => {
                startTransition(() => {
                  router.push("/admin/clinic/appointments");
                });
              }}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
            >
              Today
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {[
          { label: "Total", value: data.total, icon: "event_note" },
          { label: "Booked", value: data.byStatus.BOOKED, icon: "event_available" },
          { label: "DP", value: data.byStatus.DP, icon: "payments" },
          { label: "Paid", value: data.byStatus.PAID, icon: "paid" },
          { label: "Done", value: data.byStatus.DONE, icon: "check_circle" },
        ].map((card) => (
          <article
            key={card.label}
            className="rounded-2xl border border-outline-variant bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium tracking-wide text-on-surface-variant uppercase">
                  {card.label}
                </p>
                <p className="mt-1 text-2xl font-semibold text-on-surface">
                  {card.value}
                </p>
              </div>
              <div className="flex size-9 items-center justify-center rounded-xl bg-surface-container-high">
                <Icon name={card.icon} className="text-[18px] text-primary-dark" />
              </div>
            </div>
          </article>
        ))}
      </div>

      {error ? (
        <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-on-surface">
              Daily appointments
            </h2>
            <p className="text-xs text-on-surface-variant">
              Silahkan ubah status menjadi{" "}
              <span className="font-semibold text-on-surface">Done</span> jika customer sudah selesai.
            </p>
          </div>
          {pending || savingId ? (
            <span className="font-mono text-[11px] text-on-surface-variant">
              Updating…
            </span>
          ) : null}
        </div>

        {data.total === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-5 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-surface-container-high">
              <Icon name="event_busy" className="text-[24px] text-outline" />
            </div>
            <p className="text-sm font-medium text-on-surface">
              Tidak ada appointment di tanggal ini
            </p>
            <p className="max-w-sm text-xs text-on-surface-variant">
              Ganti tanggal di filter, atau booking baru akan muncul otomatis di
              sini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-surface-container-low">
                <tr className="border-b border-outline-variant text-[11px] font-semibold tracking-wide text-on-surface-variant uppercase">
                  <th className="px-4 py-3 whitespace-nowrap sm:px-5">Time</th>
                  <th className="px-4 py-3 sm:px-5">Patient</th>
                  <th className="px-4 py-3 sm:px-5">Doctor</th>
                  <th className="px-4 py-3 sm:px-5">Service</th>
                  <th className="px-4 py-3 sm:px-5">Status</th>
                  <th className="px-4 py-3 text-right sm:px-5">Chat</th>
                </tr>
              </thead>
              <tbody>
                {data.appointments.map((item) => {
                  const canMarkDone =
                    item.status !== "DONE" && item.status !== "CANCELLED";

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-outline-variant last:border-b-0 hover:bg-surface-container-low/70"
                    >
                      <td className="px-4 py-3 align-middle whitespace-nowrap sm:px-5">
                        <span className="rounded-lg bg-surface-container-high px-2 py-1 font-mono text-[11px] font-semibold text-on-surface">
                          {item.time}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle sm:px-5">
                        <p className="font-semibold text-on-surface">
                          {item.patientName}
                        </p>
                        <p className="font-mono text-[11px] text-on-surface-variant">
                          {item.patientPhone}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-middle text-on-surface sm:px-5">
                        {item.doctorName}
                      </td>
                      <td className="px-4 py-3 align-middle text-on-surface-variant sm:px-5">
                        <p>{item.service}</p>
                        {item.notes ? (
                          <p className="mt-0.5 text-[11px] text-outline">
                            {item.notes}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 align-middle sm:px-5">
                        <label className="relative inline-flex min-w-[7.5rem] items-center">
                          <select
                            value={item.status}
                            disabled={savingId === item.id || !canMarkDone}
                            onChange={(event) => {
                              const next = event.target
                                .value as CrmBookingStatus;
                              void updateStatus(item.id, next);
                            }}
                            className={`w-full appearance-none rounded-lg border py-1.5 pr-7 pl-2.5 font-mono text-[11px] font-semibold tracking-wide uppercase outline-none disabled:cursor-not-allowed disabled:opacity-90 ${statusClass[item.status]}`}
                            aria-label={`Status for ${item.patientName}`}
                          >
                            {STATUS_ORDER.map((status) => {
                              const selectable =
                                MANUAL_BOOKING_STATUSES.includes(status) ||
                                status === item.status;
                              return (
                                <option
                                  key={status}
                                  value={status}
                                  disabled={!selectable}
                                >
                                  {BOOKING_STATUS_LABELS[status]}
                                  {!MANUAL_BOOKING_STATUSES.includes(status) &&
                                  status !== item.status
                                    ? " (auto)"
                                    : ""}
                                </option>
                              );
                            })}
                          </select>
                          <Icon
                            name="expand_more"
                            className="pointer-events-none absolute right-1.5 text-[16px] opacity-70"
                          />
                        </label>
                      </td>
                      <td className="px-4 py-3 align-middle text-right sm:px-5">
                        {item.conversationId ? (
                          <Link
                            href={`${chatBaseHref}?c=${item.conversationId}`}
                            className="inline-flex items-center justify-center gap-1 rounded-lg border border-outline-variant bg-white px-2.5 py-1.5 text-xs font-semibold text-on-surface hover:bg-surface-container-low"
                          >
                            Open chat
                            <Icon name="arrow_forward" className="text-[14px]" />
                          </Link>
                        ) : (
                          <span className="font-mono text-[11px] text-outline">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
