import type { MessageDeliveryStatus } from "@prisma/client";
import { handleInboundBookingAi } from "@/lib/ai/booking-orchestrator";
import type { ParsedWhatsAppWebhook } from "@/lib/whatsapp/parse-webhook";
import { prisma } from "@/lib/prisma";
import { getWhatsAppPhoneNumberId } from "@/lib/whatsapp/signature";

function previewText(type: string, text?: string) {
  if (text?.trim()) {
    return text.trim().slice(0, 180);
  }

  if (type === "image") {
    return "[Image]";
  }
  if (type === "audio") {
    return "[Audio]";
  }
  if (type === "video") {
    return "[Video]";
  }
  if (type === "document") {
    return "[Document]";
  }

  return `[${type}]`;
}

function parseUnixDate(value: string) {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return new Date();
  }
  return new Date(seconds * 1000);
}

function mapDeliveryStatus(status: string): MessageDeliveryStatus | null {
  if (status === "sent") {
    return "SENT";
  }
  if (status === "delivered") {
    return "DELIVERED";
  }
  if (status === "read") {
    return "READ";
  }
  if (status === "failed") {
    return "FAILED";
  }
  return null;
}

async function resolveWhatsAppNumber(input: {
  phoneNumberId?: string;
  displayPhoneNumber?: string;
  wabaId?: string;
}) {
  const phoneNumberId = input.phoneNumberId || getWhatsAppPhoneNumberId();
  if (!phoneNumberId) {
    return null;
  }

  const existing = await prisma.whatsAppNumber.findUnique({
    where: { phoneNumberId },
  });

  if (existing) {
    return existing;
  }

  const clinic = await prisma.business.findFirst({
    where: { businessType: "CLINIC" },
    orderBy: { createdAt: "asc" },
  });

  if (!clinic) {
    return null;
  }

  return prisma.whatsAppNumber.create({
    data: {
      businessId: clinic.id,
      phoneNumberId,
      displayNumber: input.displayPhoneNumber,
      wabaId: input.wabaId,
    },
  });
}

export async function ingestWhatsAppWebhook(parsed: ParsedWhatsAppWebhook) {
  for (const inbound of parsed.messages) {
    const number = await resolveWhatsAppNumber({
      phoneNumberId: inbound.phoneNumberId,
      displayPhoneNumber: inbound.displayPhoneNumber,
      wabaId: inbound.wabaId,
    });

    if (!number) {
      console.warn("[whatsapp ingest] no business mapped for", inbound.phoneNumberId);
      continue;
    }

    const existing = await prisma.message.findUnique({
      where: { waMessageId: inbound.messageId },
    });
    if (existing) {
      continue;
    }

    const sentAt = parseUnixDate(inbound.timestamp);
    const preview = previewText(inbound.type, inbound.text);

    const saved = await prisma.$transaction(async (tx) => {
      const contact = await tx.contact.upsert({
        where: {
          businessId_waId: {
            businessId: number.businessId,
            waId: inbound.from,
          },
        },
        create: {
          businessId: number.businessId,
          waId: inbound.from,
          name: inbound.contactName,
          source: "WHATSAPP",
          lifecycle: "NEW_LEAD",
        },
        update: inbound.contactName
          ? {
              name: inbound.contactName,
            }
          : {},
      });

      const conversation = await tx.conversation.upsert({
        where: {
          businessId_contactId_channel: {
            businessId: number.businessId,
            contactId: contact.id,
            channel: "whatsapp",
          },
        },
        create: {
          businessId: number.businessId,
          contactId: contact.id,
          channel: "whatsapp",
          lastMessageAt: sentAt,
          lastPreview: preview,
          unreadCount: 1,
        },
        update: {
          lastMessageAt: sentAt,
          lastPreview: preview,
          unreadCount: { increment: 1 },
        },
      });

      await tx.message.create({
        data: {
          conversationId: conversation.id,
          waMessageId: inbound.messageId,
          direction: "INBOUND",
          type: inbound.type,
          text: inbound.text,
          status: "DELIVERED",
          sentAt,
        },
      });

      return {
        contactId: contact.id,
        contactName: contact.name,
        conversationId: conversation.id,
      };
    });

    if (inbound.type === "text" && inbound.text?.trim()) {
      void handleInboundBookingAi({
        businessId: number.businessId,
        conversationId: saved.conversationId,
        contactId: saved.contactId,
        customerName: saved.contactName,
        waId: inbound.from,
        text: inbound.text.trim(),
        phoneNumberId: number.phoneNumberId,
      }).catch((error) => {
        console.error("[whatsapp ingest] ai booking failed", error);
      });
    }
  }

  for (const receipt of parsed.statuses) {
    const status = mapDeliveryStatus(receipt.status);
    if (!status) {
      continue;
    }

    await prisma.message.updateMany({
      where: { waMessageId: receipt.messageId },
      data: { status },
    });
  }
}
