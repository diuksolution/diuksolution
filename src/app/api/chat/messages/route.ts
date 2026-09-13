import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { sendWhatsAppText } from "@/lib/whatsapp/send";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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

  const number = await prisma.whatsAppNumber.findFirst({
    where: { businessId: user.businessId },
  });

  try {
    const waMessageId = await sendWhatsAppText({
      to: conversation.contact.waId,
      text,
      phoneNumberId: number?.phoneNumberId,
      businessId: user.businessId,
    });

    const sentAt = new Date();
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        waMessageId,
        direction: "OUTBOUND",
        type: "text",
        text,
        status: "SENT",
        sentAt,
      },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: sentAt,
        lastPreview: text.slice(0, 180),
      },
    });

    return NextResponse.json({
      id: message.id,
      kind: "business",
      time: new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Jakarta",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(sentAt),
      text,
      deliveryStatus: "SENT",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
