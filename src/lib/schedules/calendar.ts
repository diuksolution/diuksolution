import type { CrmBookingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { BOOKING_STATUS_LABELS } from "@/lib/crm/labels";
import {
  resolveScheduleDateKey,
  shiftDateKey,
} from "@/lib/appointment/day-schedule";

export type CalendarView = "day" | "week" | "month" | "year";

export type CalendarEvent = {
  id: string;
  dateKey: string;
  time: string;
  patientName: string;
  doctorName: string;
  service: string;
  status: CrmBookingStatus;
  statusLabel: string;
};

export type CalendarDayCell = {
  dateKey: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
};

export type CalendarPayload = {
  view: CalendarView;
  anchorDate: string;
  label: string;
  rangeStart: string;
  rangeEnd: string;
  events: CalendarEvent[];
  days: CalendarDayCell[];
  monthGrid: CalendarDayCell[];
  yearMonths: Array<{
    month: number;
    label: string;
    count: number;
  }>;
};

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function formatDateKeyJakarta(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function parseDateParts(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return { year, month, day };
}

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function startOfWeekMonday(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00+07:00`);
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    weekday: "short",
  }).format(date);
  const map: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };
  const offset = map[weekday] ?? 0;
  return shiftDateKey(dateKey, -offset);
}

function monthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function shortMonthLabel(month: number) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
  }).format(new Date(Date.UTC(2026, month - 1, 1)));
}

function viewLabel(view: CalendarView, anchor: string) {
  const { year, month } = parseDateParts(anchor);
  if (view === "day") {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(`${anchor}T12:00:00+07:00`));
  }
  if (view === "week") {
    const start = startOfWeekMonday(anchor);
    const end = shiftDateKey(start, 6);
    return `Week · ${start} → ${end}`;
  }
  if (view === "month") {
    return monthLabel(year, month);
  }
  return String(year);
}

function getRange(view: CalendarView, anchor: string) {
  const { year, month } = parseDateParts(anchor);

  if (view === "day") {
    return { start: anchor, end: anchor };
  }
  if (view === "week") {
    const start = startOfWeekMonday(anchor);
    return { start, end: shiftDateKey(start, 6) };
  }
  if (view === "month") {
    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    const end = `${year}-${String(month).padStart(2, "0")}-${String(daysInMonth(year, month)).padStart(2, "0")}`;
    return { start, end };
  }
  return {
    start: `${year}-01-01`,
    end: `${year}-12-31`,
  };
}

export function resolveCalendarView(value?: string | null): CalendarView {
  if (
    value === "day" ||
    value === "week" ||
    value === "month" ||
    value === "year"
  ) {
    return value;
  }
  return "month";
}

export async function getCalendarPayload(
  businessId: string,
  input?: { date?: string | null; view?: string | null },
): Promise<CalendarPayload> {
  const view = resolveCalendarView(input?.view);
  const anchorDate = resolveScheduleDateKey(input?.date);
  const today = resolveScheduleDateKey(null);
  const { start, end } = getRange(view, anchorDate);

  const rows = await prisma.crmBooking.findMany({
    where: {
      businessId,
      status: { not: "CANCELLED" },
      scheduledAt: {
        gte: new Date(`${start}T00:00:00.000+07:00`),
        lte: new Date(`${end}T23:59:59.999+07:00`),
      },
    },
    include: {
      contact: { select: { name: true, waId: true } },
      practitioner: { select: { name: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });

  const events: CalendarEvent[] = rows.map((row) => ({
    id: row.id,
    dateKey: formatDateKeyJakarta(row.scheduledAt),
    time: formatTime(row.scheduledAt),
    patientName: row.contact.name?.trim() || row.contact.waId,
    doctorName: row.practitioner?.name || row.staffName || "Unassigned",
    service: row.service,
    status: row.status,
    statusLabel: BOOKING_STATUS_LABELS[row.status],
  }));

  const byDate = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const list = byDate.get(event.dateKey) ?? [];
    list.push(event);
    byDate.set(event.dateKey, list);
  }

  const days: CalendarDayCell[] = [];
  let cursor = start;
  while (cursor <= end) {
    days.push({
      dateKey: cursor,
      day: Number(cursor.slice(8, 10)),
      inMonth: true,
      isToday: cursor === today,
      events: byDate.get(cursor) ?? [],
    });
    cursor = shiftDateKey(cursor, 1);
  }

  const { year, month } = parseDateParts(anchorDate);
  const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const gridStart = startOfWeekMonday(monthStart);
  const monthGrid: CalendarDayCell[] = [];
  let gridCursor = gridStart;
  for (let i = 0; i < 42; i += 1) {
    const inMonth = gridCursor.startsWith(
      `${year}-${String(month).padStart(2, "0")}`,
    );
    monthGrid.push({
      dateKey: gridCursor,
      day: Number(gridCursor.slice(8, 10)),
      inMonth,
      isToday: gridCursor === today,
      events: byDate.get(gridCursor) ?? [],
    });
    gridCursor = shiftDateKey(gridCursor, 1);
  }

  const yearMonths = Array.from({ length: 12 }, (_, index) => {
    const m = index + 1;
    const prefix = `${year}-${String(m).padStart(2, "0")}`;
    const count = events.filter((event) => event.dateKey.startsWith(prefix))
      .length;
    return {
      month: m,
      label: shortMonthLabel(m),
      count,
    };
  });

  return {
    view,
    anchorDate,
    label: viewLabel(view, anchorDate),
    rangeStart: start,
    rangeEnd: end,
    events,
    days,
    monthGrid,
    yearMonths,
  };
}
