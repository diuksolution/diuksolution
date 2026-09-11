import type { AppointmentCopy } from "@/lib/appointment/types";

export type KpiCardData = {
  id: string;
  eyebrow: string;
  title: string;
  value: string;
  valueSuffix?: string;
  delta: string;
  footer: string;
  meta: string;
  icon: string;
  iconClassName: string;
};

export type AppointmentTag = "vip" | "returning" | "new";
export type AppointmentStatus = "confirmed" | "waiting";
export type AppointmentAction = "checkin" | "qris" | "details";

export type AppointmentRowData = {
  id: string;
  time: string;
  customer: string;
  tag: AppointmentTag;
  practitioner: string;
  location: string;
  service: string;
  status: AppointmentStatus;
  action: AppointmentAction;
};

export type PractitionerStatus = "available" | "busy";

export type PractitionerData = {
  id: string;
  initials: string;
  name: string;
  specialty: string;
  status: PractitionerStatus;
  nextLabel: string;
  tone: "primary" | "secondary" | "success";
};

export type ConversationStatus = "ai" | "escalated" | "paid";

export type ConversationData = {
  id: string;
  name: string;
  channel: string;
  channelIcon: string;
  status: ConversationStatus;
  statusLabel: string;
  inbound: string;
  reply?: string;
  replyIcon?: string;
  replyTitle?: string;
  waitingLabel?: string;
  actionLabel?: string;
};

export type PipelineCardData = {
  id: string;
  source: string;
  time: string;
  name: string;
  service: string;
  value: string;
  meta?: string;
  done?: boolean;
};

export type PipelineColumnData = {
  id: string;
  title: string;
  count: number;
  dotClassName: string;
  cards: PipelineCardData[];
};

export type VelocityDayData = {
  label: string;
  value: number;
  height: number;
  peak?: boolean;
};

export type AppointmentDashboardData = {
  automationRatio: string;
  location: string;
  kpis: KpiCardData[];
  appointments: AppointmentRowData[];
  appointmentTotal: number;
  confirmedCount: number;
  waitingCount: number;
  practitioners: PractitionerData[];
  conversations: ConversationData[];
  velocity: VelocityDayData[];
  pipelineValue: string;
  pipeline: PipelineColumnData[];
};

function getPractitioners(
  copy: AppointmentCopy,
): PractitionerData[] {
  const suite = copy.locationNoun;

  if (copy.roleLabel === "Salon") {
    return [
      {
        id: "yg",
        initials: "YG",
        name: "Yoga Pratama",
        specialty: `Senior Stylist • ${suite} 2`,
        status: "available",
        nextLabel: "Next: 10:30",
        tone: "primary",
      },
      {
        id: "kw",
        initials: "KW",
        name: "Kevin Wibowo",
        specialty: `Barber • ${suite} 1`,
        status: "busy",
        nextLabel: "Ends: 10:15",
        tone: "secondary",
      },
      {
        id: "nu",
        initials: "NU",
        name: "Nadya Utami",
        specialty: "Color Specialist",
        status: "available",
        nextLabel: "Cons: 13:00",
        tone: "success",
      },
    ];
  }

  return [
    {
      id: "ds",
      initials: "DS",
      name: "Dr. Sarah Sp.KK",
      specialty: `Dermatologist • ${suite} 2`,
      status: "available",
      nextLabel: "Next: 10:30",
      tone: "primary",
    },
    {
      id: "dk",
      initials: "DK",
      name: "Dr. Kevin Sp.DV",
      specialty: "Aesthetic Doctor • Laser 1",
      status: "busy",
      nextLabel: "Ends: 10:15",
      tone: "secondary",
    },
    {
      id: "dm",
      initials: "DM",
      name: "Dr. Maya Sp.BP-RE",
      specialty: "Plastic & Aesthetic",
      status: "available",
      nextLabel: "Cons: 13:00",
      tone: "success",
    },
  ];
}

