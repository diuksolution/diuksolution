import { prisma } from "@/lib/prisma";
import { executeBookingTool } from "@/lib/ai/booking-tools";
import { invalidateChatCache } from "@/lib/chat/cache";
import {
  getOrCreateAiAutomationSettings,
  renderPromptTemplate,
} from "@/lib/ai/settings";
import {
  findAvailableSlots,
  parseRequestedDay,
} from "@/lib/booking/availability";
import { createDoctorBooking } from "@/lib/booking/create";
import { listActiveServices } from "@/lib/services";
import { formatIdr } from "@/lib/services/format";
import { sendWhatsAppText, sendWhatsAppTyping } from "@/lib/whatsapp/send";

function looksLikeBookingIntent(text: string) {
  const value = text.toLowerCase();
  return /(book|booking|jadwal|janji|reservasi|appointment|mau (datang|ketemu)|konsultasi|facial|treatment|dokter)/i.test(
    value,
  );
}

function looksLikeScheduleQuestion(text: string) {
  const value = text.toLowerCase();
  return /(kapan|jam berapa|hari apa|slot|kosong|dokter|siapa|jadwal|bisanya|bisa kapan|yang benar|yg benar|beneran|serius|penuh|full booked|on duty)/i.test(
    value,
  );
}

function looksLikePaymentIntent(text: string) {
  return /(bayar|dp\b|lunas|qris|transfer|va\b)/i.test(text);
}

function looksLikeServiceIntent(text: string) {
  const value = text.toLowerCase();
  return /(harga|pricelist|price|biaya|tarif|layanan|treatment|paket|dp\b|down ?payment|pico|facial|laser)/i.test(
    value,
  );
}

function looksLikeGreeting(text: string) {
  return /^(halo|hai|hi|hello|hey|pagi|siang|sore|malam|assalamualaikum|assalam|tes|test|ping)\b/i.test(
    text.trim(),
  );
}

