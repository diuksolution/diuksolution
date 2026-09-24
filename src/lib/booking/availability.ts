import { prisma } from "@/lib/prisma";

const DEFAULT_DURATION_MIN = 60;
const SLOT_STEP_MIN = 30;
const DEFAULT_START = "09:00";
const DEFAULT_END = "17:00";

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
  serviceId?: string;
  serviceName?: string;
  durationMin: number;
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
  return new Date(
    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00+07:00`,
  );
}

function dateKeyInZone(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function toDateOnly(dateKey: string) {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

function applyClock(dayStart: Date, hhmm: string) {
  const [hours, minutes] = hhmm.split(":").map(Number);
  return new Date(
    dayStart.getTime() +
      (Number.isFinite(hours) ? hours : 9) * 60 * 60 * 1000 +
      (Number.isFinite(minutes) ? minutes : 0) * 60 * 1000,
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

export async function listActiveDoctors(businessId: string) {
  return prisma.practitioner.findMany({
    where: { businessId, isActive: true },
    orderBy: { name: "asc" },
  });
}

/** Clinic hours + CRM bookings. Google freeBusy is not used — personal calendar must not hide clinic slots. */
export function parseRequestedDay(text: string, now = new Date()) {
  const value = text.toLowerCase();
  const today = startOfLocalDay(now, "Asia/Jakarta");
  if (/(hari ini|sekarang)/i.test(value)) {
    return { fromDate: now, daysAhead: 1 };
  }
  if (/besok/i.test(value)) {
    return {
      fromDate: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      daysAhead: 1,
    };
  }
  if (/lusa/i.test(value)) {
    return {
      fromDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
      daysAhead: 1,
    };
  }
  return null;
}

async function filterDoctorsForService(
  businessId: string,
  doctors: ConnectedDoctor[],
  serviceId?: string,
) {
  if (!serviceId) {
    return doctors;
  }

  const links = await prisma.practitionerService.findMany({
    where: { serviceId, practitioner: { businessId } },
    select: { practitionerId: true },
  });
  if (links.length === 0) {
    return [];
  }
  const allowed = new Set(links.map((row) => row.practitionerId));
  return doctors.filter((doctor) => allowed.has(doctor.id));
}

export async function findAvailableSlots(input: {
  businessId: string;
  doctorId?: string;
  serviceId?: string;
  serviceName?: string;
  daysAhead?: number;
  durationMinutes?: number;
  fromDate?: Date;
}): Promise<AvailableSlot[]> {
  const duration = input.durationMinutes ?? DEFAULT_DURATION_MIN;
  const daysAhead = input.daysAhead ?? 7;
  const from = input.fromDate ?? new Date();

  const doctors = await filterDoctorsForService(
    input.businessId,
    await listActiveDoctors(input.businessId),
    input.serviceId,
  );
  const selected = input.doctorId
    ? doctors.filter((doctor) => doctor.id === input.doctorId)
    : doctors;

  if (selected.length === 0) {
    return [];
  }

  const timeMin = from;
  const timeMax = new Date(from.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  const doctorIds = selected.map((doctor) => doctor.id);
  const fromKey = dateKeyInZone(timeMin, "Asia/Jakarta");
  const toKey = dateKeyInZone(timeMax, "Asia/Jakarta");

  const [daySchedules, bookings] = await Promise.all([
    prisma.practitionerDaySchedule.findMany({
      where: {
        practitionerId: { in: doctorIds },
        date: { gte: toDateOnly(fromKey), lte: toDateOnly(toKey) },
      },
    }),
    prisma.crmBooking.findMany({
      where: {
        practitionerId: { in: doctorIds },
        status: { not: "CANCELLED" },
        scheduledAt: { gte: timeMin, lte: timeMax },
      },
      select: {
        practitionerId: true,
        scheduledAt: true,
        catalogService: { select: { durationMin: true } },
      },
    }),
  ]);

  const scheduleByDoctorDay = new Map(
    daySchedules.map((row) => [
      `${row.practitionerId}:${row.date.toISOString().slice(0, 10)}`,
      row,
    ]),
  );

  const bookingBusyByDoctor = new Map<string, Array<{ start: Date; end: Date }>>();
  for (const booking of bookings) {
    if (!booking.practitionerId) {
      continue;
    }
    const holdMin = booking.catalogService?.durationMin ?? duration;
    const start = booking.scheduledAt;
    const end = new Date(start.getTime() + holdMin * 60_000);
    const list = bookingBusyByDoctor.get(booking.practitionerId) ?? [];
    list.push({ start, end });
    bookingBusyByDoctor.set(booking.practitionerId, list);
  }

  const slots: AvailableSlot[] = [];

  for (const doctor of selected) {
    const busy = bookingBusyByDoctor.get(doctor.id) ?? [];

    for (let dayOffset = 0; dayOffset < daysAhead; dayOffset += 1) {
      const dayBase = new Date(from.getTime() + dayOffset * 24 * 60 * 60 * 1000);
      const dayStart = startOfLocalDay(dayBase, doctor.timezone);
      const dayKey = dateKeyInZone(dayStart, doctor.timezone);
      const schedule = scheduleByDoctorDay.get(`${doctor.id}:${dayKey}`);

      if (schedule?.isOff) {
        continue;
      }

      const windowStart = applyClock(
        dayStart,
        schedule?.startTime ?? DEFAULT_START,
      );
      const windowEnd = applyClock(dayStart, schedule?.endTime ?? DEFAULT_END);
      if (windowEnd <= windowStart) {
        continue;
      }

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

        const serviceBit = input.serviceName ? ` · ${input.serviceName}` : "";
        slots.push({
          doctorId: doctor.id,
          doctorName: doctor.title
            ? `${doctor.name} ${doctor.title}`
            : doctor.name,
          serviceId: input.serviceId,
          serviceName: input.serviceName,
          durationMin: duration,
          start: start.toISOString(),
          end: end.toISOString(),
          label: `${formatSlotLabel(start, doctor.timezone)} · ${doctor.name}${serviceBit}`,
        });
      }
    }
  }

  const limit = daysAhead <= 1 ? 16 : 12;
  const sorted = slots.sort((left, right) => left.start.localeCompare(right.start));
  const perDoctor = new Map<string, number>();
  const picked: AvailableSlot[] = [];
  for (const slot of sorted) {
    const used = perDoctor.get(slot.doctorId) ?? 0;
    if (used >= 4) {
      continue;
    }
    perDoctor.set(slot.doctorId, used + 1);
    picked.push(slot);
    if (picked.length >= limit) {
      break;
    }
  }
  return picked;
}
