import type {
  ContactGender,
  ContactLifecycle,
  CrmBookingStatus,
  FollowUpType,
  LeadSource,
} from "@prisma/client";

export const LIFECYCLE_LABELS: Record<ContactLifecycle, string> = {
  NEW_LEAD: "New Lead",
  CONTACTED: "Contacted",
  INTERESTED: "Interested",
  BOOKED: "Booked",
  CUSTOMER: "Customer",
  RETURNING: "Returning Customer",
  INACTIVE: "Inactive",
  LOST: "Lost",
};

export const LIFECYCLE_ORDER: ContactLifecycle[] = [
  "NEW_LEAD",
  "CONTACTED",
  "INTERESTED",
  "BOOKED",
  "CUSTOMER",
  "RETURNING",
  "INACTIVE",
  "LOST",
];

export const SOURCE_LABELS: Record<LeadSource, string> = {
  WHATSAPP: "WhatsApp",
  INSTAGRAM: "Instagram",
  WEBSITE: "Website",
  REFERRAL: "Referral",
  OTHER: "Other",
};

export const GENDER_LABELS: Record<ContactGender, string> = {
  FEMALE: "Female",
  MALE: "Male",
  OTHER: "Other",
  UNSPECIFIED: "—",
};

export const FOLLOW_UP_TYPE_LABELS: Record<FollowUpType, string> = {
  BOOKING: "Follow up booking",
  REMINDER: "Reminder appointment",
  POST_SERVICE: "Post-service follow-up",
  PROMO: "Promo follow-up",
  UNREPLIED: "Customer belum membalas",
  NO_BOOKING: "Belum melakukan booking",
  CUSTOM: "Custom follow-up",
};

export const BOOKING_STATUS_LABELS: Record<CrmBookingStatus, string> = {
  BOOKED: "Booked",
  CANCELLED: "Cancelled",
  DP: "DP",
  PAID: "Paid",
  DONE: "Done",
};

/** Statuses set automatically by booking/payment system. */
export const SYSTEM_BOOKING_STATUSES: CrmBookingStatus[] = [
  "BOOKED",
  "CANCELLED",
  "DP",
  "PAID",
];

/** Only status staff can set manually from the appointments list. */
export const MANUAL_BOOKING_STATUSES: CrmBookingStatus[] = ["DONE"];


export const DEFAULT_TAGS = [
  { name: "VIP", color: "warning" },
  { name: "New Customer", color: "info" },
  { name: "Returning", color: "success" },
  { name: "High Value", color: "primary" },
  { name: "Needs Follow-up", color: "warning" },
  { name: "Promo", color: "secondary" },
] as const;
