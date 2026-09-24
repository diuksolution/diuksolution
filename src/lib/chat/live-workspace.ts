import type { Conversation, Message, Contact } from "@prisma/client";
import type {
  ChatConversation,
  ChatCopy,
  ChatMessage,
  ChatWorkspaceData,
} from "@/lib/chat/types";
import { prisma } from "@/lib/prisma";
import { getChatCopy } from "@/lib/chat/workspace-data";
import {
  getChatRevision,
  rememberInbox,
  rememberMessages,
} from "@/lib/chat/cache";
import { isWithinCustomerServiceWindow } from "@/lib/whatsapp/session-window";

type ConversationWithContact = Conversation & {
  contact: Pick<Contact, "id" | "name" | "waId">;
};

function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "WA";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function formatPhone(waId: string) {
  if (waId.startsWith("+")) {
    return waId;
  }
  return `+${waId}`;
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function dayKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function toChatMessages(input: {
  contact: Contact;
  messages: Message[];
}): ChatMessage[] {
  const items: ChatMessage[] = [];
  let lastDay = "";
  const name = input.contact.name?.trim() || formatPhone(input.contact.waId);

  for (const message of input.messages) {
    const key = dayKey(message.sentAt);
    if (key !== lastDay) {
      lastDay = key;
      items.push({
        id: `date-${key}`,
        kind: "date",
        label: formatDateLabel(message.sentAt),
      });
    }

    if (message.direction === "INBOUND") {
      items.push({
        id: message.id,
        kind: "customer",
        name,
        initials: initialsFrom(name),
        time: formatTime(message.sentAt),
        text: message.text?.trim() || `[${message.type}]`,
      });
      continue;
    }

    items.push({
      id: message.id,
      kind: "business",
      time: formatTime(message.sentAt),
      text: message.text?.trim() || `[${message.type}]`,
      deliveryStatus: message.status,
    });
  }

  return items;
}

export function toChatConversation(
  conversation: ConversationWithContact,
  messages: ChatMessage[] = [],
  extras?: { canReply?: boolean },
): ChatConversation {
  const name =
    conversation.contact.name?.trim() || formatPhone(conversation.contact.waId);

  return {
    id: conversation.id,
    name,
    initials: initialsFrom(name),
    phone: formatPhone(conversation.contact.waId),
    channel: "whatsapp",
    time: formatTime(conversation.lastMessageAt),
    preview: conversation.lastPreview,
    unread: conversation.unreadCount,
    assignedToMe: false,
    aiActive: conversation.aiEnabled,
    canReply: extras?.canReply ?? true,
    needsAction: conversation.unreadCount > 0,
    vip: false,
    since: `Customer since ${new Intl.DateTimeFormat("en-GB", {
      month: "short",
      year: "numeric",
    }).format(conversation.createdAt)}`,
    online: false,
    status: conversation.unreadCount > 0 ? "waiting" : "resolved",
    statusBadge: { label: "WhatsApp", tone: "success", icon: "chat" },
    tags: ["WhatsApp"],
    lifetimeVisits: "—",
    lifetimeValue: "—",
    notesAuthor: "",
    notes: "",
    messages,
  };
}

/** Lightweight inbox list — no message bodies. */
export async function getLiveChatInbox(
  businessId: string,
  variant: "clinic" | "salon" | "fnb",
  copy?: ChatCopy,
): Promise<ChatWorkspaceData> {
  const [payload, revision] = await Promise.all([
    rememberInbox(businessId, variant, async () => {
      const rows = await prisma.conversation.findMany({
        where: { businessId },
        include: {
          contact: {
            select: { id: true, name: true, waId: true, createdAt: true },
          },
        },
        orderBy: { lastMessageAt: "desc" },
        take: 50,
      });

      const conversations = rows.map((row) =>
        toChatConversation(row, [], {
          canReply: isWithinCustomerServiceWindow(row.lastMessageAt),
        }),
      );

      return {
        copy: copy ?? getChatCopy(variant),
        activeCount: conversations.length,
        live: true as const,
        conversations,
      };
    }),
    getChatRevision(businessId),
  ]);

  return { ...payload, revision };
}

export async function getConversationMessages(
  businessId: string,
  conversationId: string,
): Promise<ChatMessage[] | null> {
  return rememberMessages(businessId, conversationId, async () => {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, businessId },
      include: {
        contact: true,
        messages: { orderBy: { sentAt: "desc" }, take: 80 },
      },
    });

    if (!conversation) {
      return null;
    }

    return toChatMessages({
      contact: conversation.contact,
      messages: conversation.messages.slice().reverse(),
    });
  });
}

/** Initial page payload: inbox + messages for one open room. */
export async function getLiveChatWorkspace(
  businessId: string,
  variant: "clinic" | "salon" | "fnb",
  copy?: ChatCopy,
  openConversationId?: string | null,
): Promise<ChatWorkspaceData> {
  const inbox = await getLiveChatInbox(businessId, variant, copy);
  const openId =
    openConversationId &&
    inbox.conversations.some((item) => item.id === openConversationId)
      ? openConversationId
      : inbox.conversations[0]?.id;

  if (!openId) {
    return inbox;
  }

  const messages = await getConversationMessages(businessId, openId);
  return {
    ...inbox,
    conversations: inbox.conversations.map((row) =>
      row.id === openId ? { ...row, messages: messages ?? [] } : row,
    ),
  };
}