export function getAppointmentDashboardData(
  copy: AppointmentCopy,
  businessName: string,
): AppointmentDashboardData {
  const suite = copy.locationNoun;
  const practitioners = getPractitioners(copy);

  return {
    automationRatio: "82.4%",
    location: `${businessName} · Jakarta`,
    kpis: [
      {
        id: "appointments",
        eyebrow: "Daily Schedule",
        title: "Today's Appointments",
        value: "28",
        delta: "+12.5%",
        footer: "4 pending confirmation",
        meta: "85% Filled",
        icon: "calendar_today",
        iconClassName: "text-primary",
      },
      {
        id: "leads",
        eyebrow: "Acquisition",
        title: "New Inbound Leads",
        value: "16",
        delta: "+8.2%",
        footer: "WhatsApp & Instagram",
        meta: "Instant Sync",
        icon: "person_pin",
        iconClassName: "text-secondary",
      },
      {
        id: "conversations",
        eyebrow: "Engine Velocity",
        title: "Active Conversations",
        value: "42",
        delta: "+5.4%",
        footer: "82% automated by AI",
        meta: "~1.2s Resp",
        icon: "mark_chat_unread",
        iconClassName: "text-primary",
      },
      {
        id: "revenue",
        eyebrow: "Finance & Settlement",
        title: "Gross Revenue Today",
        value: "12.8",
        valueSuffix: "M",
        delta: "+14.6%",
        footer: "Rp 8.4M settled via QRIS",
        meta: "Auto-recon",
        icon: "payments",
        iconClassName: "text-success",
      },
    ],
    appointmentTotal: 28,
    confirmedCount: 20,
    waitingCount: 5,
    appointments: [
      {
        id: "1",
        time: "09:00 WIB",
        customer: "Amanda Putri",
        tag: "vip",
        practitioner: practitioners[0].name,
        location: `${suite} 2`,
        service: "Skin Barrier Check & Consultation",
        status: "confirmed",
        action: "checkin",
      },
      {
        id: "2",
        time: "10:30 WIB",
        customer: "Nadia Rahma",
        tag: "returning",
        practitioner: practitioners[1].name,
        location: `Laser ${suite} 1`,
        service: "Pico Laser Treatment",
        status: "confirmed",
        action: "checkin",
      },
      {
        id: "3",
        time: "13:00 WIB",
        customer: "Putri Ananda",
        tag: "new",
        practitioner: practitioners[0].name,
        location: `${suite} 3`,
        service: "Deep Hydration Facial",
        status: "waiting",
        action: "qris",
      },
      {
        id: "4",
        time: "15:30 WIB",
        customer: "Rania Safitri",
        tag: "vip",
        practitioner: practitioners[1].name,
        location: `Laser ${suite} 1`,
        service: "Acne Scar Subcision & PRP",
        status: "confirmed",
        action: "details",
      },
    ],
    practitioners,
    conversations: [
      {
        id: "c1",
        name: "Amanda Putri",
        channel: "WhatsApp",
        channelIcon: "chat",
        status: "ai",
        statusLabel: "AI Handled • 1.1s",
        inbound: '"Hi, is there any slot available tomorrow for Dr. Sarah?"',
        reply:
          '"Halo Kak Amanda! Ada slot kosong untuk Dr. Sarah besok jam 10:30 WIB & 14:00 WIB. Mau kami reservasikan jam berapa kak?"',
        replyIcon: "smart_toy",
      },
      {
        id: "c2",
        name: "Nadia Rahma",
        channel: "Instagram Direct",
        channelIcon: "photo_camera",
        status: "escalated",
        statusLabel: "Escalated to Desk • Pricing Inquiry",
        inbound:
          '"Halo min, mau tanya paket Pico Laser harganya berapa ya dan ada promo untuk bulan ini?"',
        waitingLabel: "Awaiting clinic receptionist response",
        actionLabel: "Take Over Chat",
      },
      {
        id: "c3",
        name: "Bima Saputra",
        channel: "WhatsApp",
        channelIcon: "chat",
        status: "paid",
        statusLabel: "Auto Verified • Rp 850.000",
        inbound: '"Sudah saya transfer deposit 200rb via QRIS ya kak."',
        replyTitle: "Payment Matched [#INV-9921]",
        reply:
          '"Terima kasih Kak Bima! Pembayaran deposit Rp 200.000 telah kami verifikasi otomatis."',
        replyIcon: "check_circle",
      },
    ],
    velocity: [
      { label: "Mon", value: 18, height: 42 },
      { label: "Tue", value: 22, height: 52 },
      { label: "Wed", value: 24, height: 58 },
      { label: "Thu", value: 28, height: 66 },
      { label: "Fri", value: 31, height: 74 },
      { label: "Sat", value: 42, height: 100, peak: true },
      { label: "Sun", value: 14, height: 33 },
    ],
    pipelineValue: "Rp 38.400.000",
    pipeline: [
      {
        id: "new",
        title: "New",
        count: 3,
        dotClassName: "bg-secondary",
        cards: [
          {
            id: "p1",
            source: "Instagram",
            time: "10m ago",
            name: "Dewi Lestari",
            service: "Laser Inquiry",
            value: "Rp 2.200.000",
          },
        ],
      },
      {
        id: "contacted",
        title: "Contacted",
        count: 6,
        dotClassName: "bg-info",
        cards: [
          {
            id: "p2",
            source: "WhatsApp AI",
            time: "24m ago",
            name: "Rizky Maulana",
            service: "Skin Health Check",
            value: "Rp 450.000",
          },
        ],
      },
      {
        id: "qualified",
        title: "Qualified",
        count: 4,
        dotClassName: "bg-primary",
        cards: [
          {
            id: "p3",
            source: "Consulted",
            time: "1h ago",
            name: "Nadia Rahma",
            service: "Pico Laser Package",
            value: "Rp 1.850.000",
          },
        ],
      },
      {
        id: "booked",
        title: "Booked",
        count: 8,
        dotClassName: "bg-primary-dark",
        cards: [
          {
            id: "p4",
            source: "Ready 09:00",
            time: "Deposit Paid",
            name: "Amanda Putri",
            service: "Confirmed Slot",
            value: "Rp 1.250.000",
            done: true,
          },
        ],
      },
      {
        id: "converted",
        title: "Converted",
        count: 11,
        dotClassName: "bg-success",
        cards: [
          {
            id: "p5",
            source: "Treatment Done",
            time: "Today",
            name: "Clarissa Anjani",
            service: "Exosome Pkg 3x",
            value: "Rp 4.500.000",
            done: true,
          },
        ],
      },
    ],
  };
}
