import type { BusinessType } from "@prisma/client";
import type { AppointmentCopy } from "@/lib/appointment/types";
import { isAppointmentBusiness } from "@/lib/appointment/types";

const clinicCopy: AppointmentCopy = {
  industryLabel: "Beauty & Aesthetic",
  roleLabel: "Clinic",
  customers: "Patients",
  customerSingular: "Patient",
  practitioners: "Doctor List",
  practitionerSingular: "Doctor",
  locationNoun: "Suite",
  searchPlaceholder:
    "Search patients, appointments, phone, or chats... [⌘K]",
  addCustomer: "Add Patient",
  newAppointment: "New Appointment",
  appointmentsSubtitle: "Real-time consultation & suite tracking",
  availabilityTitle: "Doctor Availability",
  manageRosters: "Manage Rosters",
  checkIn: "Check-in",
  workspaceBase: "/admin/clinic",
  practitionersHref: "/admin/clinic/doctors",
};

const salonCopy: AppointmentCopy = {
  industryLabel: "Salon & Barbershop",
  roleLabel: "Salon",
  customers: "Clients",
  customerSingular: "Client",
  practitioners: "Stylist List",
  practitionerSingular: "Stylist",
  locationNoun: "Chair",
  searchPlaceholder: "Search clients, appointments, phone, or chats... [⌘K]",
  addCustomer: "Add Client",
  newAppointment: "New Appointment",
  appointmentsSubtitle: "Real-time chair & stylist tracking",
  availabilityTitle: "Stylist Availability",
  manageRosters: "Manage Rosters",
  checkIn: "Check-in",
  workspaceBase: "/admin/salon",
  practitionersHref: "/admin/salon/stylists",
};

export function getAppointmentCopy(type: BusinessType): AppointmentCopy {
  if (type === "BARBERSHOP") {
    return salonCopy;
  }

  return clinicCopy;
}

export function getWorkspaceLabel(type: BusinessType) {
  if (isAppointmentBusiness(type)) {
    return getAppointmentCopy(type).industryLabel;
  }

  if (type === "FNB") {
    return "Food & Beverage";
  }

  if (type === "GYM") {
    return "Fitness Studio";
  }

  if (type === "TOURISM") {
    return "Hospitality";
  }

  return "Workspace";
}
