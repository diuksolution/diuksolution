import { prisma } from "@/lib/prisma";
import {
  BOOKING_TOOL_DEFINITIONS,
  executeBookingTool,
} from "@/lib/ai/booking-tools";
import { createChatCompletion, type LlmChatMessage } from "@/lib/ai/llm";
import {
  getOrCreateAiAutomationSettings,
  renderPromptTemplate,
} from "@/lib/ai/settings";
import {
  findAvailableSlots,
  listConnectedDoctors,
} from "@/lib/booking/availability";
import { createDoctorBooking } from "@/lib/booking/create";
import { listActiveServices } from "@/lib/services";
import { formatIdr } from "@/lib/services/format";
import { sendWhatsAppText } from "@/lib/whatsapp/send";

const TOOLS_HINT = `

Tools wajib:
- list_services untuk harga / daftar treatment (jangan mengarang harga).
- list_doctors, check_availability, book_appointment untuk jadwal.
- Saat booking utamakan serviceId dari list_services.
- Setelah book berhasil & ada harga: offer_payment_options.
- Jika pasien pilih Bayar DP / Bayar Lunas (atau bilang mau QRIS / link bayar): create_payment.
  - kind: DP atau FULL
  - channel: QRIS (kirim gambar QR) atau SNAP (link QRIS+VA+e-wallet)
- Jika tool create_payment / offer_payment_options sudah sentToWhatsApp/sent=true, balas singkat saja (jangan ulang link/QR).`;

function looksLikeBookingIntent(text: string) {
  const value = text.toLowerCase();
  return /(book|booking|jadwal|janji|reservasi|appointment|mau (datang|ketemu)|konsultasi|facial|treatment|dokter)/i.test(
    value,
  );
}

function looksLikeServiceIntent(text: string) {
  const value = text.toLowerCase();
  return /(harga|pricelist|price|biaya|tarif|layanan|treatment|paket|dp\b|down ?payment|pico|facial|laser)/i.test(
    value,
  );
}

function formatSlotList(
  slots: Array<{ label: string; doctorId: string; start: string }>,
) {
  return slots
    .slice(0, 5)
    .map((slot, index) => `${index + 1}. ${slot.label}`)
    .join("\n");
}

function formatServiceList(
  services: Array<{
    name: string;
    price: number;
    dpAmount: number;
    durationMin: number | null;
  }>,
) {
  return services
    .map((service, index) => {
      const dp =
        service.dpAmount > 0 ? ` · DP ${formatIdr(service.dpAmount)}` : "";
      const duration = service.durationMin
        ? ` · ${service.durationMin} mnt`
        : "";
      return `${index + 1}. ${service.name} — ${formatIdr(service.price)}${dp}${duration}`;
    })
    .join("\n");
}

function matchServiceFromText(
  text: string,
  services: Array<{
    id: string;
    name: string;
    price: number;
    dpAmount: number;
    durationMin: number | null;
  }>,
) {
  const lower = text.toLowerCase();
  return (
    services.find((item) => lower.includes(item.name.toLowerCase())) ?? null
  );
}

