import type { ChatConversation, ChatCopy, ChatWorkspaceData } from "@/lib/chat/types";

function clinicCopy(): ChatCopy {
  return {
    customerSingular: "Patient",
    customerPlural: "Patients",
    practitionerSingular: "Doctor",
    locationNoun: "Suite",
    chartLabel: "EHR Chart",
    notesTitle: "Internal Clinic Notes",
    bookLabel: "Book Slot",
    searchPlaceholder: "Search conversations (name, text, phone)...",
    appointmentsHref: "/admin/clinic/appointments",
  };
}

function salonCopy(): ChatCopy {
  return {
    customerSingular: "Client",
    customerPlural: "Clients",
    practitionerSingular: "Stylist",
    locationNoun: "Chair",
    chartLabel: "Client File",
    notesTitle: "Internal Salon Notes",
    bookLabel: "Book Slot",
    searchPlaceholder: "Search conversations (name, text, phone)...",
    appointmentsHref: "/admin/salon/appointments",
  };
}

function fnbCopy(): ChatCopy {
  return {
    customerSingular: "Guest",
    customerPlural: "Guests",
    practitionerSingular: "Host",
    locationNoun: "Table",
    chartLabel: "Guest File",
    notesTitle: "Internal Notes",
    bookLabel: "Book Table",
    searchPlaceholder: "Search conversations (name, text, phone)...",
    appointmentsHref: "/admin/fnb/reservations",
  };
}

