import {
  findAvailableSlots,
  listConnectedDoctors,
} from "@/lib/booking/availability";
import { createDoctorBooking } from "@/lib/booking/create";
import { listActiveServices } from "@/lib/services";
import { formatIdr } from "@/lib/services/format";
import { prisma } from "@/lib/prisma";

export const BOOKING_TOOL_DEFINITIONS = [
  {
    type: "function" as const,
    function: {
      name: "list_services",
      description:
        "List active clinic services from the catalog with full price (IDR), optional DP amount, and duration. Use this for harga / treatment info and before booking.",
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
          serviceId: {
            type: "string",
            description:
              "Optional service id from list_services — uses its durationMin when set.",
          },
          daysAhead: {
            type: "number",
            description: "How many days ahead to search. Default 7.",
          },
          durationMinutes: {
            type: "number",
            description:
              "Appointment length in minutes. Prefer service.durationMin from list_services when known. Default 60.",
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
        "Book an appointment into a doctor's Google Calendar and save it in CRM. Prefer serviceId from list_services so price/DP are stored correctly.",
      parameters: {
        type: "object",
        properties: {
          doctorId: { type: "string" },
          startIso: {
            type: "string",
            description: "ISO start datetime from check_availability.",
          },
          serviceId: {
            type: "string",
            description: "Preferred: id from list_services.",
          },
          service: {
            type: "string",
            description:
              "Fallback service name if serviceId unknown. Prefer serviceId.",
          },
          durationMinutes: { type: "number" },
          notes: { type: "string" },
        },
        required: ["doctorId", "startIso"],
        additionalProperties: false,
      },
    },
  },
];

async function resolveServiceForBooking(
  businessId: string,
  args: Record<string, unknown>,
) {
  const serviceId =
    typeof args.serviceId === "string" ? args.serviceId.trim() : "";
  if (serviceId) {
    const row = await prisma.service.findFirst({
      where: { id: serviceId, businessId, isActive: true },
    });
    if (row) {
      return row;
    }
  }

  const name =
    typeof args.service === "string" && args.service.trim()
      ? args.service.trim()
      : "";
  if (name) {
    const rows = await listActiveServices(businessId);
    const lower = name.toLowerCase();
    const exact = rows.find((item) => item.name.toLowerCase() === lower);
    if (exact) {
      return prisma.service.findFirst({
        where: { id: exact.id, businessId },
      });
    }
    const partial = rows.find(
      (item) =>
        item.name.toLowerCase().includes(lower) ||
        lower.includes(item.name.toLowerCase()),
    );
    if (partial) {
      return prisma.service.findFirst({
        where: { id: partial.id, businessId },
      });
    }
  }

  return null;
}

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

  if (input.name === "list_services") {
    const services = await listActiveServices(input.businessId);
    return {
      services: services.map((service) => ({
        id: service.id,
        name: service.name,
        description: service.description,
        price: service.price,
        priceLabel: formatIdr(service.price),
        dpAmount: service.dpAmount,
        dpLabel:
          service.dpAmount > 0 ? formatIdr(service.dpAmount) : null,
        hasDp: service.dpAmount > 0,
        durationMin: service.durationMin,
      })),
      count: services.length,
    };
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
    const catalogService = await resolveServiceForBooking(
      input.businessId,
      args,
    );
    const durationMinutes =
      typeof args.durationMinutes === "number"
        ? args.durationMinutes
        : (catalogService?.durationMin ?? undefined);

    const slots = await findAvailableSlots({
      businessId: input.businessId,
      doctorId:
        typeof args.doctorId === "string" ? args.doctorId : undefined,
      daysAhead:
        typeof args.daysAhead === "number" ? args.daysAhead : undefined,
      durationMinutes,
    });
    return { slots, count: slots.length };
  }

  if (input.name === "book_appointment") {
    const doctorId = typeof args.doctorId === "string" ? args.doctorId : "";
    const startIso = typeof args.startIso === "string" ? args.startIso : "";

    if (!doctorId || !startIso) {
      return { error: "doctorId and startIso are required" };
    }

    const catalogService = await resolveServiceForBooking(
      input.businessId,
      args,
    );
    const serviceName =
      catalogService?.name ||
      (typeof args.service === "string" && args.service.trim()
        ? args.service.trim()
        : "Konsultasi");
    const durationMinutes =
      typeof args.durationMinutes === "number"
        ? args.durationMinutes
        : (catalogService?.durationMin ?? 60);

    const booking = await createDoctorBooking({
      businessId: input.businessId,
      contactId: input.contactId,
      doctorId,
      startIso,
      service: serviceName,
      serviceId: catalogService?.id,
      amount: catalogService?.price,
      durationMinutes,
      notes: typeof args.notes === "string" ? args.notes : undefined,
      customerName: input.customerName ?? undefined,
    });

    return {
      ok: true,
      booking: {
        ...booking,
        price: catalogService?.price ?? null,
        priceLabel: catalogService ? formatIdr(catalogService.price) : null,
        dpAmount: catalogService?.dpAmount ?? null,
        dpLabel:
          catalogService && catalogService.dpAmount > 0
            ? formatIdr(catalogService.dpAmount)
            : null,
      },
    };
  }

  return { error: `Unknown tool: ${input.name}` };
}
