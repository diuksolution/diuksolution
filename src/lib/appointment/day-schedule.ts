import type { CrmBookingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { BOOKING_STATUS_LABELS } from "@/lib/crm/labels";

const TIME_ZONE = "Asia/Jakarta";

export type DayAppointmentItem = {
  id: string;
  time: string;
  hourKey: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  service: string;
  status: CrmBookingStatus;
  statusLabel: string;
  notes: string | null;
  conversationId: string | null;
};

export type DayScheduleData = {
  date: string;
  label: string;
  isToday: boolean;
  appointments: DayAppointmentItem[];
  total: number;
  byStatus: Record<CrmBookingStatus, number>;
  hours: string[];
};

function formatDateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatDayLabel(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00+07:00`);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function formatHourKey(date: Date) {
  return `${formatTime(date).slice(0, 2)}:00`;
}

function isValidDateKey(value: string | undefined | null): value is string {
  if (!value) {
    return false;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T12:00:00+07:00`);
  return !Number.isNaN(parsed.getTime());
}

export function resolveScheduleDateKey(input?: string | null) {
  const today = formatDateKey(new Date());
  return isValidDateKey(input) ? input : today;
}

export function shiftDateKey(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getDayBounds(dateKey: string) {
  return {
    start: new Date(`${dateKey}T00:00:00.000+07:00`),
    end: new Date(`${dateKey}T23:59:59.999+07:00`),
  };
}

function buildHourRail(appointments: DayAppointmentItem[]) {
  return Array.from(new Set(appointments.map((item) => item.hourKey))).sort();
}

export async function getDayScheduleData(
  businessId: string,
  dateInput?: string | null,
): Promise<DayScheduleData> {
  const date = resolveScheduleDateKey(dateInput);
  const today = formatDateKey(new Date());
  const { start, end } = getDayBounds(date);

  const rows = await prisma.crmBooking.findMany({
    where: {
      businessId,
      scheduledAt: {
        gte: start,
        lte: end,
      },
    },
    include: {
      contact: {
        select: {
          id: true,
          name: true,
          waId: true,
          conversations: {
            where: { channel: "whatsapp" },
            select: { id: true },
            take: 1,
          },
        },
      },
      practitioner: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { scheduledAt: "asc" },
  });

  const appointments: DayAppointmentItem[] = rows.map((row) => ({
    id: row.id,
    time: formatTime(row.scheduledAt),
    hourKey: formatHourKey(row.scheduledAt),
    patientName: row.contact.name?.trim() || row.contact.waId,
    patientPhone: `+${row.contact.waId.replace(/^\+/, "")}`,
    doctorName: row.practitioner?.name || row.staffName || "Unassigned",
    service: row.service,
    status: row.status,
    statusLabel: BOOKING_STATUS_LABELS[row.status],
    notes: row.notes,
    conversationId: row.contact.conversations[0]?.id ?? null,
  }));

  const byStatus: Record<CrmBookingStatus, number> = {
    BOOKED: 0,
    CANCELLED: 0,
    DP: 0,
    PAID: 0,
    DONE: 0,
  };

  for (const item of appointments) {
    byStatus[item.status] += 1;
  }

  return {
    date,
    label: formatDayLabel(date),
    isToday: date === today,
    appointments,
    total: appointments.length,
    byStatus,
    hours: buildHourRail(appointments),
  };
}