function clinicConversations(): ChatConversation[] {
  return [
    {
      id: "sarah",
      name: "Sarah Wijaya",
      initials: "SW",
      phone: "+62 812-3490-8821",
      channel: "whatsapp",
      time: "10:42 AM",
      preview: "Boleh kak. Jadwal besok jam 14.00 ya.",
      unread: 2,
      assignedToMe: true,
      aiActive: true,
      needsAction: false,
      vip: true,
      since: "Customer since Aug 2026",
      online: true,
      status: "auto-booked",
      statusBadge: {
        label: "AI Auto-Booked",
        tone: "primary",
        pulse: true,
      },
      extraBadge: "Facial Treatment",
      tags: [
        "Returning Customer",
        "Facial & Peel",
        "High Intent",
        "WhatsApp Primary",
      ],
      lifetimeVisits: "8 Times",
      lifetimeValue: "Rp 8.45M",
      notesAuthor: "Dr. Sarah's Note",
      notes:
        "Prefers afternoon appointments (14.00 - 16.00). Mild sensitive skin on cheek area, avoid aggressive retinoid peels. Loves chamomile tea.",
      booking: {
        service: "Deep Hydration Facial",
        practitioner: "Dr. Sarah Sp.KK • Suite 2",
        schedule: "Tomorrow, Sep 11 • 14:00 WIB",
        deposit: "Rp 200.000",
        paid: true,
      },
      messages: [
        { id: "d1", kind: "date", label: "Today, September 10, 2026" },
        {
          id: "m1",
          kind: "customer",
          name: "Sarah Wijaya",
          initials: "SW",
          time: "10:40 AM",
          text: "Hi kak, saya mau booking treatment facial untuk besok siang. Dokternya dr. Sarah masih ada slot?",
        },
        {
          id: "m2",
          kind: "ai",
          time: "10:40 AM",
          latency: "1.1s",
          paragraphs: [
            "Halo Kak Sarah! Tentu.",
            "Untuk besok, Dr. Sarah Sp.KK di Suite 2 tersedia di 2 slot siang:",
          ],
          slots: [
            "Pukul 11.00 WIB (Deep Hydration Facial)",
            "Pukul 14.00 WIB (Deep Hydration Facial)",
          ],
          closing: "Kak Sarah ingin kami reservasikan di jam berapa?",
        },
        {
          id: "m3",
          kind: "customer",
          name: "Sarah Wijaya",
          initials: "SW",
          time: "10:41 AM",
          text: "Kalau jam 2 siang (14:00) masih tersedia ya kak?",
        },
        {
          id: "m4",
          kind: "ai",
          time: "10:41 AM",
          latency: "0.9s",
          paragraphs: [
            "Masih tersedia, Kak Sarah! Slot langsung kami tahan selama 15 menit.",
            "Boleh kami kunci jadwalnya atas nama Kak Sarah Wijaya untuk treatment Facial besok pukul 14.00 WIB?",
          ],
        },
        {
          id: "m5",
          kind: "customer",
          name: "Sarah Wijaya",
          initials: "SW",
          time: "10:42 AM",
          text: "Boleh kak, tolong di-booking ya.",
        },
        {
          id: "m6",
          kind: "system",
          time: "10:42 AM",
          title: "Appointment Confirmed & Created",
          service: "Deep Hydration Facial",
          practitioner: "Dr. Sarah Sp.KK (Suite 2)",
          schedule: "Tomorrow, Sep 11 • 14:00 WIB",
          bookingId: "#APT-8821",
          extra: "Deposit QRIS Verified",
          href: "/admin/clinic/appointments",
        },
        {
          id: "m7",
          kind: "ai",
          time: "10:42 AM",
          latency: "1.2s",
          paragraphs: [
            "Reservasi Kak Sarah sudah terkonfirmasi!",
            "Kami telah mengirimkan kartu pengingat & rute Google Maps ke WhatsApp ini. Sampai bertemu besok jam 14.00 WIB di GlowCare Clinic Senopati ya Kak!",
          ],
        },
      ],
    },
    {
      id: "andi",
      name: "Andi Pratama",
      initials: "AP",
      phone: "+62 813-2201-7744",
      channel: "whatsapp",
      time: "10:28 AM",
      preview: "Dokternya tersedia jam 15.00 sore ini?",
      unread: 1,
      assignedToMe: true,
      aiActive: false,
      needsAction: true,
      vip: false,
      since: "Customer since Mar 2026",
      online: false,
      status: "waiting",
      statusBadge: { label: "Waiting for Human", tone: "warning" },
      extraBadge: "Dr. Kevin",
      tags: ["New Inquiry", "Consultation"],
      lifetimeVisits: "2 Times",
      lifetimeValue: "Rp 1.20M",
      notesAuthor: "Front Desk",
      notes:
        "Asked for same-day consultation. Confirm Dr. Kevin overtime availability before locking the slot.",
      messages: [
        { id: "d1", kind: "date", label: "Today, September 10, 2026" },
        {
          id: "m1",
          kind: "customer",
          name: "Andi Pratama",
          initials: "AP",
          time: "10:26 AM",
          text: "Halo kak, dokternya tersedia jam 15.00 sore ini?",
        },
        {
          id: "m2",
          kind: "ai",
          time: "10:27 AM",
          latency: "1.4s",
          paragraphs: [
            "Halo Kak Andi. Jam 15.00 hari ini untuk Dr. Kevin sedang kami cek ke roster klinik.",
            "Mohon tunggu sebentar, staf kami akan konfirmasi ketersediaan overtime-nya.",
          ],
        },
        {
          id: "m3",
          kind: "customer",
          name: "Andi Pratama",
          initials: "AP",
          time: "10:28 AM",
          text: "Dokternya tersedia jam 15.00 sore ini?",
        },
      ],
    },
    {
      id: "nadia",
      name: "Nadia Putri",
      initials: "NP",
      phone: "@nadia.putri",
      channel: "instagram",
      time: "9:51 AM",
      preview: "Terima kasih min, booking saya sudah dikonfirmasi.",
      unread: 0,
      assignedToMe: false,
      aiActive: false,
      needsAction: false,
      vip: false,
      since: "Customer since Jan 2026",
      online: false,
      status: "resolved",
      statusBadge: { label: "Resolved", tone: "success", icon: "check" },
      extraBadge: "Pico Laser",
      tags: ["Instagram", "Pico Laser"],
      lifetimeVisits: "5 Times",
      lifetimeValue: "Rp 6.10M",
      notesAuthor: "Clinic Note",
      notes: "Responds fastest on Instagram Direct. Prefers weekend slots.",
      booking: {
        service: "Pico Laser",
        practitioner: "Dr. Kevin • Suite 1",
        schedule: "Sat, Sep 12 • 11:00 WIB",
        deposit: "Rp 350.000",
        paid: true,
      },
      messages: [
        { id: "d1", kind: "date", label: "Today, September 10, 2026" },
        {
          id: "m1",
          kind: "customer",
          name: "Nadia Putri",
          initials: "NP",
          time: "9:48 AM",
          text: "Min, booking Pico Laser saya sudah masuk belum?",
        },
        {
          id: "m2",
          kind: "ai",
          time: "9:49 AM",
          latency: "1.0s",
          paragraphs: [
            "Sudah masuk, Kak Nadia. Pico Laser untuk Sabtu jam 11.00 WIB sudah terkonfirmasi.",
          ],
        },
        {
          id: "m3",
          kind: "customer",
          name: "Nadia Putri",
          initials: "NP",
          time: "9:51 AM",
          text: "Terima kasih min, booking saya sudah dikonfirmasi.",
        },
      ],
    },
    {
      id: "rizky",
      name: "Rizky Ramadhan",
      initials: "RR",
      phone: "Web visitor",
      channel: "web",
      time: "Yesterday",
      preview: "Saya mau tanya harga treatment acne scar...",
      unread: 0,
      assignedToMe: false,
      aiActive: true,
      needsAction: false,
      vip: false,
      since: "New visitor",
      online: false,
      status: "ai-handled",
      statusBadge: { label: "AI Handled", tone: "primary", icon: "auto_awesome" },
      extraBadge: "Inquiry",
      tags: ["Website Chat", "Pricing"],
      lifetimeVisits: "0 Visits",
      lifetimeValue: "Rp 0",
      notesAuthor: "AI Summary",
      notes: "Price shopping acne scar packages. Send follow-up if no reply in 24 hours.",
      messages: [
        { id: "d1", kind: "date", label: "Yesterday, September 9, 2026" },
        {
          id: "m1",
          kind: "customer",
          name: "Rizky Ramadhan",
          initials: "RR",
          time: "4:12 PM",
          text: "Saya mau tanya harga treatment acne scar...",
        },
        {
          id: "m2",
          kind: "ai",
          time: "4:12 PM",
          latency: "1.3s",
          paragraphs: [
            "Halo Kak Rizky. Paket Acne Scar Subcision & PRP mulai dari Rp 2.200.000 per sesi.",
            "Kalau Kak Rizky mau, kami bisa bantu cek slot konsultasi awal dengan dokter.",
          ],
        },
      ],
    },
    {
      id: "dewi",
      name: "Dewi Lestari",
      initials: "DL",
      phone: "+62 811-9088-2210",
      channel: "whatsapp",
      time: "Yesterday",
      preview: "Apakah ada jadwal dokter hari Sabtu?",
      unread: 0,
      assignedToMe: false,
      aiActive: true,
      needsAction: false,
      vip: false,
      since: "Customer since May 2026",
      online: false,
      status: "ai-handled",
      statusBadge: { label: "AI Handled", tone: "primary", icon: "auto_awesome" },
      extraBadge: "Slot Locked",
      tags: ["Weekend Slot"],
      lifetimeVisits: "3 Times",
      lifetimeValue: "Rp 2.80M",
      notesAuthor: "Clinic Note",
      notes: "Usually books Saturday morning. Keep a 10:00 buffer if possible.",
      booking: {
        service: "Laser Inquiry",
        practitioner: "Dr. Sarah Sp.KK • Suite 2",
        schedule: "Sat, Sep 12 • 10:00 WIB",
        deposit: "Hold 15 min",
        paid: false,
      },
      messages: [
        { id: "d1", kind: "date", label: "Yesterday, September 9, 2026" },
        {
          id: "m1",
          kind: "customer",
          name: "Dewi Lestari",
          initials: "DL",
          time: "6:20 PM",
          text: "Apakah ada jadwal dokter hari Sabtu?",
        },
        {
          id: "m2",
          kind: "ai",
          time: "6:20 PM",
          latency: "0.8s",
          paragraphs: [
            "Ada, Kak Dewi. Sabtu pagi Dr. Sarah masih punya slot jam 10.00 WIB. Kami kunci dulu 15 menit ya.",
          ],
        },
      ],
    },
    {
      id: "bima",
      name: "Bima Saputra",
      initials: "BS",
      phone: "+62 878-4412-0091",
      channel: "whatsapp",
      time: "Sep 6",
      preview: "Sudah saya transfer deposit 200rb via QRIS ya kak.",
      unread: 0,
      assignedToMe: false,
      aiActive: false,
      needsAction: false,
      vip: false,
      since: "Customer since Feb 2026",
      online: false,
      status: "paid",
      statusBadge: { label: "Rp 200.000 QRIS Paid", tone: "success" },
      tags: ["Deposit Paid", "Returning"],
      lifetimeVisits: "4 Times",
      lifetimeValue: "Rp 3.40M",
      notesAuthor: "Billing",
      notes: "Deposit matched automatically against invoice #INV-9921.",
      booking: {
        service: "Acne Scar Subcision & PRP",
        practitioner: "Dr. Kevin • Laser Suite 1",
        schedule: "Fri, Sep 11 • 16:00 WIB",
        deposit: "Rp 200.000",
        paid: true,
      },
      messages: [
        { id: "d1", kind: "date", label: "September 6, 2026" },
        {
          id: "m1",
          kind: "customer",
          name: "Bima Saputra",
          initials: "BS",
          time: "7:05 PM",
          text: "Sudah saya transfer deposit 200rb via QRIS ya kak.",
        },
        {
          id: "m2",
          kind: "ai",
          time: "7:05 PM",
          latency: "0.7s",
          paragraphs: [
            "Terima kasih Kak Bima! Pembayaran deposit Rp 200.000 telah kami verifikasi otomatis.",
          ],
        },
      ],
    },
  ];
}

