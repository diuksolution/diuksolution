import type {
  BusinessType,
  ContactLifecycle,
  FollowUpType,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ChatChannel } from "@/lib/chat/types";
import {
  BOOKING_STATUS_LABELS,
  DEFAULT_TAGS,
  FOLLOW_UP_TYPE_LABELS,
  GENDER_LABELS,
  LIFECYCLE_LABELS,
  SOURCE_LABELS,
} from "@/lib/crm/labels";
import type {
  CrmContactDetail,
  CrmEngagement,
  CrmStats,
  CrmTimelineEvent,
  CrmWorkspacePayload,
} from "@/lib/crm/types";

const DAY_MS = 24 * 60 * 60 * 1000;

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

function formatListTime(date: Date | null) {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatSince(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatRelative(date: Date | null, now: Date) {
  if (!date) {
    return "Belum ada aktivitas";
  }

  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) {
    return "Baru saja";
  }
  if (minutes < 60) {
    return `${minutes} menit lalu`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} jam lalu`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} hari lalu`;
  }

  const weeks = Math.floor(days / 7);
  if (weeks < 5) {
    return `${weeks} minggu lalu`;
  }

  return formatDate(date);
}

function formatRelativeDue(date: Date, now: Date) {
  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);
  const startDue = new Date(date);
  startDue.setHours(0, 0, 0, 0);
  const dayDiff = Math.round(
    (startDue.getTime() - startToday.getTime()) / DAY_MS,
  );

  if (dayDiff < 0) {
    return `Overdue ${Math.abs(dayDiff)}d`;
  }
  if (dayDiff === 0) {
    return "Due today";
  }
  if (dayDiff === 1) {
    return "Due tomorrow";
  }
  return `Due in ${dayDiff}d`;
}

