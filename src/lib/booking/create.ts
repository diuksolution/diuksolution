import { prisma } from "@/lib/prisma";
import { createCalendarEvent } from "@/lib/google-calendar/client";

export async function createDoctorBooking(input: {
  businessId: string;
  contactId: string;
  doctorId: string;
  startIso: string;
  service: string;
  serviceId?: string;
  amount?: number;
  durationMinutes?: number;
  notes?: string;
  customerName?: string;
}) {
  const doctor = await prisma.practitioner.findFirst({
    where: {
      id: input.doctorId,
      businessId: input.businessId,
      isActive: true,
      calendarSyncEnabled: true,
      googleRefreshToken: { not: null },
    },
  });

  if (!doctor) {
    throw new Error("Doctor not found or calendar not connected.");
  }

  const contact = await prisma.contact.findFirst({
    where: { id: input.contactId, businessId: input.businessId },
    select: { id: true, name: true, waId: true, lifecycle: true },
  });

  if (!contact) {
    throw new Error("Contact not found.");
  }

  const start = new Date(input.startIso);
  if (Number.isNaN(start.getTime())) {
    throw new Error("Invalid start time.");
  }

  const duration = input.durationMinutes ?? 60;
  const end = new Date(start.getTime() + duration * 60_000);
  const customerName =
    input.customerName?.trim() ||
    contact.name?.trim() ||
    contact.waId;
  const amount =
    typeof input.amount === "number" && Number.isFinite(input.amount)
      ? Math.max(0, Math.trunc(input.amount))
      : 0;

  const event = await createCalendarEvent({
    practitioner: doctor,
    summary: `${input.service} · ${customerName}`,
    description: [
      `Booked via DIUK WhatsApp AI`,
      `Customer: ${customerName}`,
      `Phone: +${contact.waId.replace(/^\+/, "")}`,
      amount > 0 ? `Price: Rp ${amount.toLocaleString("id-ID")}` : null,
      input.notes ? `Notes: ${input.notes}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
    start,
    end,
    timeZone: doctor.timezone || "Asia/Jakarta",
  });

  const booking = await prisma.crmBooking.create({
    data: {
      businessId: input.businessId,
      contactId: contact.id,
      practitionerId: doctor.id,
      service: input.service,
      staffName: doctor.name,
      status: "BOOKED",
      amount,
      scheduledAt: start,
      googleEventId: event.eventId,
      notes: input.notes ?? null,
    },
  });

  await prisma.contact.update({
    where: { id: contact.id },
    data: {
      lifecycle:
        contact.lifecycle === "NEW_LEAD" ||
        contact.lifecycle === "CONTACTED" ||
        contact.lifecycle === "INTERESTED"
          ? "BOOKED"
          : contact.lifecycle === "CUSTOMER" ||
              contact.lifecycle === "RETURNING"
            ? contact.lifecycle
            : "BOOKED",
    },
  });

  return {
    bookingId: booking.id,
    doctorName: doctor.name,
    service: input.service,
    serviceId: input.serviceId ?? null,
    amount,
    start: start.toISOString(),
    googleEventId: event.eventId,
    htmlLink: event.htmlLink,
  };
}
