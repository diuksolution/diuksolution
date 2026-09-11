import { prisma } from "@/lib/prisma";
import type {
  PractitionerInput,
  PractitionerRow,
  PractitionerTone,
} from "@/lib/practitioners/types";

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

function resolveTone(value: string): PractitionerTone {
  if (value === "secondary" || value === "success") {
    return value;
  }
  return "primary";
}

function mapPractitioner(row: {
  id: string;
  name: string;
  title: string | null;
  specialty: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  isActive: boolean;
  timezone: string;
  tone: string;
  googleAccountEmail: string | null;
  googleCalendarId: string | null;
  googleConnectedAt: Date | null;
  calendarSyncEnabled: boolean;
}): PractitionerRow {
  const specialtyBits = [row.title, row.specialty, row.location]
    .filter(Boolean)
    .join(" · ");

  return {
    id: row.id,
    name: row.name,
    initials: initialsFrom(row.name),
    title: row.title,
    specialty: row.specialty,
    email: row.email,
    phone: row.phone,
    location: row.location,
    bio: row.bio,
    isActive: row.isActive,
    timezone: row.timezone,
    tone: resolveTone(row.tone),
    googleAccountEmail: row.googleAccountEmail,
    googleCalendarId: row.googleCalendarId,
    googleConnectedAt: row.googleConnectedAt?.toISOString() ?? null,
    calendarSyncEnabled: row.calendarSyncEnabled,
    calendarStatus:
      row.calendarSyncEnabled && row.googleCalendarId
        ? "connected"
        : "disconnected",
    displaySpecialty: specialtyBits || "General",
  };
}

export async function listPractitioners(businessId: string) {
  const rows = await prisma.practitioner.findMany({
    where: { businessId },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  return rows.map(mapPractitioner);
}

export async function createPractitioner(
  businessId: string,
  input: PractitionerInput,
) {
  const name = input.name.trim();
  if (!name) {
    return null;
  }

  const row = await prisma.practitioner.create({
    data: {
      businessId,
      name,
      title: input.title?.trim() || null,
      specialty: input.specialty?.trim() || null,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      location: input.location?.trim() || null,
      bio: input.bio?.trim() || null,
      isActive: input.isActive ?? true,
      timezone: input.timezone?.trim() || "Asia/Jakarta",
      tone: input.tone ?? "primary",
    },
  });

  return mapPractitioner(row);
}

export async function updatePractitioner(
  businessId: string,
  id: string,
  input: Partial<PractitionerInput>,
) {
  const existing = await prisma.practitioner.findFirst({
    where: { id, businessId },
    select: { id: true },
  });
  if (!existing) {
    return null;
  }

  const row = await prisma.practitioner.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.title !== undefined
        ? { title: input.title?.trim() || null }
        : {}),
      ...(input.specialty !== undefined
        ? { specialty: input.specialty?.trim() || null }
        : {}),
      ...(input.email !== undefined
        ? { email: input.email?.trim() || null }
        : {}),
      ...(input.phone !== undefined
        ? { phone: input.phone?.trim() || null }
        : {}),
      ...(input.location !== undefined
        ? { location: input.location?.trim() || null }
        : {}),
      ...(input.bio !== undefined ? { bio: input.bio?.trim() || null } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.timezone !== undefined
        ? { timezone: input.timezone.trim() || "Asia/Jakarta" }
        : {}),
      ...(input.tone !== undefined ? { tone: input.tone } : {}),
    },
  });

  return mapPractitioner(row);
}

export async function ensureClinicDemoDoctors(businessId: string) {
  const count = await prisma.practitioner.count({ where: { businessId } });
  if (count > 0) {
    return;
  }

  const demos = [
    {
      name: "Dr. Sarah Wijaya",
      title: "Sp.KK",
      specialty: "Dermatologist",
      location: "Suite 2",
      email: "sarah@klinikayu.example",
      phone: "+6281110002001",
      tone: "primary" as const,
    },
    {
      name: "Dr. Kevin Pratama",
      title: "Sp.DV",
      specialty: "Aesthetic Doctor",
      location: "Laser 1",
      email: "kevin@klinikayu.example",
      phone: "+6281110002002",
      tone: "secondary" as const,
    },
    {
      name: "Dr. Maya Siregar",
      title: "Sp.BP-RE",
      specialty: "Plastic & Aesthetic",
      location: "Suite 3",
      email: "maya@klinikayu.example",
      phone: "+6281110002003",
      tone: "success" as const,
    },
  ];

  await prisma.practitioner.createMany({
    data: demos.map((item) => ({
      businessId,
      ...item,
      timezone: "Asia/Jakarta",
      isActive: true,
      updatedAt: new Date(),
    })),
  });
}