function looksLikeAck(text: string) {
  return /^(ok|oke|okay|sip|siap|thanks|makasih|terima kasih|noted|ya|iya|nggih|baik)[\s!.]*$/i.test(
    text.trim(),
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

async function runRuleBasedPayment(input: {
  businessId: string;
  contactId: string;
  customerName?: string | null;
  text: string;
  waId: string;
  phoneNumberId?: string | null;
  conversationId: string;
}) {
  const booking = await prisma.crmBooking.findFirst({
    where: {
      businessId: input.businessId,
      contactId: input.contactId,
      status: { not: "CANCELLED" },
    },
    orderBy: { scheduledAt: "desc" },
    select: { id: true },
  });
  if (!booking) {
    return "Belum ada booking yang bisa dibayar. Mau booking dulu, Kak?";
  }

  const kind = /\bdp\b/i.test(input.text) ? "DP" : "FULL";
  const result = await executeBookingTool({
    businessId: input.businessId,
    contactId: input.contactId,
    customerName: input.customerName,
    waId: input.waId,
    phoneNumberId: input.phoneNumberId,
    conversationId: input.conversationId,
    name: "create_payment",
    argsJson: JSON.stringify({
      bookingId: booking.id,
      kind,
      channel: "QRIS",
    }),
  });

  if (
    result &&
    typeof result === "object" &&
    "sentToWhatsApp" in result &&
    (result as { sentToWhatsApp?: boolean }).sentToWhatsApp
  ) {
    return "__SENT__";
  }

  if (
    result &&
    typeof result === "object" &&
    "error" in result &&
    typeof (result as { error?: string }).error === "string"
  ) {
    return (result as { error: string }).error;
  }

  return "Siap, pembayaran sedang diproses ya Kak.";
}

async function runRuleBasedBooking(input: {
  businessId: string;
  contactId: string;
  customerName?: string | null;
  text: string;
}) {
  if (
    (looksLikeGreeting(input.text) || looksLikeAck(input.text)) &&
    !looksLikeBookingIntent(input.text) &&
    !looksLikeScheduleQuestion(input.text) &&
    !looksLikeServiceIntent(input.text)
  ) {
    return "Halo Kak 👋 Bisa bantu cek jadwal dokter, info layanan/harga, atau booking treatment. Mau yang mana?";
  }

  const services = await listActiveServices(input.businessId);
  const matchedService = matchServiceFromText(input.text, services);

  if (looksLikeServiceIntent(input.text) && !looksLikeBookingIntent(input.text)) {
    if (services.length === 0) {
      return "Katalog layanan belum diisi admin. Tim kami akan bantu info harga manual ya.";
    }
    return `Ini layanan aktif di klinik kami:\n\n${formatServiceList(services)}\n\nMau booking yang mana, Kak?`;
  }

  const roster = await prisma.practitioner.findMany({
    where: { businessId: input.businessId, isActive: true },
    orderBy: { name: "asc" },
    select: {
      name: true,
      title: true,
      specialty: true,
    },
  });

  const doctorLines =
    roster.length > 0
      ? roster
          .map((doctor) => {
            const meta = [doctor.title, doctor.specialty].filter(Boolean).join(" · ");
            return meta ? `• ${doctor.name} (${meta})` : `• ${doctor.name}`;
          })
          .join("\n")
      : "Belum ada dokter aktif di roster.";

  if (
    /(dokter|siapa)/i.test(input.text) &&
    !looksLikeBookingIntent(input.text) &&
    !looksLikeServiceIntent(input.text)
  ) {
    return `Dokter aktif di klinik:\n${doctorLines}\n\nMau booking ke siapa, Kak?`;
  }

  if (roster.length === 0) {
    return "Belum ada dokter aktif di Doctor List. Tim kami akan bantu manual ya.";
  }

  if (
    !looksLikeBookingIntent(input.text) &&
    !looksLikeScheduleQuestion(input.text)
  ) {
    return null;
  }

  const chooseMatch = input.text.match(/\b([1-5])\b/);
  const durationMinutes = matchedService?.durationMin ?? 60;
  const requested = parseRequestedDay(input.text);
  const slots = await findAvailableSlots({
    businessId: input.businessId,
    serviceId: matchedService?.id,
    serviceName: matchedService?.name,
    daysAhead: requested?.daysAhead ?? 7,
    fromDate: requested?.fromDate,
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
    return `Dokter aktif:\n${doctorLines}\n\nBelum ada slot di jam kerja Schedule (atau sudah terisi appointment). Mau coba tanggal lain?`;
  }

  const serviceHint = matchedService
    ? ` untuk ${matchedService.name}`
    : /besok/i.test(input.text)
      ? " besok"
      : "";

  return `Bisa Kak. Slot kosong${serviceHint}:\n\n${formatSlotList(slots)}\n\nBalas angka (1-${Math.min(5, slots.length)}) untuk booking, atau sebutkan jam yang diinginkan.`;
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
  await invalidateChatCache(input.businessId, input.conversationId);
}

async function conversationAllowsAi(businessId: string, conversationId: string) {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, businessId },
    select: { aiEnabled: true },
  });
  return Boolean(conversation?.aiEnabled);
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
  inboundMessageId?: string | null;
}) {
  const [settings, aiEnabled] = await Promise.all([
    getOrCreateAiAutomationSettings(input.businessId),
    conversationAllowsAi(input.businessId, input.conversationId),
  ]);
  if (!settings.enabled || !aiEnabled) {
    return;
  }

  if (input.inboundMessageId) {
    void sendWhatsAppTyping({
      messageId: input.inboundMessageId,
      phoneNumberId: input.phoneNumberId ?? undefined,
      businessId: input.businessId,
    });
  }

  const [business, inboundCount] = await Promise.all([
    prisma.business.findUnique({
      where: { id: input.businessId },
      select: { name: true },
    }),
    prisma.message.count({
      where: {
        conversationId: input.conversationId,
        direction: "INBOUND",
      },
    }),
  ]);
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
      if (
        !(await conversationAllowsAi(input.businessId, input.conversationId))
      ) {
        return;
      }
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

  const startedAt = Date.now();
  let reply: string | null = null;
  let path = "none";

  if (looksLikePaymentIntent(inboundText)) {
    const paymentReply = await runRuleBasedPayment({
      businessId: input.businessId,
      contactId: input.contactId,
      customerName: input.customerName,
      text: inboundText,
      waId: input.waId,
      phoneNumberId: input.phoneNumberId,
      conversationId: input.conversationId,
    });
    if (paymentReply === "__SENT__") {
      console.info("[ai booking] replied", {
        path: "payment",
        ms: Date.now() - startedAt,
        conversationId: input.conversationId,
      });
      return;
    }
    reply = paymentReply;
    path = "payment";
  }

  if (!reply) {
    reply = await runRuleBasedBooking({
      businessId: input.businessId,
      contactId: input.contactId,
      customerName: input.customerName,
      text: inboundText,
    });
    path = reply ? "rules" : "rules-empty";
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
    const [roster, services] = await Promise.all([
      prisma.practitioner.findMany({
        where: { businessId: input.businessId, isActive: true },
        orderBy: { name: "asc" },
        select: { name: true },
      }),
      listActiveServices(input.businessId),
    ]);
    const doctorNames =
      roster.map((item) => item.name).join(", ") || "belum diisi";
    const serviceNames =
      services.map((item) => item.name).join(", ") || "belum diisi";
    reply = `Siap Kak. Dokter aktif: ${doctorNames}.\nLayanan: ${serviceNames}.\nMau booking yang mana, atau mau dicek slotnya?`;
    path = "fallback";
  }

  if (!(await conversationAllowsAi(input.businessId, input.conversationId))) {
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
  console.info("[ai booking] replied", {
    path,
    ms: Date.now() - startedAt,
    conversationId: input.conversationId,
  });
}
