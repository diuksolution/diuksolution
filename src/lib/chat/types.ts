export type ChatChannel = "whatsapp" | "instagram" | "web";

export type InboxFilter = "all" | "unread" | "read" | "assigned" | "ai" | "action";

export type ConversationStatus =
  | "auto-booked"
  | "waiting"
  | "resolved"
  | "ai-handled"
  | "paid";

export type ChatCopy = {
  customerSingular: string;
  customerPlural: string;
  practitionerSingular: string;
  locationNoun: string;
  chartLabel: string;
  notesTitle: string;
  bookLabel: string;
  searchPlaceholder: string;
  appointmentsHref: string;
};

export type ChatBadge = {
  label: string;
  tone: "primary" | "success" | "warning" | "neutral" | "muted";
  pulse?: boolean;
  icon?: string;
};

export type ChatMessage =
  | {
      id: string;
      kind: "date";
      label: string;
    }
  | {
      id: string;
      kind: "customer";
      name: string;
      initials: string;
      time: string;
      text: string;
    }
  | {
      id: string;
      kind: "business";
      time: string;
      text: string;
      deliveryStatus?: "PENDING" | "SENT" | "DELIVERED" | "READ" | "FAILED";
    }
  | {
      id: string;
      kind: "ai";
      time: string;
      latency: string;
      paragraphs: string[];
      slots?: string[];
      closing?: string;
    }
  | {
      id: string;
      kind: "system";
      time: string;
      title: string;
      service: string;
      practitioner: string;
      schedule: string;
      bookingId: string;
      extra: string;
      href: string;
    };

export type ChatConversation = {
  id: string;
  name: string;
  initials: string;
  phone: string;
  channel: ChatChannel;
  time: string;
  preview: string;
  unread: number;
  assignedToMe: boolean;
  aiActive: boolean;
  needsAction: boolean;
  vip: boolean;
  since: string;
  online: boolean;
  status: ConversationStatus;
  statusBadge: ChatBadge;
  extraBadge?: string;
  tags: string[];
  lifetimeVisits: string;
  lifetimeValue: string;
  notesAuthor: string;
  notes: string;
  booking?: {
    service: string;
    practitioner: string;
    schedule: string;
    deposit: string;
    paid: boolean;
  };
  messages: ChatMessage[];
};

export type ChatWorkspaceData = {
  copy: ChatCopy;
  activeCount: number;
  live?: boolean;
  conversations: ChatConversation[];
};
