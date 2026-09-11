import { prisma } from "@/lib/prisma";
import { queryFreeBusy } from "@/lib/google-calendar/client";

const DEFAULT_DURATION_MIN = 60;
const SLOT_STEP_MIN = 30;
const DAY_START_HOUR = 9;
const DAY_END_HOUR = 17;

export type ConnectedDoctor = {
  id: string;
  name: string;
  title: string | null;
  specialty: string | null;
  location: string | null;
  timezone: string;
  googleCalendarId: string | null;
  googleAccessToken: string | null;
  googleRefreshToken: string | null;
  googleTokenExpiresAt: Date | null;
};

export type AvailableSlot = {
  doctorId: string;
  doctorName: string;
  start: string;
  end: string;
  label: string;
};

function overlaps(
  start: Date,
  end: Date,
  busy: Array<{ start: Date; end: Date }>,
) {
  return busy.some((block) => start < block.end && end > block.start);
}

function formatSlotLabel(start: Date, timeZone: string) {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(start);
}

function startOfLocalDay(base: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(base);
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  // Construct as Asia/Jakarta wall time via ISO with offset +07:00
  return new Date(
    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00+07:00`,
  );
}

export async function listConnectedDoctors(businessId: string) {
  return prisma.practitioner.findMany({
    where: {
      businessId,
      isActive: true,
      calendarSyncEnabled: true,
      googleRefreshToken: { not: null },
    },
    orderBy: { name: "asc" },
  });
}

export async function findAvailableSlots(input: {
  businessId: string;
  doctorId?: string;
  daysAhead?: number;
  durationMinutes?: number;
  fromDate?: Date;
}): Promise<AvailableSlot[]> {
  const duration = input.durationMinutes ?? DEFAULT_DURATION_MIN;
  const daysAhead = input.daysAhead ?? 7;
  const from = input.fromDate ?? new Date();

  const doctors = await listConnectedDoctors(input.businessId);
  const selected = input.doctorId
    ? doctors.filter((doctor) => doctor.id === input.doctorId)
    : doctors;

  if (selected.length === 0) {
    return [];
  }

  const timeMin = from;
  const timeMax = new Date(from.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  const slots: AvailableSlot[] = [];

  for (const doctor of selected) {
    let busy: Array<{ start: Date; end: Date }> = [];
    try {
      busy = await queryFreeBusy({
        practitioner: doctor,
        timeMin,
        timeMax,
      });
    } catch (error) {
      console.error(`[booking] freeBusy failed for ${doctor.name}`, error);
      continue;
    }

    for (let dayOffset = 0; dayOffset < daysAhead; dayOffset += 1) {
      const dayBase = new Date(from.getTime() + dayOffset * 24 * 60 * 60 * 1000);
      const dayStart = startOfLocalDay(dayBase, doctor.timezone);
      const windowStart = new Date(
        dayStart.getTime() + DAY_START_HOUR * 60 * 60 * 1000,
      );
      const windowEnd = new Date(
        dayStart.getTime() + DAY_END_HOUR * 60 * 60 * 1000,
      );

      for (
        let cursor = windowStart.getTime();
        cursor + duration * 60_000 <= windowEnd.getTime();
        cursor += SLOT_STEP_MIN * 60_000
      ) {
        const start = new Date(cursor);
        const end = new Date(cursor + duration * 60_000);
        if (start < from) {
          continue;
        }
        if (overlaps(start, end, busy)) {
          continue;
        }

        slots.push({
          doctorId: doctor.id,
          doctorName: doctor.title
            ? `${doctor.name} ${doctor.title}`
            : doctor.name,
          start: start.toISOString(),
          end: end.toISOString(),
          label: `${formatSlotLabel(start, doctor.timezone)} · ${doctor.name}`,
        });
      }
    }
  }

  return slots.slice(0, 12);
}