function salonConversations(): ChatConversation[] {
  return clinicConversations().map((item) => {
    if (item.id === "sarah") {
      return {
        ...item,
        extraBadge: "Balayage",
        notesAuthor: "Mira's Note",
        notes:
          "Prefers afternoon chairs (14.00 - 16.00). Fine hair, avoid high-lift bleach on the crown. Usually drinks chamomile tea.",
        booking: {
          service: "Balayage & Hair Treatment",
          practitioner: "Mira • Chair 2",
          schedule: "Tomorrow, Sep 11 • 14:00 WIB",
          deposit: "Rp 200.000",
          paid: true,
        },
        tags: ["Returning Client", "Color", "High Intent", "WhatsApp Primary"],
        messages: item.messages.map((message) => {
          if (message.kind === "customer" && message.id === "m1") {
            return {
              ...message,
              text: "Hi kak, saya mau booking balayage untuk besok siang. Stylist Mira masih ada slot?",
            };
          }
          if (message.kind === "ai" && message.id === "m2") {
            return {
              ...message,
              paragraphs: [
                "Halo Kak Sarah! Tentu.",
                "Untuk besok, Mira di Chair 2 tersedia di 2 slot siang:",
              ],
              slots: [
                "Pukul 11.00 WIB (Balayage & Hair Treatment)",
                "Pukul 14.00 WIB (Balayage & Hair Treatment)",
              ],
            };
          }
          if (message.kind === "ai" && message.id === "m4") {
            return {
              ...message,
              paragraphs: [
                "Masih tersedia, Kak Sarah! Slot langsung kami tahan selama 15 menit.",
                "Boleh kami kunci jadwalnya atas nama Kak Sarah Wijaya untuk Balayage besok pukul 14.00 WIB?",
              ],
            };
          }
          if (message.kind === "system") {
            return {
              ...message,
              service: "Balayage & Hair Treatment",
              practitioner: "Mira (Chair 2)",
              href: "/admin/salon/appointments",
            };
          }
          if (message.kind === "ai" && message.id === "m7") {
            return {
              ...message,
              paragraphs: [
                "Reservasi Kak Sarah sudah terkonfirmasi!",
                "Kami telah mengirimkan kartu pengingat ke WhatsApp ini. Sampai bertemu besok jam 14.00 WIB ya Kak!",
              ],
            };
          }
          return message;
        }),
      };
    }

    if (item.id === "andi") {
      return {
        ...item,
        preview: "Stylist-nya tersedia jam 15.00 sore ini?",
        extraBadge: "Raka",
        notesAuthor: "Front Desk",
        notes: "Asked for a same-day cut. Confirm Raka overtime before locking the chair.",
        messages: item.messages.map((message) => {
          if (message.kind === "customer") {
            return {
              ...message,
              text: "Halo kak, stylist-nya tersedia jam 15.00 sore ini?",
            };
          }
          if (message.kind === "ai") {
            return {
              ...message,
              paragraphs: [
                "Halo Kak Andi. Jam 15.00 hari ini untuk Raka sedang kami cek ke roster salon.",
                "Mohon tunggu sebentar, staf kami akan konfirmasi ketersediaan overtime-nya.",
              ],
            };
          }
          return message;
        }),
      };
    }

    return {
      ...item,
      extraBadge:
        item.extraBadge === "Pico Laser"
          ? "Keratin"
          : item.extraBadge === "Dr. Kevin"
            ? "Raka"
            : item.extraBadge,
      booking: item.booking
        ? {
            ...item.booking,
            practitioner: item.booking.practitioner
              .replace("Dr. Kevin • Suite 1", "Raka • Chair 1")
              .replace("Dr. Sarah Sp.KK • Suite 2", "Mira • Chair 2")
              .replace("Dr. Kevin • Laser Suite 1", "Raka • Chair 3"),
            service: item.booking.service
              .replace("Pico Laser", "Keratin Treatment")
              .replace("Laser Inquiry", "Hair Spa")
              .replace("Acne Scar Subcision & PRP", "Premium Haircut"),
          }
        : undefined,
    };
  });
}

