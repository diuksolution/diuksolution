import type {
  ContactGender,
  ContactLifecycle,
  CrmBookingStatus,
  FollowUpStatus,
  FollowUpType,
  LeadSource,
} from "@prisma/client";
import type { ChatChannel } from "@/lib/chat/types";

export type CrmEngagement = "needs_reply" | "active" | "idle" | "new";

export type CrmMessagePreview = {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  text: string;
  sentAt: string;
  timeLabel: string;
};

export type CrmTag = {
  id: string;
  name: string;
  color: string;
};

export type CrmNote = {
  id: string;
  body: string;
  authorName: string;
  createdAt: string;
  timeLabel: string;
};

export type CrmFollowUp = {
  id: string;
  type: FollowUpType;
  typeLabel: string;
  status: FollowUpStatus;
  dueAt: string;
  dueLabel: string;
  relativeDue: string;
  note: string | null;
  overdue: boolean;
};

export type CrmBooking = {
  id: string;
  service: string;
  staffName: string;
  status: CrmBookingStatus;
  statusLabel: string;
  amount: number;
  amountLabel: string;
  dateLabel: string;
  scheduledAt: string;
};

export type CrmTimelineEvent = {
  id: string;
  at: string;
  timeLabel: string;
  title: string;
  detail?: string;
  tone: "neutral" | "primary" | "success" | "warning";
};

export type CrmContactDetail = {
  id: string;
  name: string;
  initials: string;
  phone: string;
  email: string | null;
  gender: ContactGender;
  genderLabel: string;
  birthDate: string | null;
  birthDateLabel: string | null;
  source: LeadSource;
  sourceLabel: string;
  lifecycle: ContactLifecycle;
  lifecycleLabel: string;
  assignedStaff: string | null;
  potentialValue: number | null;
  potentialValueLabel: string | null;
  nextFollowUpAt: string | null;
  channel: ChatChannel;
  conversationId: string | null;
  lastPreview: string;
  lastMessageAt: string | null;
  lastMessageLabel: string;
  lastRelativeLabel: string;
  unreadCount: number;
  messageCount: number;
  createdAt: string;
  sinceLabel: string;
  firstContactLabel: string;
  engagement: CrmEngagement;
  engagementLabel: string;
  tags: CrmTag[];
  notes: CrmNote[];
  followUps: CrmFollowUp[];
  bookings: CrmBooking[];
  bookingStats: {
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
    totalSpend: number;
    totalSpendLabel: string;
    lastBookingLabel: string | null;
    nextBookingLabel: string | null;
  };
  recentMessages: CrmMessagePreview[];
  timeline: CrmTimelineEvent[];
};

export type CrmStats = {
  total: number;
  needsReply: number;
  followUpsDue: number;
  pipelineValueLabel: string;
  newThisMonth: number;
};

export type CrmWorkspacePayload = {
  contacts: CrmContactDetail[];
  stats: CrmStats;
  availableTags: CrmTag[];
  followUpsDue: Array<{
    contactId: string;
    contactName: string;
    followUp: CrmFollowUp;
    tagNames: string[];
  }>;
};
