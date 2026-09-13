import { prisma } from "@/lib/prisma";
import {
  resolveScheduleDateKey,
  shiftDateKey,
} from "@/lib/appointment/day-schedule";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const DEFAULT_START = "09:00";
const DEFAULT_END = "17:00";

export type DoctorHoursRow = {
  practitionerId: string;
  name: string;
  initials: string;
  specialty: string;
  isActive: boolean;
  scheduleId: string | null;
  startTime: string;
  endTime: string;
  isOff: boolean;
  note: string | null;
  hasCustom: boolean;
};

export type DoctorHoursPayload = {
  date: string;
  label: string;
  isToday: boolean;
  doctors: DoctorHoursRow[];
};

function formatDayLabel(dateKey: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateKey}T12:00:00+07:00`));
}

function toDateOnly(dateKey: string) {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "DR";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function isValidTime(value: string) {
  return TIME_PATTERN.test(value);
}

export async function getDoctorHoursForDate(
  businessId: string,
  dateInput?: string | null,
): Promise<DoctorHoursPayload> {
  const date = resolveScheduleDateKey(dateInput);
  const today = resolveScheduleDateKey(null);
  const dateOnly = toDateOnly(date);

  const [doctors, schedules] = await Promise.all([
    prisma.practitioner.findMany({
      where: { businessId },
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        title: true,
        specialty: true,
        location: true,
        isActive: true,
      },
    }),
    prisma.practitionerDaySchedule.findMany({
      where: { businessId, date: dateOnly },
    }),
  ]);

  const byDoctor = new Map(
    schedules.map((item) => [item.practitionerId, item] as const),
  );

  return {
    date,
    label: formatDayLabel(date),
    isToday: date === today,
    doctors: doctors.map((doctor) => {
      const schedule = byDoctor.get(doctor.id);
      const specialty = [doctor.title, doctor.specialty, doctor.location]
        .filter(Boolean)
        .join(" · ");

      return {
        practitionerId: doctor.id,
        name: doctor.name,
        initials: initialsFrom(doctor.name),
        specialty: specialty || "General",
        isActive: doctor.isActive,
        scheduleId: schedule?.id ?? null,
        startTime: schedule?.startTime ?? DEFAULT_START,
        endTime: schedule?.endTime ?? DEFAULT_END,
        isOff: schedule?.isOff ?? false,
        note: schedule?.note ?? null,
        hasCustom: Boolean(schedule),
      };
    }),
  };
}

export async function upsertDoctorHours(input: {
  businessId: string;
  practitionerId: string;
  date: string;
  startTime: string;
  endTime: string;
  isOff: boolean;
  note?: string | null;
}) {
  const date = resolveScheduleDateKey(input.date);
  if (!isValidTime(input.startTime) || !isValidTime(input.endTime)) {
    throw new Error("Invalid time format. Use HH:MM.");
  }
  if (!input.isOff && input.startTime >= input.endTime) {
    throw new Error("Start time must be before end time.");
  }

  const doctor = await prisma.practitioner.findFirst({
    where: { id: input.practitionerId, businessId: input.businessId },
    select: { id: true },
  });
  if (!doctor) {
    throw new Error("Doctor not found.");
  }

  return prisma.practitionerDaySchedule.upsert({
    where: {
      practitionerId_date: {
        practitionerId: input.practitionerId,
        date: toDateOnly(date),
      },
    },
    create: {
      businessId: input.businessId,
      practitionerId: input.practitionerId,
      date: toDateOnly(date),
      startTime: input.startTime,
      endTime: input.endTime,
      isOff: input.isOff,
      note: input.note?.trim() || null,
    },
    update: {
      startTime: input.startTime,
      endTime: input.endTime,
      isOff: input.isOff,
      note: input.note?.trim() || null,
    },
  });
}

export async function clearDoctorHours(input: {
  businessId: string;
  practitionerId: string;
  date: string;
}) {
  const date = resolveScheduleDateKey(input.date);
  await prisma.practitionerDaySchedule.deleteMany({
    where: {
      businessId: input.businessId,
      practitionerId: input.practitionerId,
      date: toDateOnly(date),
    },
  });
}

export { shiftDateKey, resolveScheduleDateKey };
