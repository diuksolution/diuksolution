export type PractitionerTone = "primary" | "secondary" | "success";

export type PractitionerRow = {
  id: string;
  name: string;
  initials: string;
  title: string | null;
  specialty: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  isActive: boolean;
  timezone: string;
  tone: PractitionerTone;
  googleAccountEmail: string | null;
  googleCalendarId: string | null;
  googleConnectedAt: string | null;
  calendarSyncEnabled: boolean;
  calendarStatus: "connected" | "disconnected";
  displaySpecialty: string;
  services: Array<{ id: string; name: string }>;
  serviceIds: string[];
};

export type PractitionerInput = {
  name: string;
  title?: string | null;
  specialty?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  bio?: string | null;
  isActive?: boolean;
  timezone?: string;
  tone?: PractitionerTone;
  serviceIds?: string[];
};
