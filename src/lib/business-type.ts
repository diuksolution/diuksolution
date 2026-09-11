import type { BusinessType } from "@prisma/client";

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  CLINIC: "Clinic",
  FNB: "F&B",
  BARBERSHOP: "Barbershop",
  GYM: "Gym",
  TOURISM: "Tourism",
  OTHER: "Other",
};