async function runRuleBasedBooking(input: {
  businessId: string;
  contactId: string;
  customerName?: string | null;
  text: string;
}) {
  const services = await listActiveServices(input.businessId);
  const matchedService = matchServiceFromText(input.text, services);

  if (looksLikeServiceIntent(input.text) && !looksLikeBookingIntent(input.text)) {
    if (services.length === 0) {
      return "Katalog layanan belum diisi admin. Tim kami akan bantu info harga manual ya.";
    }
    return `Ini layanan aktif di klinik kami:\n\n${formatServiceList(services)}\n\nMau booking yang mana, Kak?`;
  }

  const doctors = await listConnectedDoctors(input.businessId);
  if (doctors.length === 0) {
    return "Saat ini belum ada dokter dengan Google Calendar yang terhubung. Tim kami akan bantu manual ya.";
  }

  if (!looksLikeBookingIntent(input.text)) {
    return null;
  }

  const chooseMatch = input.text.match(/\b([1-5])\b/);
  const durationMinutes = matchedService?.durationMin ?? 60;
  const slots = await findAvailableSlots({
    businessId: input.businessId,
    daysAhead: 7,
    durationMinutes,
  });

  if (chooseMatch && slots.length > 0) {
    const index = Number(chooseMatch[1]) - 1;
    const selected = slots[index];
    if (selected) {
      const serviceName = matchedService?.name || services[0]?.name || "Konsultasi";
      const booking = await createDoctorBooking({
        businessId: input.businessId,
        contactId: input.contactId,
        doctorId: selected.doctorId,
        startIso: selected.start,
        service: serviceName,
        serviceId: matchedService?.id ?? services[0]?.id,
        amount: matchedService?.price ?? services[0]?.price,
        durationMinutes,
        customerName: input.customerName ?? undefined,
      });
      const priceLine =
        booking.amount > 0
          ? `\nHarga: ${formatIdr(booking.amount)}${
              matchedService && matchedService.dpAmount > 0
                ? ` (DP ${formatIdr(matchedService.dpAmount)})`
                : ""
            }`
          : "";
      return `Baik, booking sudah dikonfirmasi ✅\n\nDokter: ${booking.doctorName}\nLayanan: ${booking.service}\nWaktu: ${selected.label}${priceLine}\n\nSampai jumpa di klinik ya.`;
    }
  }

  if (slots.length === 0) {
    return `Dokter tersedia: ${doctors.map((d) => d.name).join(", ")}.\nSaat ini belum ada slot kosong 7 hari ke depan. Mau coba tanggal lain?`;
  }

  const serviceHint = matchedService
    ? ` untuk ${matchedService.name}`
    : services.length > 0
      ? ""
      : "";

  return `Bisa Kak. Ini slot terdekat${serviceHint} dari dokter yang calendar-nya sudah terhubung:\n\n${formatSlotList(slots)}\n\nBalas angka (1-${Math.min(5, slots.length)}) untuk booking, atau sebutkan preferensi hari/jam.`;
}

async function runLlmBooking(input: {
  businessId: string;
  contactId: string;
  customerName?: string | null;
  businessName: string;
  systemPrompt: string;
  recentMessages: Array<{ direction: "INBOUND" | "OUTBOUND"; text: string }>;
  latestText: string;
  waId: string;
  phoneNumberId?: string | null;
  conversationId: string;
}) {
  const history: LlmChatMessage[] = [
    {
      role: "system",
      content:
        renderPromptTemplate(input.systemPrompt, {
          business: input.businessName,
          name: input.customerName?.trim() || "Kak",
        }) + TOOLS_HINT,
    },
    ...input.recentMessages.map((message) => ({
      role: (message.direction === "INBOUND" ? "user" : "assistant") as
        | "user"
        | "assistant",
      content: message.text,
    })),
  ];

  if (
    history[history.length - 1]?.role !== "user" ||
    history[history.length - 1]?.content !== input.latestText
  ) {
    history.push({ role: "user", content: input.latestText });
  }

  let lastToolSentPayment = false;

  for (let step = 0; step < 6; step += 1) {
    const completion = await createChatCompletion({
      messages: history,
      tools: BOOKING_TOOL_DEFINITIONS,
      temperature: 0.3,
    });

    if (!completion?.message) {
      return null;
    }

    const message = completion.message;
    history.push(message);

    const toolCalls = message.tool_calls ?? [];
    if (toolCalls.length === 0) {
      if (lastToolSentPayment) {
        return message.content?.trim() || null;
      }
      return message.content?.trim() || null;
    }

    for (const call of toolCalls) {
      const result = await executeBookingTool({
        businessId: input.businessId,
        contactId: input.contactId,
        customerName: input.customerName,
        waId: input.waId,
        phoneNumberId: input.phoneNumberId,
        conversationId: input.conversationId,
        name: call.function.name,
        argsJson: call.function.arguments,
      });

      if (
        result &&
        typeof result === "object" &&
        ("sentToWhatsApp" in result || "sent" in result) &&
        ((result as { sentToWhatsApp?: boolean }).sentToWhatsApp ||
          (result as { sent?: boolean }).sent)
      ) {
        lastToolSentPayment = true;
      }

      history.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }
  }

  return lastToolSentPayment
    ? null
    : "Sebentar ya, sistem booking masih memproses. Coba sebutkan hari yang diinginkan.";
}

