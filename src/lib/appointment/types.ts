import type { BusinessType } from "@prisma/client";

export const APPOINTMENT_BUSINESS_TYPES = [
  "CLINIC",
  "BARBERSHOP",
] as const satisfies readonly BusinessType[];

export type AppointmentBusinessType =
  (typeof APPOINTMENT_BUSINESS_TYPES)[number];

export function isAppointmentBusiness(
  type: BusinessType,
): type is AppointmentBusinessType {
  return APPOINTMENT_BUSINESS_TYPES.includes(
    type as AppointmentBusinessType,
  );
}

export type AppointmentCopy = {
  industryLabel: string;
  roleLabel: string;
  customers: string;
  customerSingular: string;
  practitioners: string;
  practitionerSingular: string;
  locationNoun: string;
  searchPlaceholder: string;
  addCustomer: string;
  newAppointment: string;
  appointmentsSubtitle: string;
  availabilityTitle: string;
  manageRosters: string;
  checkIn: string;
  workspaceBase: string;
  practitionersHref: string;
};