function fnbConversations(): ChatConversation[] {
  return [
    {
      id: "sarah",
      name: "Sarah Wijaya",
      initials: "SW",
      phone: "+62 812-3490-8821",
      channel: "whatsapp",
      time: "10:42 AM",
      preview: "Boleh kak. Reservasi besok jam 14.00 ya.",
      unread: 2,
      assignedToMe: true,
      aiActive: true,
      needsAction: false,
      vip: true,
      since: "Guest since Aug 2026",
      online: true,
      status: "auto-booked",
      statusBadge: { label: "AI Auto-Booked", tone: "primary", pulse: true },
      extraBadge: "Dinner for 2",
      tags: ["Returning Guest", "Window Seat", "WhatsApp Primary"],
      lifetimeVisits: "8 Visits",
      lifetimeValue: "Rp 4.20M",
      notesAuthor: "Host Note",
      notes: "Prefers window tables after 14.00. Usually orders the set lunch and chamomile tea.",
      booking: {
        service: "Lunch Set for 2",
        practitioner: "Host Andira • Table 12",
        schedule: "Tomorrow, Sep 11 • 14:00 WIB",
        deposit: "Rp 200.000",
        paid: true,
      },
      messages: [
        { id: "d1", kind: "date", label: "Today, September 10, 2026" },
        {
          id: "m1",
          kind: "customer",
          name: "Sarah Wijaya",
          initials: "SW",
          time: "10:40 AM",
          text: "Hi kak, saya mau reservasi meja untuk 2 orang besok siang. Masih ada window seat?",
        },
        {
          id: "m2",
          kind: "ai",
          time: "10:40 AM",
          latency: "1.1s",
          paragraphs: [
            "Halo Kak Sarah! Tentu.",
            "Untuk besok, window seat masih tersedia di 2 slot siang:",
          ],
          slots: ["Pukul 11.00 WIB (Table 8)", "Pukul 14.00 WIB (Table 12)"],
          closing: "Kak Sarah ingin kami reservasikan jam berapa?",
        },
        {
          id: "m3",
          kind: "customer",
          name: "Sarah Wijaya",
          initials: "SW",
          time: "10:41 AM",
          text: "Kalau jam 2 siang (14:00) masih tersedia ya kak?",
        },
        {
          id: "m4",
          kind: "ai",
          time: "10:41 AM",
          latency: "0.9s",
          paragraphs: [
            "Masih tersedia, Kak Sarah! Meja 12 kami tahan 15 menit.",
            "Boleh kami kunci reservasi atas nama Kak Sarah Wijaya untuk 2 orang besok pukul 14.00 WIB?",
          ],
        },
        {
          id: "m5",
          kind: "customer",
          name: "Sarah Wijaya",
          initials: "SW",
          time: "10:42 AM",
          text: "Boleh kak, tolong di-booking ya.",
        },
        {
          id: "m6",
          kind: "system",
          time: "10:42 AM",
          title: "Reservation Confirmed & Created",
          service: "Lunch Set for 2",
          practitioner: "Host Andira (Table 12)",
          schedule: "Tomorrow, Sep 11 • 14:00 WIB",
          bookingId: "#RSV-8821",
          extra: "Deposit QRIS Verified",
          href: "/admin/fnb/reservations",
        },
        {
          id: "m7",
          kind: "ai",
          time: "10:42 AM",
          latency: "1.2s",
          paragraphs: [
            "Reservasi Kak Sarah sudah terkonfirmasi!",
            "Pengingat sudah kami kirim ke WhatsApp ini. Sampai bertemu besok jam 14.00 WIB ya Kak!",
          ],
        },
      ],
    },
    ...clinicConversations()
      .slice(1)
      .map((item) => ({
        ...item,
        extraBadge: item.extraBadge === "Dr. Kevin" ? "Host Bima" : item.extraBadge,
      })),
  ];
}

export function getChatCopy(variant: "clinic" | "salon" | "fnb"): ChatCopy {
  if (variant === "salon") {
    return salonCopy();
  }

  if (variant === "fnb") {
    return fnbCopy();
  }

  return clinicCopy();
}

export function getChatWorkspaceData(
  variant: "clinic" | "salon" | "fnb",
): ChatWorkspaceData {
  if (variant === "salon") {
    return {
      copy: salonCopy(),
      activeCount: 32,
      conversations: salonConversations(),
    };
  }

  if (variant === "fnb") {
    return {
      copy: fnbCopy(),
      activeCount: 18,
      conversations: fnbConversations(),
    };
  }

  return {
    copy: clinicCopy(),
    activeCount: 32,
    conversations: clinicConversations(),
  };
}