async function persistOutboundReply(input: {
  conversationId: string;
  businessId: string;
  waId: string;
  text: string;
  phoneNumberId?: string | null;
}) {
  const waMessageId = await sendWhatsAppText({
    to: input.waId,
    text: input.text,
    phoneNumberId: input.phoneNumberId ?? undefined,
    businessId: input.businessId,
  });

  const sentAt = new Date();
  await prisma.message.create({
    data: {
      conversationId: input.conversationId,
      waMessageId,
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
}

export async function handleInboundBookingAi(input: {
  businessId: string;
  conversationId: string;
  contactId: string;
  customerName?: string | null;
  waId: string;
  text: string;
  buttonId?: string | null;
  phoneNumberId?: string | null;
}) {
  const settings = await getOrCreateAiAutomationSettings(input.businessId);
  if (!settings.enabled) {
    return;
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: input.conversationId,
      businessId: input.businessId,
    },
    select: { aiEnabled: true },
  });

  if (!conversation?.aiEnabled) {
    return;
  }

  const business = await prisma.business.findUnique({
    where: { id: input.businessId },
    select: { name: true },
  });
  const businessName = business?.name || "klinik kami";
  const displayName = input.customerName?.trim() || "Kak";

  const inboundText = (() => {
    if (input.buttonId === "pay_dp") {
      return "Saya mau bayar DP. Kirim QRIS.";
    }
    if (input.buttonId === "pay_full") {
      return "Saya mau bayar lunas. Kirim QRIS.";
    }
    return input.text;
  })();

  const inboundCount = await prisma.message.count({
    where: {
      conversationId: input.conversationId,
      direction: "INBOUND",
    },
  });
  const isFirstMessage = inboundCount <= 1;

  if (
    settings.welcomeEnabled &&
    isFirstMessage &&
    !looksLikeBookingIntent(inboundText)
  ) {
    const welcome = renderPromptTemplate(settings.welcomePrompt, {
      name: displayName,
      business: businessName,
    }).trim();

    if (welcome) {
      await persistOutboundReply({
        conversationId: input.conversationId,
        businessId: input.businessId,
        waId: input.waId,
        text: welcome,
        phoneNumberId: input.phoneNumberId,
      });
      return;
    }
  }

  const recent = await prisma.message.findMany({
    where: {
      conversationId: input.conversationId,
      text: { not: null },
    },
    orderBy: { sentAt: "desc" },
    take: 8,
    select: {
      direction: true,
      text: true,
    },
  });

  const recentMessages = recent
    .slice()
    .reverse()
    .map((item) => ({
      direction: item.direction,
      text: item.text || "",
    }))
    .filter((item) => item.text.trim().length > 0);

  let reply: string | null = null;

  try {
    reply = await runLlmBooking({
      businessId: input.businessId,
      contactId: input.contactId,
      customerName: input.customerName,
      businessName,
      systemPrompt: settings.bookingSystemPrompt,
      recentMessages,
      latestText: inboundText,
      waId: input.waId,
      phoneNumberId: input.phoneNumberId,
      conversationId: input.conversationId,
    });
  } catch (error) {
    console.error("[ai booking] llm failed", error);
  }

  if (!reply) {
    reply = await runRuleBasedBooking({
      businessId: input.businessId,
      contactId: input.contactId,
      customerName: input.customerName,
      text: inboundText,
    });
  }

  if (
    !reply &&
    settings.welcomeEnabled &&
    isFirstMessage &&
    looksLikeBookingIntent(inboundText)
  ) {
    // First message is booking intent but LLM/rule failed — still greet.
    reply = renderPromptTemplate(settings.welcomePrompt, {
      name: displayName,
      business: businessName,
    }).trim();
  }

  if (!reply) {
    return;
  }

  // If first message + booking intent + welcome enabled, prepend welcome once.
  if (
    settings.welcomeEnabled &&
    isFirstMessage &&
    looksLikeBookingIntent(inboundText)
  ) {
    const welcome = renderPromptTemplate(settings.welcomePrompt, {
      name: displayName,
      business: businessName,
    }).trim();
    if (welcome && !reply.startsWith(welcome.slice(0, 20))) {
      reply = `${welcome}\n\n${reply}`;
    }
  }

  await persistOutboundReply({
    conversationId: input.conversationId,
    businessId: input.businessId,
    waId: input.waId,
    text: reply,
    phoneNumberId: input.phoneNumberId,
  });
}
