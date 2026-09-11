export const landingPage = {
  header: {
    logo: {
      src: "/logo.png",
      alt: "DIUK Solution Logo",
      href: "#",
    },
    navItems: [
      { label: "Product", href: "#product" },
      { label: "Solutions", href: "#solutions" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
    ],
    login: { label: "Login", href: "/login" },
    cta: { label: "Get Started", href: "#pricing" },
  },
  hero: {
    badge: "DIUK Engine 2.0 • Conversational Commerce",
    headline: "Turn Every Customer Conversation Into a",
    headlineAccent: "Transaction.",
    subtitle:
      "AI-powered customer conversations, sales, and reservations for growing businesses.",
    primaryCta: { label: "Get Started", href: "#pricing" },
    secondaryCta: { label: "See How It Works", href: "#how-it-works" },
    footnote: "Built for businesses that run on customer conversations.",
    simulation: {
      title: "diuk.network/senopati-node // Live Dispatch",
      latency: "1.1s latency",
      version: "v2.4-stable",
    },
  },
  trust: {
    label: "Built for businesses that run on customer conversations",
    industries: [
      { icon: "spa", label: "Beauty & Aesthetic Clinics" },
      { icon: "content_cut", label: "Modern Barbershops" },
      { icon: "restaurant", label: "Bistros & Dining" },
      { icon: "fitness_center", label: "Boutique Fitness Studios" },
      { icon: "hotel", label: "Hospitality & Resorts" },
      { icon: "calendar_month", label: "Appointment Services" },
    ],
  },
  problem: {
    eyebrow: "The Operational Leak",
    title: "Every missed conversation is a missed opportunity.",
    description: "When customer messages slip away, revenue does too.",
    cards: [
      {
        icon: "timer",
        tone: "red" as const,
        title: "Slow Replies",
        description: "Customers don't wait forever.",
        metric: "34m Average Lag",
        badge: "68% Drop-off",
        note: "Competitor answered in 2 minutes.",
        barWidth: "82%",
      },
      {
        icon: "mark_chat_unread",
        tone: "amber" as const,
        title: "Lost Leads",
        description: "Important conversations disappear in the inbox.",
        inboxLabel: "Unread WhatsApp Inbox",
        unread: "+180 unread",
        revenueLabel: "Estimated uncaptured revenue:",
        revenue: "~Rp 14.500.000",
      },
      {
        icon: "event_busy",
        tone: "blue" as const,
        title: "Manual Booking",
        description: "Your team spends hours handling repetitive reservations.",
        alert: "Conflict Detected",
        badge: "Double-booked",
        sheet: "Sheet: Row 42 vs Row 87",
        conflict: "Saturday 14:00 - Stylist Yoga (2 Clients)",
      },
    ],
  },
  workflow: {
    id: "how-it-works",
    eyebrow: "Automated Pipeline",
    title: "One conversation. From inquiry to transaction.",
    description: "How DIUK bridges messaging apps directly to your operations.",
    steps: [
      {
        step: "01 / INBOUND",
        label: "Customer Message",
        highlight: false,
        lines: [
          { kind: "meta" as const, text: "WhatsApp Message" },
          {
            kind: "body" as const,
            text: '"Mau reservasi table untuk 4 orang besok malam jam 19:00"',
          },
        ],
      },
      {
        step: "02 / NLP ENGINE",
        label: "AI Response",
        highlight: false,
        lines: [
          { kind: "success" as const, text: "Party: 4 guests" },
          { kind: "body" as const, text: "Time: Tomorrow 19:00" },
          { kind: "meta" as const, text: "NLP Latency: 0.8s" },
        ],
      },
      {
        step: "03 / CRM PROFILE",
        label: "Lead Captured",
        highlight: false,
        lines: [
          { kind: "strong" as const, text: "VIP Lead matched" },
          { kind: "meta" as const, text: "LTV: Rp 8.400.000" },
          { kind: "chip" as const, text: "Prefers Window Table" },
        ],
      },
      {
        step: "04 / RESERVATION",
        label: "Reservation Confirmed",
        highlight: false,
        lines: [
          { kind: "success" as const, text: "Slot locked: Table 12" },
          { kind: "body" as const, text: "QRIS Deposit: Sent" },
          { kind: "chip-success" as const, text: "Verified 100%" },
        ],
      },
      {
        step: "05 / OPERATIONS",
        label: "CRM & Staff Synced",
        highlight: true,
        lines: [
          { kind: "strong" as const, text: "Kitchen & Floor Synced" },
          { kind: "meta" as const, text: "Table #12 prepped" },
          { kind: "chip-invert" as const, text: "Webhook Fired" },
        ],
      },
    ],
  },
  features: {
    id: "product",
    eyebrow: "Product Capabilities",
    title: "Everything your team needs to turn conversations into growth.",
    description:
      "Engineered for high-volume conversational commerce and appointment businesses.",
    modules: [
      {
        module: "Module 01",
        title: "AI Customer Service",
        description:
          "Handles Indonesian slang, colloquial questions, pricing, and operating hours instantly. No rigid decision trees.",
        stats: [
          { icon: "bolt", label: "1.2s auto-reply", accent: true },
          { icon: "translate", label: "Bahasa Gaul + Formal", accent: false },
        ],
        reverse: false,
        kind: "chat" as const,
      },
      {
        module: "Module 02",
        title: "Smart Reservation & Calendar",
        description:
          "Locks schedules in real-time. Automatically checks practitioner rosters, rooms, and chairs to eliminate overbooking completely.",
        stats: [
          { icon: "sync", label: "2-way Google Cal", accent: true },
          {
            icon: "notifications",
            label: "Auto WhatsApp Reminders",
            accent: false,
          },
        ],
        reverse: true,
        kind: "calendar" as const,
      },
      {
        module: "Module 03",
        title: "Lead Pipeline & Conversational CRM",
        description:
          "Watch raw conversations transition into structured revenue. Leads move automatically across the sales stages with transaction tags.",
        stats: [
          { icon: "filter_alt", label: "Auto-tagging", accent: true },
          { icon: "payments", label: "Realized IDR values", accent: false },
        ],
        reverse: false,
        kind: "pipeline" as const,
      },
    ],
  },
  solutions: {
    id: "solutions",
    eyebrow: "Industry Solutions",
    title: "Built around how your business works.",
    description:
      "Different businesses. Different conversations. One intelligent platform.",
    cards: [
      {
        icon: "spa",
        title: "Beauty & Aesthetic Clinics",
        badge: "+41% Utilization",
        badgeTone: "emerald" as const,
        description:
          "Turn inquiries into confirmed doctor appointments & treatments.",
        metaLabel: "WA Booking Confirmation:",
        metaValue: "dr. Nadia (16:00 Locked)",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAIFzL-5KEq_fiiuk0IyTEP-8KDHDFSGPRFGzpHr6kA8cQAG1xcz428y9JcaJJ0nXX2fy7MwvJdpE5Iwn1chfV6VK5ImXWNau8QWTWne_E14dMFW9X-KSMMjVSXsS-26Fy_Tz0CPlqAyS-hyLdjtNo-logeZyDB3zDMGvS7iZ6fgcxj_fbrehjcpA_x3XZm9P8l8wKLSKXjeFb0pH9XrE0mBvYrDvl3i6sNDl6Zwwy6XUpCHXllyqmu",
        imageAlt: "Modern luxury aesthetic beauty clinic interior",
      },
      {
        icon: "content_cut",
        title: "Modern Barbershops",
        badge: "Zero Overbooking",
        badgeTone: "teal" as const,
        description: "Zero missed chair slots during busy weekend peak hours.",
        metaLabel: "Barber Availability:",
        metaValue: "Yoga • Chair 2 Available",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAyZrBuA8kgkRoA0HkcxMWaWmKyc7y7YlZqwjOsKrZzaIgXksFtsSwut-VoMM9FuGmNMFvY2ulYVuaRuPzEx05S3zTM9_iqh38auHhbSZ-gBT_7FluDlbIm44AzQ4Re1tAbgXGrQUoPwGP_U7-ztg94q2tGPVTjk2wV8IWC8wOj6qPIUO_A2e5n5_3X7xFZvsHqlVCgRX45QRC5GliT38T1VYxrFu-OtkBWq-2e3XmHTXBjVvzztwD-",
        imageAlt: "Upscale modern barbershop interior",
      },
      {
        icon: "restaurant",
        title: "Bistros & Dining",
        badge: "Auto-Deposit",
        badgeTone: "amber" as const,
        description:
          "Automated table reservations & dietary notes via WhatsApp.",
        metaLabel: "Table #12 (4 Pax):",
        metaValue: "QRIS DP Confirmed Rp 200k",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCF6wmwmzovOZVAjNr-XfdwJfAycUoQiC6Q21nYck3PFfqjolWKAZFMXMPLs-tYC1RzkpPZv7CJEd-OKhnI4gL6tGIn-Eh2eFf4v9owxv0zXECG5Jcy94iQOT1XCuauQh3ue7y_kPbd9YdzdrGSpVpajZTYO4ZUHg9QzXPaGtAWXYDrOF8uCfxGPX1BYmFhwSi-_pHiY6CaTK12cBxCVx8hLD8J0zwEx9R6bm8YVy7dSegqKjKWkY7j",
        imageAlt: "Contemporary chic bistro restaurant dining area",
      },
      {
        icon: "sports_gymnastics",
        title: "Gyms & Studios",
        badge: "+28% Renewals",
        badgeTone: "blue" as const,
        description: "Class bookings & membership renewals directly on WhatsApp.",
        metaLabel: "Reformer Pilates:",
        metaValue: "Trainer Maya (3 Slots Left)",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAbFwgZGQWV_rJdBgcJhCS3TgxoPca0gO2l1J7QBsBWQ-l3oGWqzoCz0tFEN_IeEAJnBFv8xwgtlWvE0zPPFjj5mCWjSFJShUa_9mhjQnTiI-Va4zFtnpl4ktfnrDJbroDrF79nY2aG9XFwFrLmGU3dA2XZx6pBv3RWc9yx6tSQWTr0KKVyhLs2eB6P-xoYT1pJEw3IWtvXlhzZPSCriotXb2r4zUKbej1uOti-iK-Qkjlp6e85_Q5P",
        imageAlt: "High-end boutique fitness gym and pilates studio",
      },
    ],
  },
  dashboard: {
    eyebrow: "Operations Cockpit",
    title: "See what's happening across your customer conversations.",
    description: "Real-time command center for Indonesian business operations.",
    badges: ["Automated QRIS Settlements", "Zero-Lag Operator Handover"],
    metrics: [
      {
        label: "Total Conversations",
        value: "1,284",
        hint: "↑ +18.4% vs last mo",
        hintTone: "navy" as const,
      },
      {
        label: "New Qualified Leads",
        value: "342",
        hint: "↑ +22.1% velocity",
        hintTone: "navy" as const,
      },
      {
        label: "Confirmed Bookings",
        value: "186",
        hint: "98.4% show-up rate",
        hintTone: "navy" as const,
      },
      {
        label: "Conversion Rate",
        value: "24.8%",
        hint: "Benchmark: 9.2%",
        hintTone: "navy" as const,
      },
    ],
    gmv: {
      label: "GMV Processed (This Month)",
      value: "Rp 142.800.000",
      growth: "+34.2% Growth",
      weeks: [
        { label: "W1", height: "h-14", active: false },
        { label: "W2", height: "h-20", active: false },
        { label: "W3", height: "h-24", active: false },
        { label: "W4", height: "h-28", active: true },
      ],
    },
    activity: [
      {
        name: "Bima Saputra",
        detail: "Fade Cut • Senopati",
        value: "Rp 120k Paid",
        tone: "success" as const,
      },
      {
        name: "Clarissa Angela",
        detail: "Facial • QRIS Confirmed",
        value: "Rp 350k DP",
        tone: "success" as const,
      },
      {
        name: "Arya Pratama",
        detail: "Web Lead • Consultation",
        value: "Routed to Host",
        tone: "info" as const,
      },
    ],
  },
  impact: {
    eyebrow: "Proven Metrics",
    title: "Less manual work. More conversations. More transactions.",
    stats: [
      {
        value: "24/7",
        title: "Instant Response",
        description:
          "Customer conversations answered instantly across time zones without frontline fatigue.",
      },
      {
        value: "1 Platform",
        title: "Unified Operations",
        description:
          "One system for customer service, sales, reservations, and unified CRM.",
      },
      {
        value: "Zero Lag",
        title: "Automated Execution",
        description:
          "Repetitive inquiries, slot holds, and payment generation without human intervention.",
      },
    ],
  },
  testimonials: {
    eyebrow: "Customer Stories",
    title: "Trusted by growing businesses.",
    items: [
      {
        quoteBefore: "DIUK increased our confirmed appointments by ",
        quoteHighlight: "41% in our first month",
        quoteAfter:
          ". Front-desk staff no longer panic during lunch rush hours.",
        initials: "AP",
        name: "dr. Aris Pratama",
        role: "Director, Dermacare Senopati",
        tone: "teal" as const,
      },
      {
        quoteBefore: "Managing 5 barbershop branches on WhatsApp was chaos. DIUK handles our slot allocation ",
        quoteHighlight: "without a single double-booking error",
        quoteAfter: ".",
        initials: "KW",
        name: "Kevin Wibowo",
        role: "Founder, BarberKings Group",
        tone: "blue" as const,
      },
      {
        quoteBefore:
          "Guests book villa packages instantly with automated QRIS deposits. ",
        quoteHighlight: "It feels like having 5 extra receptionists",
        quoteAfter: " working 24/7.",
        initials: "NU",
        name: "Nadya Utami",
        role: "General Manager, Rimba Bali",
        tone: "emerald" as const,
      },
    ],
  },
  pricing: {
    id: "pricing",
    eyebrow: "Transparent Plans",
    title: "Start automating customer conversations today.",
    description: "Predictable flat plans. No hidden per-message markups.",
    plans: [
      {
        name: "Starter",
        description: "For single-location businesses moving beyond manual chats.",
        price: "Rp 499.000",
        period: "/ month",
        featured: false,
        cta: "Get Starter",
        features: [
          "1 WhatsApp Official Number",
          "Up to 1,500 AI conversations",
          "Basic Lead CRM & Contact Tags",
          "Google Calendar 1-Way Sync",
        ],
      },
      {
        name: "Growth",
        description:
          "For scaling clinics, salons, and hospitality with high chat volume.",
        price: "Rp 1.299.000",
        period: "/ month",
        featured: true,
        badge: "Most Popular",
        cta: "Start Free 14-Day Trial",
        features: [
          "WhatsApp + Instagram Direct Unified",
          "Up to 5,000 AI conversations",
          "Smart Reservation & Slot Allocation",
          "Automated H-2h Reminder & Follow-up",
          "Multi-Agent Human Handover",
        ],
      },
      {
        name: "Enterprise",
        description:
          "For multi-branch chains and high-velocity hospitality networks.",
        price: "Rp 3.499.000",
        period: "/ month",
        featured: false,
        cta: "Contact Enterprise Sales",
        features: [
          "Unlimited WhatsApp, IG & Web",
          "Custom AI Knowledge Training",
          "Multi-branch Central Command",
          "Custom POS & ERP Webhooks",
          "Dedicated Account Manager & 99.8% SLA",
        ],
      },
    ],
  },
  cta: {
    eyebrow: "Automate Now",
    title: "Your next customer is already in the conversation.",
    description:
      "Let DIUK handle the conversation so your team can focus on in-store hospitality.",
    primaryCta: { label: "Start with DIUK", href: "#pricing" },
    secondaryCta: { label: "Schedule 1-on-1 Consultation", href: "#pricing" },
  },
  footer: {
    description:
      "Conversational AI & business automation platform for Indonesian clinics, salons, bistros, and service businesses.",
    badge: "Proudly engineered for Indonesian UMKM & enterprise",
    columns: [
      {
        title: "Product",
        links: [
          { label: "AI Customer Service", href: "#product" },
          { label: "Smart Reservation", href: "#product" },
          { label: "Conversational CRM", href: "#product" },
          { label: "Dynamic QRIS Billing", href: "#product" },
        ],
      },
      {
        title: "Solutions",
        links: [
          { label: "Beauty Clinics", href: "#solutions" },
          { label: "Modern Barbershops", href: "#solutions" },
          { label: "Bistros & Dining", href: "#solutions" },
          { label: "Gyms & Fitness", href: "#solutions" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "Privacy Policy", href: "#" },
          { label: "Terms of Service", href: "#" },
          { label: "API Documentation", href: "#" },
          { label: "WhatsApp Partner SLA", href: "#" },
        ],
      },
    ],
    copyright: "© 2026 DIUK Solution. All rights reserved.",
    tagline: "Turning customer conversations into transactions.",
  },
} as const;

export default landingPage;