function formatMoney(amount: number) {
  if (amount >= 1000) {
    const thousands = amount / 1000;
    const rounded =
      Number.isInteger(thousands) ? `${thousands}` : thousands.toFixed(0);
    return `Rp${rounded}k`;
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function resolveChannel(value: string | null | undefined): ChatChannel {
  if (value === "instagram" || value === "web" || value === "whatsapp") {
    return value;
  }
  return "whatsapp";
}

function resolveEngagement(input: {
  unreadCount: number;
  createdAt: Date;
  lastMessageAt: Date | null;
  now: Date;
}): { engagement: CrmEngagement; engagementLabel: string } {
  if (input.unreadCount > 0) {
    return { engagement: "needs_reply", engagementLabel: "Needs reply" };
  }

  const ageMs = input.now.getTime() - input.createdAt.getTime();
  if (ageMs <= 14 * DAY_MS) {
    return { engagement: "new", engagementLabel: "New" };
  }

  if (
    input.lastMessageAt &&
    input.now.getTime() - input.lastMessageAt.getTime() <= 7 * DAY_MS
  ) {
    return { engagement: "active", engagementLabel: "Active" };
  }

  return { engagement: "idle", engagementLabel: "Idle" };
}

function previewText(text: string | null | undefined, type: string) {
  const trimmed = text?.trim();
  if (trimmed) {
    return trimmed;
  }
  if (type !== "text") {
    return `[${type}]`;
  }
  return "(empty)";
}

async function ensureDefaultTags(businessId: string, businessType: BusinessType) {
  const existing = await prisma.tag.count({ where: { businessId } });
  if (existing > 0) {
    return;
  }

  const extras =
    businessType === "CLINIC"
      ? [
          { name: "Interested in Facial", color: "info" },
          { name: "Acne Treatment", color: "secondary" },
        ]
      : businessType === "BARBERSHOP"
        ? [
            { name: "Hair Treatment", color: "info" },
            { name: "Coloring", color: "secondary" },
          ]
        : [{ name: "Interested", color: "info" }];

  await prisma.tag.createMany({
    data: [...DEFAULT_TAGS, ...extras].map((tag) => ({
      businessId,
      name: tag.name,
      color: tag.color,
      updatedAt: new Date(),
    })),
    skipDuplicates: true,
  });
}

function buildTimeline(input: {
  contactName: string;
  createdAt: Date;
  sourceLabel: string;
  messages: Array<{
    id: string;
    direction: "INBOUND" | "OUTBOUND";
    text: string | null;
    type: string;
    sentAt: Date;
  }>;
  notes: Array<{ id: string; body: string; createdAt: Date; authorName: string | null }>;
  followUps: Array<{
    id: string;
    type: string;
    dueAt: Date;
    status: string;
    note: string | null;
    completedAt: Date | null;
    createdAt: Date;
  }>;
  bookings: Array<{
    id: string;
    service: string;
    status: string;
    scheduledAt: Date;
    completedAt: Date | null;
    createdAt: Date;
  }>;
}): CrmTimelineEvent[] {
  const events: CrmTimelineEvent[] = [
    {
      id: `started-${input.createdAt.toISOString()}`,
      at: input.createdAt.toISOString(),
      timeLabel: formatListTime(input.createdAt),
      title: `Started ${input.sourceLabel} conversation`,
      detail: `${input.contactName} masuk sebagai kontak baru`,
      tone: "primary",
    },
  ];

  for (const message of input.messages) {
    const inbound = message.direction === "INBOUND";
    events.push({
      id: `msg-${message.id}`,
      at: message.sentAt.toISOString(),
      timeLabel: formatListTime(message.sentAt),
      title: inbound ? "Customer message" : "Team / AI reply",
      detail: previewText(message.text, message.type),
      tone: inbound ? "neutral" : "primary",
    });
  }

  for (const note of input.notes) {
    events.push({
      id: `note-${note.id}`,
      at: note.createdAt.toISOString(),
      timeLabel: formatListTime(note.createdAt),
      title: "Internal note added",
      detail: `${note.authorName || "Staff"}: ${note.body}`,
      tone: "warning",
    });
  }

  for (const followUp of input.followUps) {
    events.push({
      id: `fu-create-${followUp.id}`,
      at: followUp.createdAt.toISOString(),
      timeLabel: formatListTime(followUp.createdAt),
      title: "Follow-up scheduled",
      detail: `${FOLLOW_UP_TYPE_LABELS[followUp.type as keyof typeof FOLLOW_UP_TYPE_LABELS] ?? followUp.type} · ${formatDate(followUp.dueAt)}`,
      tone: "warning",
    });

    if (followUp.completedAt) {
      events.push({
        id: `fu-done-${followUp.id}`,
        at: followUp.completedAt.toISOString(),
        timeLabel: formatListTime(followUp.completedAt),
        title: "Follow-up completed",
        detail: followUp.note || undefined,
        tone: "success",
      });
    }
  }

  for (const booking of input.bookings) {
    events.push({
      id: `book-${booking.id}`,
      at: booking.createdAt.toISOString(),
      timeLabel: formatListTime(booking.createdAt),
      title: "Booking created",
      detail: `${booking.service} · ${BOOKING_STATUS_LABELS[booking.status as keyof typeof BOOKING_STATUS_LABELS] ?? booking.status}`,
      tone: "primary",
    });

    if (booking.status === "COMPLETED" && booking.completedAt) {
      events.push({
        id: `book-done-${booking.id}`,
        at: booking.completedAt.toISOString(),
        timeLabel: formatListTime(booking.completedAt),
        title: "Appointment completed",
        detail: booking.service,
        tone: "success",
      });
    }
  }

  return events.sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );
}

export async function getCrmWorkspaceData(
  businessId: string,
): Promise<CrmWorkspacePayload> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { businessType: true },
  });

  if (business) {
    await ensureDefaultTags(businessId, business.businessType);
  }

  const [contacts, availableTags] = await Promise.all([
    prisma.contact.findMany({
      where: { businessId },
      include: {
        tags: { include: { tag: true } },
        notes: { orderBy: { createdAt: "desc" }, take: 20 },
        followUps: { orderBy: { dueAt: "asc" } },
        bookings: { orderBy: { scheduledAt: "desc" } },
        conversations: {
          orderBy: { lastMessageAt: "desc" },
          take: 1,
          include: {
            _count: { select: { messages: true } },
            messages: {
              orderBy: { sentAt: "desc" },
              take: 12,
              select: {
                id: true,
                direction: true,
                text: true,
                type: true,
                sentAt: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.tag.findMany({
      where: { businessId },
      orderBy: { name: "asc" },
    }),
  ]);

  const rows: CrmContactDetail[] = contacts.map((contact) => {
    const conversation = contact.conversations[0] ?? null;
    const name = contact.name?.trim() || formatPhone(contact.waId);
    const messages = conversation?.messages ?? [];
    const { engagement, engagementLabel } = resolveEngagement({
      unreadCount: conversation?.unreadCount ?? 0,
      createdAt: contact.createdAt,
      lastMessageAt: conversation?.lastMessageAt ?? null,
      now,
    });

    const bookings = contact.bookings.map((booking) => ({
      id: booking.id,
      service: booking.service,
      staffName: booking.staffName || "—",
      status: booking.status,
      statusLabel: BOOKING_STATUS_LABELS[booking.status],
      amount: booking.amount,
      amountLabel: formatMoney(booking.amount),
      dateLabel: formatDate(booking.scheduledAt),
      scheduledAt: booking.scheduledAt.toISOString(),
    }));

    const completed = contact.bookings.filter((b) => b.status === "COMPLETED");
    const cancelled = contact.bookings.filter((b) => b.status === "CANCELLED");
    const noShow = contact.bookings.filter((b) => b.status === "NO_SHOW");
    const totalSpend = completed.reduce((sum, item) => sum + item.amount, 0);
    const lastCompleted = completed[0] ?? null;
    const nextBooked =
      contact.bookings
        .filter((b) => b.status === "BOOKED" && b.scheduledAt >= now)
        .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())[0] ??
      null;

    const tags = contact.tags.map((item) => ({
      id: item.tag.id,
      name: item.tag.name,
      color: item.tag.color,
    }));

    const notes = contact.notes.map((note) => ({
      id: note.id,
      body: note.body,
      authorName: note.authorName || "Staff",
      createdAt: note.createdAt.toISOString(),
      timeLabel: formatListTime(note.createdAt),
    }));

    const followUps = contact.followUps.map((item) => ({
      id: item.id,
      type: item.type,
      typeLabel: FOLLOW_UP_TYPE_LABELS[item.type],
      status: item.status,
      dueAt: item.dueAt.toISOString(),
      dueLabel: formatDate(item.dueAt),
      relativeDue: formatRelativeDue(item.dueAt, now),
      note: item.note,
      overdue: item.status === "PENDING" && item.dueAt < now,
    }));

    const recentMessages = messages
      .slice()
      .reverse()
      .map((message) => ({
        id: message.id,
        direction: message.direction,
        text: previewText(message.text, message.type),
        sentAt: message.sentAt.toISOString(),
        timeLabel: formatListTime(message.sentAt),
      }));

    const timeline = buildTimeline({
      contactName: name,
      createdAt: contact.createdAt,
      sourceLabel: SOURCE_LABELS[contact.source],
      messages: messages.slice().reverse(),
      notes: contact.notes,
      followUps: contact.followUps,
      bookings: contact.bookings,
    });

    return {
      id: contact.id,
      name,
      initials: initialsFrom(name),
      phone: formatPhone(contact.waId),
      email: contact.email,
      gender: contact.gender,
      genderLabel: GENDER_LABELS[contact.gender],
      birthDate: contact.birthDate?.toISOString() ?? null,
      birthDateLabel: contact.birthDate ? formatDate(contact.birthDate) : null,
      source: contact.source,
      sourceLabel: SOURCE_LABELS[contact.source],
      lifecycle: contact.lifecycle,
      lifecycleLabel: LIFECYCLE_LABELS[contact.lifecycle],
      assignedStaff: contact.assignedStaff,
      potentialValue: contact.potentialValue,
      potentialValueLabel:
        contact.potentialValue != null
          ? formatMoney(contact.potentialValue)
          : null,
      nextFollowUpAt: contact.nextFollowUpAt?.toISOString() ?? null,
      channel: resolveChannel(conversation?.channel),
      conversationId: conversation?.id ?? null,
      lastPreview: conversation?.lastPreview || "Belum ada pesan",
      lastMessageAt: conversation?.lastMessageAt?.toISOString() ?? null,
      lastMessageLabel: formatListTime(conversation?.lastMessageAt ?? null),
      lastRelativeLabel: formatRelative(conversation?.lastMessageAt ?? null, now),
      unreadCount: conversation?.unreadCount ?? 0,
      messageCount: conversation?._count.messages ?? 0,
      createdAt: contact.createdAt.toISOString(),
      sinceLabel: formatSince(contact.createdAt),
      firstContactLabel: formatDate(contact.createdAt),
      engagement,
      engagementLabel,
      tags,
      notes,
      followUps,
      bookings,
      bookingStats: {
        total: contact.bookings.length,
        completed: completed.length,
        cancelled: cancelled.length,
        noShow: noShow.length,
        totalSpend,
        totalSpendLabel: formatMoney(totalSpend),
        lastBookingLabel: lastCompleted
          ? formatDate(lastCompleted.scheduledAt)
          : null,
        nextBookingLabel: nextBooked
          ? formatDate(nextBooked.scheduledAt)
          : null,
      },
      recentMessages,
      timeline,
    };
  });

  const pipelineValue = rows.reduce(
    (sum, row) => sum + (row.potentialValue ?? 0),
    0,
  );

  const stats: CrmStats = {
    total: rows.length,
    needsReply: rows.filter((row) => row.unreadCount > 0).length,
    followUpsDue: rows.reduce(
      (sum, row) =>
        sum +
        row.followUps.filter(
          (item) =>
            item.status === "PENDING" &&
            new Date(item.dueAt).getTime() <= endOfToday.getTime(),
        ).length,
      0,
    ),
    pipelineValueLabel: formatMoney(pipelineValue),
    newThisMonth: rows.filter((row) => new Date(row.createdAt) >= monthStart)
      .length,
  };

  const followUpsDue = rows.flatMap((contact) =>
    contact.followUps
      .filter(
        (item) =>
          item.status === "PENDING" &&
          new Date(item.dueAt).getTime() <= endOfToday.getTime(),
      )
      .map((followUp) => ({
        contactId: contact.id,
        contactName: contact.name,
        followUp,
        tagNames: contact.tags.map((tag) => tag.name),
      })),
  );

  return {
    contacts: rows,
    stats,
    availableTags: availableTags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
    })),
    followUpsDue,
  };
}

export async function updateContactLifecycle(
  businessId: string,
  contactId: string,
  lifecycle: ContactLifecycle,
) {
  return prisma.contact.updateMany({
    where: { id: contactId, businessId },
    data: { lifecycle },
  });
}

export async function addContactNote(input: {
  businessId: string;
  contactId: string;
  body: string;
  authorId?: string | null;
  authorName?: string | null;
}) {
  const contact = await prisma.contact.findFirst({
    where: { id: input.contactId, businessId: input.businessId },
    select: { id: true },
  });
  if (!contact) {
    return null;
  }

  return prisma.contactNote.create({
    data: {
      contactId: contact.id,
      body: input.body.trim(),
      authorId: input.authorId ?? null,
      authorName: input.authorName ?? null,
    },
  });
}

export async function toggleContactTag(input: {
  businessId: string;
  contactId: string;
  tagId: string;
}) {
  const [contact, tag] = await Promise.all([
    prisma.contact.findFirst({
      where: { id: input.contactId, businessId: input.businessId },
      select: { id: true },
    }),
    prisma.tag.findFirst({
      where: { id: input.tagId, businessId: input.businessId },
      select: { id: true },
    }),
  ]);

  if (!contact || !tag) {
    return null;
  }

  const existing = await prisma.contactTag.findUnique({
    where: {
      contactId_tagId: {
        contactId: contact.id,
        tagId: tag.id,
      },
    },
  });

  if (existing) {
    await prisma.contactTag.delete({
      where: {
        contactId_tagId: {
          contactId: contact.id,
          tagId: tag.id,
        },
      },
    });
    return { attached: false };
  }

  await prisma.contactTag.create({
    data: {
      contactId: contact.id,
      tagId: tag.id,
    },
  });
  return { attached: true };
}

export async function createContactFollowUp(input: {
  businessId: string;
  contactId: string;
  type: FollowUpType;
  dueAt: Date;
  note?: string;
}) {
  const contact = await prisma.contact.findFirst({
    where: { id: input.contactId, businessId: input.businessId },
    select: { id: true },
  });
  if (!contact) {
    return null;
  }

  const followUp = await prisma.contactFollowUp.create({
    data: {
      contactId: contact.id,
      type: input.type,
      dueAt: input.dueAt,
      note: input.note?.trim() || null,
    },
  });

  await prisma.contact.update({
    where: { id: contact.id },
    data: { nextFollowUpAt: input.dueAt },
  });

  return followUp;
}

export async function completeContactFollowUp(input: {
  businessId: string;
  contactId: string;
  followUpId: string;
}) {
  const followUp = await prisma.contactFollowUp.findFirst({
    where: {
      id: input.followUpId,
      contactId: input.contactId,
      contact: { businessId: input.businessId },
    },
  });

  if (!followUp) {
    return null;
  }

  return prisma.contactFollowUp.update({
    where: { id: followUp.id },
    data: {
      status: "DONE",
      completedAt: new Date(),
    },
  });
}

/** @deprecated Prefer getCrmWorkspaceData */
export async function getCrmContacts(businessId: string) {
  const data = await getCrmWorkspaceData(businessId);
  return data.contacts;
}
