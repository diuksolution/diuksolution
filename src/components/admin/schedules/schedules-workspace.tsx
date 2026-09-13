"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import type { CrmBookingStatus } from "@prisma/client";
import { Icon } from "@/components/ui/icon";
import { shiftDateKey } from "@/lib/appointment/day-schedule";
import type { CalendarPayload, CalendarView } from "@/lib/schedules/calendar";
import type { DoctorHoursPayload } from "@/lib/schedules/doctor-hours";

type TabId = "doctors" | "calendar";

const statusClass: Record<CrmBookingStatus, string> = {
  BOOKED: "bg-info/15 text-info border-info/30",
  DP: "bg-warning/15 text-warning border-warning/30",
  PAID: "bg-secondary/10 text-secondary border-secondary/25",
  DONE: "bg-success/15 text-success border-success/30",
  CANCELLED: "bg-error/15 text-error border-error/30",
};

const eventChipClass: Record<CrmBookingStatus, string> = {
  BOOKED: "bg-info/20 text-info border-info/35",
  DP: "bg-warning/20 text-warning border-warning/35",
  PAID: "bg-secondary/15 text-secondary border-secondary/30",
  DONE: "bg-success/20 text-success border-success/35",
  CANCELLED: "bg-error/15 text-error border-error/30",
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function buildHref(input: {
  tab: TabId;
  date: string;
  view?: CalendarView;
}) {
  const params = new URLSearchParams();
  params.set("tab", input.tab);
  params.set("date", input.date);
  if (input.tab === "calendar" && input.view) {
    params.set("view", input.view);
  }
  return `/admin/clinic/schedules?${params.toString()}`;
}

export function SchedulesWorkspace({
  doctorHours,
  calendar,
  initialTab,
}: {
  doctorHours: DoctorHoursPayload;
  calendar: CalendarPayload;
  initialTab: TabId;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [tab, setTab] = useState<TabId>(initialTab);
  const [drafts, setDrafts] = useState(() =>
    Object.fromEntries(
      doctorHours.doctors.map((doctor) => [
        doctor.practitionerId,
        {
          startTime: doctor.startTime,
          endTime: doctor.endTime,
          isOff: doctor.isOff,
          note: doctor.note ?? "",
        },
      ]),
    ),
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    setDrafts(
      Object.fromEntries(
        doctorHours.doctors.map((doctor) => [
          doctor.practitionerId,
          {
            startTime: doctor.startTime,
            endTime: doctor.endTime,
            isOff: doctor.isOff,
            note: doctor.note ?? "",
          },
        ]),
      ),
    );
  }, [doctorHours]);

  const date = tab === "doctors" ? doctorHours.date : calendar.anchorDate;
  const view = calendar.view;

  const availableCount = useMemo(
    () => doctorHours.doctors.filter((d) => d.isActive && !d.isOff).length,
    [doctorHours.doctors],
  );
  const offCount = useMemo(
    () => doctorHours.doctors.filter((d) => d.isOff).length,
    [doctorHours.doctors],
  );

  function navigate(next: {
    tab?: TabId;
    date?: string;
    view?: CalendarView;
  }) {
    const nextTab = next.tab ?? tab;
    const nextDate = next.date ?? date;
    const nextView = next.view ?? view;
    startTransition(() => {
      router.push(
        buildHref({
          tab: nextTab,
          date: nextDate,
          view: nextView,
        }),
      );
    });
  }

  function switchTab(nextTab: TabId) {
    setTab(nextTab);
    navigate({ tab: nextTab });
  }

  async function saveDoctor(
    practitionerId: string,
    options?: { clear?: boolean },
  ) {
    const draft = drafts[practitionerId];
    if (!draft) {
      return;
    }

    setError(null);
    setMessage(null);
    setSavingId(practitionerId);

    try {
      const response = await fetch("/api/schedules/doctor-hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          practitionerId,
          date: doctorHours.date,
          startTime: draft.startTime,
          endTime: draft.endTime,
          isOff: draft.isOff,
          note: draft.note,
          clear: options?.clear,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to save.");
      }
      setMessage(options?.clear ? "Reset to default hours." : "Schedule saved.");
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface">
            Schedules
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Atur jam kerja dokter per hari, dan lihat kalender appointment.
          </p>
        </div>

        <div className="inline-flex rounded-xl bg-surface-container-low p-1">
          {(
            [
              ["doctors", "Doctor hours", "stethoscope"],
              ["calendar", "Calendar", "calendar_month"],
            ] as const
          ).map(([id, label, icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => switchTab(id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                tab === id
                  ? "bg-white text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Icon name={icon} className="text-[18px]" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => navigate({ date: shiftDateKey(date, -1) })}
          disabled={pending}
          className="inline-flex size-10 items-center justify-center rounded-xl border border-outline-variant bg-white hover:bg-surface-container-low disabled:opacity-60"
          aria-label="Previous"
        >
          <Icon name="chevron_left" className="text-[22px]" />
        </button>
        <label className="inline-flex items-center gap-2 rounded-xl border border-outline-variant bg-white px-3 py-2 text-sm shadow-sm">
          <Icon name="calendar_month" className="text-[18px] text-primary-dark" />
          <input
            type="date"
            value={date}
            onChange={(event) => {
              if (event.target.value) {
                navigate({ date: event.target.value });
              }
            }}
            className="bg-transparent font-medium outline-none"
          />
        </label>
        <button
          type="button"
          onClick={() => navigate({ date: shiftDateKey(date, 1) })}
          disabled={pending}
          className="inline-flex size-10 items-center justify-center rounded-xl border border-outline-variant bg-white hover:bg-surface-container-low disabled:opacity-60"
          aria-label="Next"
        >
          <Icon name="chevron_right" className="text-[22px]" />
        </button>
        <button
          type="button"
          onClick={() => {
            const today = new Intl.DateTimeFormat("en-CA", {
              timeZone: "Asia/Jakarta",
            }).format(new Date());
            navigate({ date: today });
          }}
          className="rounded-xl bg-primary px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Today
        </button>

        {tab === "calendar" ? (
          <div className="ml-auto inline-flex rounded-xl bg-surface-container-low p-1">
            {(["day", "week", "month", "year"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => navigate({ view: item })}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${
                  view === item
                    ? "bg-white text-on-surface shadow-sm"
                    : "text-on-surface-variant"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          {message}
        </div>
      ) : null}

      {tab === "doctors" ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: "Date",
                value: doctorHours.isToday ? "Today" : doctorHours.date,
                icon: "event",
              },
              {
                label: "Doctors",
                value: String(doctorHours.doctors.length),
                icon: "group",
              },
              {
                label: "Available",
                value: String(availableCount),
                icon: "event_available",
              },
              {
                label: "Day off",
                value: String(offCount),
                icon: "event_busy",
              },
            ].map((card) => (
              <article
                key={card.label}
                className="rounded-2xl border border-outline-variant bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-medium tracking-wide text-on-surface-variant uppercase">
                      {card.label}
                    </p>
                    <p className="mt-1 text-xl font-semibold text-on-surface">
                      {card.value}
                    </p>
                  </div>
                  <Icon name={card.icon} className="text-[18px] text-primary-dark" />
                </div>
              </article>
            ))}
          </div>

          <section className="overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm">
            <div className="border-b border-outline-variant px-5 py-4">
              <h2 className="text-lg font-semibold text-on-surface">
                Doctor hours · {doctorHours.label}
              </h2>
              <p className="text-xs text-on-surface-variant">
                Atur jam praktek per hari. Kalau berhalangan, tandai Day off.
                Default 09:00–17:00 jika belum di-set.
              </p>
            </div>

            {doctorHours.doctors.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <Icon name="stethoscope" className="text-[32px] text-outline" />
                <p className="mt-2 text-sm font-medium text-on-surface">
                  Belum ada dokter
                </p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  Tambah dokter di Doctor List dulu.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-surface-container-low text-[11px] tracking-wide text-on-surface-variant uppercase">
                    <tr>
                      <th className="px-4 py-3 sm:px-5">Doctor</th>
                      <th className="px-4 py-3 sm:px-5">Start</th>
                      <th className="px-4 py-3 sm:px-5">End</th>
                      <th className="px-4 py-3 sm:px-5">Day off</th>
                      <th className="px-4 py-3 sm:px-5">Note</th>
                      <th className="px-4 py-3 text-right sm:px-5">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctorHours.doctors.map((doctor) => {
                      const draft = drafts[doctor.practitionerId] ?? {
                        startTime: doctor.startTime,
                        endTime: doctor.endTime,
                        isOff: doctor.isOff,
                        note: doctor.note ?? "",
                      };

                      return (
                        <tr
                          key={doctor.practitionerId}
                          className="border-t border-outline-variant align-middle"
                        >
                          <td className="px-4 py-3 sm:px-5">
                            <div className="flex items-center gap-3">
                              <div className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary-dark">
                                {doctor.initials}
                              </div>
                              <div>
                                <p className="font-semibold text-on-surface">
                                  {doctor.name}
                                </p>
                                <p className="text-xs text-on-surface-variant">
                                  {doctor.specialty}
                                  {!doctor.isActive ? " · Inactive" : ""}
                                  {!doctor.hasCustom ? " · Default" : ""}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 sm:px-5">
                            <input
                              type="time"
                              value={draft.startTime}
                              disabled={draft.isOff || savingId === doctor.practitionerId}
                              onChange={(event) =>
                                setDrafts((prev) => ({
                                  ...prev,
                                  [doctor.practitionerId]: {
                                    ...draft,
                                    startTime: event.target.value,
                                  },
                                }))
                              }
                              className="h-10 rounded-xl border border-outline-variant bg-surface-container-low px-2 text-sm disabled:opacity-50"
                            />
                          </td>
                          <td className="px-4 py-3 sm:px-5">
                            <input
                              type="time"
                              value={draft.endTime}
                              disabled={draft.isOff || savingId === doctor.practitionerId}
                              onChange={(event) =>
                                setDrafts((prev) => ({
                                  ...prev,
                                  [doctor.practitionerId]: {
                                    ...draft,
                                    endTime: event.target.value,
                                  },
                                }))
                              }
                              className="h-10 rounded-xl border border-outline-variant bg-surface-container-low px-2 text-sm disabled:opacity-50"
                            />
                          </td>
                          <td className="px-4 py-3 sm:px-5">
                            <label className="inline-flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={draft.isOff}
                                onChange={(event) =>
                                  setDrafts((prev) => ({
                                    ...prev,
                                    [doctor.practitionerId]: {
                                      ...draft,
                                      isOff: event.target.checked,
                                    },
                                  }))
                                }
                                className="size-4 rounded border-outline-variant"
                              />
                              Off
                            </label>
                          </td>
                          <td className="px-4 py-3 sm:px-5">
                            <input
                              value={draft.note}
                              onChange={(event) =>
                                setDrafts((prev) => ({
                                  ...prev,
                                  [doctor.practitionerId]: {
                                    ...draft,
                                    note: event.target.value,
                                  },
                                }))
                              }
                              placeholder="Opsional"
                              className="h-10 w-full min-w-40 rounded-xl border border-outline-variant bg-surface-container-low px-3 text-sm"
                            />
                          </td>
                          <td className="px-4 py-3 text-right sm:px-5">
                            <div className="inline-flex flex-wrap justify-end gap-2">
                              <button
                                type="button"
                                disabled={savingId === doctor.practitionerId}
                                onClick={() =>
                                  void saveDoctor(doctor.practitionerId)
                                }
                                className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
                              >
                                Save
                              </button>
                              {doctor.hasCustom ? (
                                <button
                                  type="button"
                                  disabled={savingId === doctor.practitionerId}
                                  onClick={() =>
                                    void saveDoctor(doctor.practitionerId, {
                                      clear: true,
                                    })
                                  }
                                  className="rounded-xl border border-outline-variant bg-white px-3 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-low disabled:opacity-60"
                                >
                                  Reset
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-on-surface">
                {calendar.label}
              </h2>
              <p className="text-xs text-on-surface-variant">
                {calendar.events.length} appointment
                {calendar.events.length === 1 ? "" : "s"} in this range
              </p>
            </div>
            {pending ? (
              <span className="font-mono text-[11px] text-on-surface-variant">
                Loading…
              </span>
            ) : null}
          </div>

          {view === "year" ? (
            <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 lg:grid-cols-4">
              {calendar.yearMonths.map((month) => (
                <button
                  key={month.month}
                  type="button"
                  onClick={() => {
                    const next = `${calendar.anchorDate.slice(0, 4)}-${String(month.month).padStart(2, "0")}-01`;
                    navigate({ date: next, view: "month" });
                  }}
                  className="rounded-2xl border border-outline-variant bg-surface-container-low/50 p-4 text-left hover:border-primary/40 hover:bg-white"
                >
                  <p className="text-sm font-semibold text-on-surface">
                    {month.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-on-surface">
                    {month.count}
                  </p>
                  <p className="text-xs text-on-surface-variant">appointments</p>
                </button>
              ))}
            </div>
          ) : null}

          {view === "month" ? (
            <div className="p-4 sm:p-5">
              <div className="mb-2 grid grid-cols-7 gap-1">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="px-1 py-2 text-center font-mono text-[10px] font-semibold tracking-wide text-on-surface-variant uppercase"
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendar.monthGrid.map((cell) => (
                  <button
                    key={cell.dateKey}
                    type="button"
                    onClick={() => navigate({ date: cell.dateKey, view: "day" })}
                    className={`min-h-28 rounded-xl border p-2 text-left transition-colors ${
                      cell.inMonth
                        ? "border-outline-variant bg-white hover:border-primary/40"
                        : "border-transparent bg-surface-container-low/40 text-outline"
                    } ${cell.isToday ? "ring-2 ring-primary/40" : ""}`}
                  >
                    <p
                      className={`font-mono text-xs font-semibold ${
                        cell.isToday ? "text-primary-dark" : "text-on-surface"
                      }`}
                    >
                      {cell.day}
                    </p>
                    <div className="mt-1 space-y-1">
                      {cell.events.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className={`rounded border px-1 py-0.5 ${eventChipClass[event.status]}`}
                          title={`${event.time} · ${event.patientName} · ${event.doctorName} · ${event.statusLabel}`}
                        >
                          <p className="truncate text-[10px] font-semibold leading-tight">
                            {event.time} {event.patientName}
                          </p>
                          <p className="truncate text-[9px] leading-tight opacity-90">
                            {event.doctorName} · {event.statusLabel}
                          </p>
                        </div>
                      ))}
                      {cell.events.length > 3 ? (
                        <p className="text-[10px] text-on-surface-variant">
                          +{cell.events.length - 3} more
                        </p>
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {view === "week" || view === "day" ? (
            <div className="overflow-x-auto">
              {calendar.events.length === 0 ? (
                <div className="px-5 py-16 text-center">
                  <Icon name="event_busy" className="text-[32px] text-outline" />
                  <p className="mt-2 text-sm font-medium text-on-surface">
                    Tidak ada appointment di rentang ini
                  </p>
                </div>
              ) : (
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-surface-container-low text-[11px] tracking-wide text-on-surface-variant uppercase">
                    <tr>
                      <th className="px-4 py-3 sm:px-5">Date</th>
                      <th className="px-4 py-3 sm:px-5">Time</th>
                      <th className="px-4 py-3 sm:px-5">Patient</th>
                      <th className="px-4 py-3 sm:px-5">Doctor</th>
                      <th className="px-4 py-3 sm:px-5">Service</th>
                      <th className="px-4 py-3 sm:px-5">Status</th>
                      <th className="px-4 py-3 text-right sm:px-5">Open</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calendar.events.map((event) => (
                      <tr
                        key={event.id}
                        className="border-t border-outline-variant"
                      >
                        <td className="px-4 py-3 whitespace-nowrap sm:px-5">
                          {event.dateKey}
                        </td>
                        <td className="px-4 py-3 sm:px-5">
                          <span className="rounded-lg bg-surface-container-high px-2 py-1 font-mono text-[11px] font-semibold">
                            {event.time}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium sm:px-5">
                          {event.patientName}
                        </td>
                        <td className="px-4 py-3 sm:px-5">{event.doctorName}</td>
                        <td className="px-4 py-3 text-on-surface-variant sm:px-5">
                          {event.service}
                        </td>
                        <td className="px-4 py-3 sm:px-5">
                          <span
                            className={`inline-flex rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase ${statusClass[event.status]}`}
                          >
                            {event.statusLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right sm:px-5">
                          <Link
                            href={`/admin/clinic/appointments?date=${event.dateKey}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-outline-variant bg-white px-2.5 py-1.5 text-xs font-semibold hover:bg-surface-container-low"
                          >
                            Appointments
                            <Icon name="arrow_forward" className="text-[14px]" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}
