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
import { sendWhatsAppText } from "@/lib/whatsapp/send";

function looksLikeBookingIntent(text: string) {
  const value = text.toLowerCase();
  return /(book|booking|jadwal|janji|reservasi|appointment|mau (datang|ketemu)|konsultasi|facial|treatment|dokter)/i.test(
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

async function runRuleBasedBooking(input: {
  businessId: string;
  contactId: string;
  customerName?: string | null;
  text: string;
}) {
  const doctors = await listConnectedDoctors(input.businessId);
  if (doctors.length === 0) {
    return "Saat ini belum ada dokter dengan Google Calendar yang terhubung. Tim kami akan bantu manual ya.";
  }

  if (!looksLikeBookingIntent(input.text)) {
    return null;
  }

  const chooseMatch = input.text.match(/\b([1-5])\b/);
  const slots = await findAvailableSlots({
    businessId: input.businessId,
    daysAhead: 7,
  });

  if (chooseMatch && slots.length > 0) {
    const index = Number(chooseMatch[1]) - 1;
    const selected = slots[index];
    if (selected) {
      const booking = await createDoctorBooking({
        businessId: input.businessId,
        contactId: input.contactId,
        doctorId: selected.doctorId,
        startIso: selected.start,
        service: "Konsultasi",
        customerName: input.customerName ?? undefined,
      });
      return `Baik, booking sudah dikonfirmasi ✅\n\nDokter: ${booking.doctorName}\nLayanan: ${booking.service}\nWaktu: ${selected.label}\n\nSampai jumpa di klinik ya.`;
    }
  }

  if (slots.length === 0) {
    return `Dokter tersedia: ${doctors.map((d) => d.name).join(", ")}.\nSaat ini belum ada slot kosong 7 hari ke depan. Mau coba tanggal lain?`;
  }

  return `Bisa Kak. Ini slot terdekat dari dokter yang calendar-nya sudah terhubung:\n\n${formatSlotList(slots)}\n\nBalas angka (1-${Math.min(5, slots.length)}) untuk booking, atau sebutkan preferensi hari/jam.`;
}

async function runLlmBooking(input: {
  businessId: string;
  contactId: string;
  customerName?: string | null;
  businessName: string;
  systemPrompt: string;
  recentMessages: Array<{ direction: "INBOUND" | "OUTBOUND"; text: string }>;
  latestText: string;
}) {
  const history: LlmChatMessage[] = [
    {
      role: "system",
      content: renderPromptTemplate(input.systemPrompt, {
        business: input.businessName,
        name: input.customerName?.trim() || "Kak",
      }),
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

  for (let step = 0; step < 4; step += 1) {
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
      return message.content?.trim() || null;
    }

    for (const call of toolCalls) {
      const result = await executeBookingTool({
        businessId: input.businessId,
        contactId: input.contactId,
        customerName: input.customerName,
        name: call.function.name,
        argsJson: call.function.arguments,
      });

      history.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }
  }

  return "Sebentar ya, sistem booking masih memproses. Coba sebutkan hari yang diinginkan.";
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

  const inboundCount = await prisma.message.count({
    where: {
      conversationId: input.conversationId,
      direction: "INBOUND",
    },
  });
  const isFirstMessage = inboundCount <= 1;

  if (settings.welcomeEnabled && isFirstMessage && !looksLikeBookingIntent(input.text)) {
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
      latestText: input.text,
    });
  } catch (error) {
    console.error("[ai booking] llm failed", error);
  }

  if (!reply) {
    reply = await runRuleBasedBooking({
      businessId: input.businessId,
      contactId: input.contactId,
      customerName: input.customerName,
      text: input.text,
    });
  }

  if (
    !reply &&
    settings.welcomeEnabled &&
    isFirstMessage &&
    looksLikeBookingIntent(input.text)
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
    looksLikeBookingIntent(input.text)
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
