import { NextResponse } from "next/server";
import { invalidateChatCache } from "@/lib/chat/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { sendWhatsAppText } from "@/lib/whatsapp/send";
import {
  describeWhatsAppSendError,
  isWithinCustomerServiceWindow,
  normalizeWaId,
  OUTSIDE_SESSION_WINDOW_MESSAGE,
} from "@/lib/whatsapp/session-window";

function formatJakartaTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const businessId = user.businessId;
  const body = (await request.json()) as {
    conversationId?: string;
    text?: string;
  };

  const conversationId = body.conversationId?.trim() ?? "";
  const text = body.text?.trim() ?? "";

  if (!conversationId || !text) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, businessId: user.businessId },
    include: { contact: true },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  const openConversation = conversation;

  const [number, lastInbound] = await Promise.all([
    prisma.whatsAppNumber.findFirst({
      where: { businessId: user.businessId },
    }),
    prisma.message.findFirst({
      where: { conversationId: openConversation.id, direction: "INBOUND" },
      orderBy: { sentAt: "desc" },
      select: { sentAt: true },
    }),
  ]);

  const sentAt = new Date();

  async function persist(status: "SENT" | "FAILED", waMessageId?: string) {
    const message = await prisma.message.create({
      data: {
        conversationId: openConversation.id,
        waMessageId,
        direction: "OUTBOUND",
        type: "text",
        text,
        status,
        sentAt,
      },
    });

    await prisma.conversation.update({
      where: { id: openConversation.id },
      data: {
        lastMessageAt: sentAt,
        lastPreview: text.slice(0, 180),
        aiEnabled: false,
      },
    });
    await invalidateChatCache(businessId, openConversation.id);

    return message;
  }

  function payloadOf(
    message: { id: string },
    deliveryStatus: "SENT" | "FAILED",
    error?: string,
  ) {
    return {
      id: message.id,
      kind: "business" as const,
      time: formatJakartaTime(sentAt),
      text,
      deliveryStatus,
      aiEnabled: false,
      ...(error ? { error } : {}),
    };
  }

  // Inbox composer is session text only. Reminder/broadcast use sendWhatsAppTemplate.
  if (!isWithinCustomerServiceWindow(lastInbound?.sentAt)) {
    const message = await persist("FAILED");
    return NextResponse.json(
      payloadOf(message, "FAILED", OUTSIDE_SESSION_WINDOW_MESSAGE),
      { status: 409 },
    );
  }

  try {
    const waMessageId = await sendWhatsAppText({
      to: normalizeWaId(openConversation.contact.waId),
      text,
      phoneNumberId: number?.phoneNumberId,
      businessId: user.businessId,
    });

    const message = await persist("SENT", waMessageId);
    return NextResponse.json(payloadOf(message, "SENT"));
  } catch (error) {
    const message = await persist("FAILED");
    return NextResponse.json(
      payloadOf(message, "FAILED", describeWhatsAppSendError(error)),
      { status: 502 },
    );
  }
}
