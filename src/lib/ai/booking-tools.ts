import type { PaymentChannel, PaymentKind } from "@prisma/client";
import {
  findAvailableSlots,
  listActiveDoctors,
  parseRequestedDay,
} from "@/lib/booking/availability";
import { createDoctorBooking } from "@/lib/booking/create";
import { createBookingPayment } from "@/lib/payments/create";
import { listActiveServices } from "@/lib/services";
import { formatIdr } from "@/lib/services/format";
import { invalidateChatCache } from "@/lib/chat/cache";
import { prisma } from "@/lib/prisma";
import {
  sendWhatsAppImage,
  sendWhatsAppReplyButtons,
  sendWhatsAppText,
} from "@/lib/whatsapp/send";

export const BOOKING_TOOL_DEFINITIONS = [
  {
    type: "function" as const,
    function: {
      name: "list_services",
      description:
        "List active clinic services with price, DP, duration, and which doctors may perform each service. Use before quoting harga or checking slots.",
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
        "List bookable doctors (calendar connected) and the services each doctor is allowed to perform.",
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
        "Check open slots using the doctor's Schedule hours (off days / custom hours) and only doctors assigned to the service. Always pass serviceId when the treatment is known.",
      parameters: {
        type: "object",
        properties: {
          doctorId: {
            type: "string",
            description: "Optional doctor id. Must offer the selected service.",
          },
          serviceId: {
            type: "string",
            description:
              "Service id from list_services. Required to filter doctors and use the correct duration.",
          },
          daysAhead: {
            type: "number",
            description: "How many days ahead to search. Default 7.",
          },
          dateHint: {
            type: "string",
            description:
              "Patient wording for the day, e.g. 'besok', 'hari ini', 'lusa'. Slots come from clinic Schedule, not Google Calendar.",
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
        "Book an appointment. doctorId must be assigned to serviceId. startIso must come from check_availability. After success, offer payment via offer_payment_options.",
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
        required: ["doctorId", "startIso", "serviceId"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "offer_payment_options",
      description:
        "Send WhatsApp buttons asking the patient to pay DP and/or full amount for a booking. Call after successful book_appointment when price > 0.",
      parameters: {
        type: "object",
        properties: {
          bookingId: {
            type: "string",
            description: "bookingId from book_appointment result.",
          },
        },
        required: ["bookingId"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_payment",
      description:
        "Create a Midtrans payment for a booking and send the QRIS image or Snap payment link to WhatsApp. Use after patient chooses DP or lunas (and optionally QRIS vs link).",
      parameters: {
        type: "object",
        properties: {
          bookingId: { type: "string" },
          kind: {
            type: "string",
            enum: ["DP", "FULL"],
            description: "DP = down payment, FULL = pay full price.",
          },
          channel: {
            type: "string",
            enum: ["QRIS", "SNAP"],
            description:
              "QRIS = send QR image directly. SNAP = payment link (QRIS + VA bank + e-wallet).",
          },
        },
        required: ["bookingId", "kind", "channel"],
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

async function persistOutbound(input: {
  conversationId?: string | null;
  businessId?: string | null;
  waMessageId: string;
  text: string;
}) {
  if (!input.conversationId) {
    return;
  }
  const sentAt = new Date();
  await prisma.message.create({
    data: {
      conversationId: input.conversationId,
      waMessageId: input.waMessageId,
      direction: "OUTBOUND",
      type: "text",
      text: input.text,
      status: "SENT",
      sentAt,
    },
  });
  await prisma.conversation.update({
    where: { id: input.conversationId },
    data: {
      lastMessageAt: sentAt,
      lastPreview: input.text.slice(0, 180),
    },
  });
  if (input.businessId) {
    await invalidateChatCache(input.businessId, input.conversationId);
  }
}

export async function executeBookingTool(input: {
  businessId: string;
  contactId: string;
  customerName?: string | null;
  waId?: string | null;
  phoneNumberId?: string | null;
  conversationId?: string | null;
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
        doctors: service.practitioners,
      })),
      count: services.length,
    };
  }

  if (input.name === "list_doctors") {
    const [doctors, catalog] = await Promise.all([
      listActiveDoctors(input.businessId),
      listActiveServices(input.businessId),
    ]);
    const servicesByDoctor = new Map<string, Array<{ id: string; name: string }>>();
    for (const service of catalog) {
      for (const doctor of service.practitioners) {
        const list = servicesByDoctor.get(doctor.id) ?? [];
        list.push({ id: service.id, name: service.name });
        servicesByDoctor.set(doctor.id, list);
      }
    }
    return {
      doctors: doctors.map((doctor) => ({
        id: doctor.id,
        name: doctor.name,
        title: doctor.title,
        specialty: doctor.specialty,
        location: doctor.location,
        services: servicesByDoctor.get(doctor.id) ?? [],
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

    const requested = parseRequestedDay(
      typeof args.dateHint === "string" ? args.dateHint : "",
    );
    const slots = await findAvailableSlots({
      businessId: input.businessId,
      doctorId:
        typeof args.doctorId === "string" ? args.doctorId : undefined,
      serviceId: catalogService?.id,
      serviceName: catalogService?.name,
      daysAhead:
        typeof args.daysAhead === "number"
          ? args.daysAhead
          : requested?.daysAhead,
      fromDate: requested?.fromDate,
      durationMinutes,
    });
    return {
      slots,
      count: slots.length,
      source: "clinic-schedule",
      serviceId: catalogService?.id ?? null,
      serviceName: catalogService?.name ?? null,
      durationMin: durationMinutes ?? catalogService?.durationMin ?? 60,
      hint:
        slots.length === 0
          ? "Tidak ada slot di jam kerja Schedule / appointment sudah terisi. Jangan mengarang 'penuh' dari Google Calendar."
          : "Ini slot klinik yang benar. Tawarkan ke pasien, jangan bilang penuh kalau count > 0.",
    };
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

    let booking;
    try {
      booking = await createDoctorBooking({
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
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Booking failed",
      };
    }

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
        nextStep:
          (catalogService?.price ?? booking.amount ?? 0) > 0
            ? "Call offer_payment_options with this bookingId so patient can pay DP or full."
            : null,
      },
    };
  }

  if (input.name === "offer_payment_options") {
    const bookingId =
      typeof args.bookingId === "string" ? args.bookingId.trim() : "";
    if (!bookingId) {
      return { error: "bookingId is required" };
    }
    if (!input.waId) {
      return { error: "WhatsApp recipient missing" };
    }

    const booking = await prisma.crmBooking.findFirst({
      where: {
        id: bookingId,
        businessId: input.businessId,
        contactId: input.contactId,
      },
    });
    if (!booking) {
      return { error: "Booking not found" };
    }
    if (booking.amount <= 0) {
      return { error: "Booking has no price; cannot offer payment." };
    }

    const service = booking.serviceId
      ? await prisma.service.findFirst({
          where: {
            id: booking.serviceId,
            businessId: input.businessId,
            isActive: true,
          },
        })
      : await prisma.service.findFirst({
          where: {
            businessId: input.businessId,
            name: booking.service,
            isActive: true,
          },
        });

    const buttons: Array<{ id: string; title: string }> = [];
    if (service && service.dpAmount > 0) {
      buttons.push({ id: "pay_dp", title: "Bayar DP" });
    }
    buttons.push({ id: "pay_full", title: "Bayar Lunas" });

    const bodyText = [
      `Booking ${booking.service} sudah tercatat.`,
      `Total: ${formatIdr(booking.amount)}`,
      service && service.dpAmount > 0
        ? `DP: ${formatIdr(service.dpAmount)}`
        : null,
      "",
      "Mau bayar sekarang?",
    ]
      .filter(Boolean)
      .join("\n");

    const waMessageId = await sendWhatsAppReplyButtons({
      to: input.waId,
      bodyText,
      buttons,
      phoneNumberId: input.phoneNumberId ?? undefined,
      businessId: input.businessId,
    });

    await persistOutbound({
      conversationId: input.conversationId,
      businessId: input.businessId,
      waMessageId,
      text: bodyText,
    });

    return {
      ok: true,
      sent: true,
      bookingId: booking.id,
      buttons: buttons.map((button) => button.id),
      hint: "When patient replies Bayar DP / Bayar Lunas, call create_payment.",
    };
  }

  if (input.name === "create_payment") {
    const bookingId =
      typeof args.bookingId === "string" ? args.bookingId.trim() : "";
    const kindRaw =
      typeof args.kind === "string" ? args.kind.toUpperCase() : "";
    const channelRaw =
      typeof args.channel === "string" ? args.channel.toUpperCase() : "";

    if (!bookingId || (kindRaw !== "DP" && kindRaw !== "FULL")) {
      return { error: "bookingId and kind (DP|FULL) are required" };
    }
    if (channelRaw !== "QRIS" && channelRaw !== "SNAP") {
      return { error: "channel must be QRIS or SNAP" };
    }
    if (!input.waId) {
      return { error: "WhatsApp recipient missing" };
    }

    try {
      const result = await createBookingPayment({
        businessId: input.businessId,
        bookingId,
        kind: kindRaw as PaymentKind,
        channel: channelRaw as PaymentChannel,
      });

      if (result.payment.channel === "QRIS" && result.payment.qrisUrl) {
        const waMessageId = await sendWhatsAppImage({
          to: input.waId,
          imageUrl: result.payment.qrisUrl,
          caption: result.customerMessage,
          phoneNumberId: input.phoneNumberId ?? undefined,
          businessId: input.businessId,
        });
        await persistOutbound({
          conversationId: input.conversationId,
          businessId: input.businessId,
          waMessageId,
          text: result.customerMessage,
        });
      } else {
        const waMessageId = await sendWhatsAppText({
          to: input.waId,
          text: result.customerMessage,
          phoneNumberId: input.phoneNumberId ?? undefined,
          businessId: input.businessId,
        });
        await persistOutbound({
          conversationId: input.conversationId,
          businessId: input.businessId,
          waMessageId,
          text: result.customerMessage,
        });
      }

      return {
        ok: true,
        paymentId: result.payment.id,
        orderId: result.payment.orderId,
        amount: result.payment.amount,
        amountLabel: result.amountLabel,
        kind: result.payment.kind,
        channel: result.payment.channel,
        redirectUrl: result.payment.redirectUrl,
        qrisUrl: result.payment.qrisUrl,
        sentToWhatsApp: true,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Payment failed",
      };
    }
  }

  return { error: `Unknown tool: ${input.name}` };
}
