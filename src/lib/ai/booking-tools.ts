import {
  findAvailableSlots,
  listConnectedDoctors,
} from "@/lib/booking/availability";
import { createDoctorBooking } from "@/lib/booking/create";

export const BOOKING_TOOL_DEFINITIONS = [
  {
    type: "function" as const,
    function: {
      name: "list_doctors",
      description:
        "List active doctors whose Google Calendar is connected and can accept bookings.",
      parameters: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "check_availability",
      description:
        "Check open appointment slots across connected doctor calendars (or one doctor).",
      parameters: {
        type: "object",
        properties: {
          doctorId: {
            type: "string",
            description: "Optional doctor id to filter.",
          },
          daysAhead: {
            type: "number",
            description: "How many days ahead to search. Default 7.",
          },
          durationMinutes: {
            type: "number",
            description: "Appointment length in minutes. Default 60.",
          },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "book_appointment",
      description:
        "Book an appointment into a doctor's Google Calendar and save it in CRM.",
      parameters: {
        type: "object",
        properties: {
          doctorId: { type: "string" },
          startIso: {
            type: "string",
            description: "ISO start datetime from check_availability.",
          },
          service: {
            type: "string",
            description: "Service name, e.g. Facial Acne / Konsultasi.",
          },
          durationMinutes: { type: "number" },
          notes: { type: "string" },
        },
        required: ["doctorId", "startIso", "service"],
        additionalProperties: false,
      },
    },
  },
];

export async function executeBookingTool(input: {
  businessId: string;
  contactId: string;
  customerName?: string | null;
  name: string;
  argsJson: string;
}) {
  let args: Record<string, unknown> = {};
  try {
    args = JSON.parse(input.argsJson || "{}") as Record<string, unknown>;
  } catch {
    args = {};
  }

  if (input.name === "list_doctors") {
    const doctors = await listConnectedDoctors(input.businessId);
    return {
      doctors: doctors.map((doctor) => ({
        id: doctor.id,
        name: doctor.name,
        title: doctor.title,
        specialty: doctor.specialty,
        location: doctor.location,
      })),
      count: doctors.length,
    };
  }

  if (input.name === "check_availability") {
    const slots = await findAvailableSlots({
      businessId: input.businessId,
      doctorId:
        typeof args.doctorId === "string" ? args.doctorId : undefined,
      daysAhead:
        typeof args.daysAhead === "number" ? args.daysAhead : undefined,
      durationMinutes:
        typeof args.durationMinutes === "number"
          ? args.durationMinutes
          : undefined,
    });
    return { slots, count: slots.length };
  }

  if (input.name === "book_appointment") {
    const doctorId = typeof args.doctorId === "string" ? args.doctorId : "";
    const startIso = typeof args.startIso === "string" ? args.startIso : "";
    const service =
      typeof args.service === "string" && args.service.trim()
        ? args.service.trim()
        : "Konsultasi";

    if (!doctorId || !startIso) {
      return { error: "doctorId and startIso are required" };
    }

    const booking = await createDoctorBooking({
      businessId: input.businessId,
      contactId: input.contactId,
      doctorId,
      startIso,
      service,
      durationMinutes:
        typeof args.durationMinutes === "number"
          ? args.durationMinutes
          : 60,
      notes: typeof args.notes === "string" ? args.notes : undefined,
      customerName: input.customerName ?? undefined,
    });

    return { ok: true, booking };
  }

  return { error: `Unknown tool: ${input.name}` };
}
