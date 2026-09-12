"use client";

import { motion } from "framer-motion";
import { landingPage } from "@/data/landing-page";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/landing/section-heading";
import { Reveal, Stagger, StaggerItem } from "@/components/landing/motion";

const accents = {
  green: {
    glow: "from-primary/20 via-primary/5 to-transparent",
    badge: "bg-primary/10 text-primary-dark border-primary/20",
    icon: "bg-primary text-white shadow-[0_12px_28px_-12px_rgba(101,147,58,0.8)]",
    frame: "border-primary/20 bg-linear-to-br from-primary/8 via-white to-white",
  },
  navy: {
    glow: "from-secondary/20 via-secondary/5 to-transparent",
    badge: "bg-secondary/10 text-secondary border-secondary/20",
    icon: "bg-secondary text-white shadow-[0_12px_28px_-12px_rgba(45,52,120,0.75)]",
    frame:
      "border-secondary/20 bg-linear-to-br from-secondary/8 via-white to-white",
  },
  teal: {
    glow: "from-info/20 via-info/5 to-transparent",
    badge: "bg-info/10 text-info border-info/20",
    icon: "bg-info text-white shadow-[0_12px_28px_-12px_rgba(75,123,197,0.75)]",
    frame: "border-info/20 bg-linear-to-br from-info/8 via-white to-white",
  },
};

export function Features() {
  const { features } = landingPage;

  return (
    <section
      id={features.id}
      className="relative w-full overflow-hidden bg-white py-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 10%, rgba(134,187,81,0.1), transparent 28%), radial-gradient(circle at 90% 60%, rgba(45,52,120,0.08), transparent 30%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={features.eyebrow}
          title={features.title}
          description={features.description}
          className="mb-14"
        />

        <div className="space-y-8 lg:space-y-10">
          {features.modules.map((module, index) => {
            const palette = accents[module.accent];

            return (
              <Reveal key={module.module} delay={index * 0.05}>
                <motion.article
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="relative overflow-hidden rounded-3xl border border-outline-variant bg-white shadow-[0_20px_50px_-36px_rgba(32,38,92,0.35)]"
                >
                  <div
                    className={`pointer-events-none absolute inset-0 bg-linear-to-br ${palette.glow}`}
                  />

                  <div className="relative grid grid-cols-1 items-stretch gap-0 lg:grid-cols-12">
                    <div
                      className={`flex flex-col justify-center p-6 sm:p-8 lg:col-span-5 ${
                        module.reverse ? "order-1 lg:order-2" : ""
                      }`}
                    >
                      <div className="mb-4 flex items-center gap-3">
                        <span
                          className={`flex h-11 w-11 items-center justify-center rounded-xl ${palette.icon}`}
                        >
                          <Icon name={module.icon} className="text-2xl" />
                        </span>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase ${palette.badge}`}
                        >
                          {module.module}
                        </span>
                      </div>

                      <h3 className="mb-2 text-2xl font-bold tracking-tight text-on-surface sm:text-[28px]">
                        {module.title}
                      </h3>
                      <p className="mb-5 max-w-md text-sm leading-relaxed text-on-surface-variant">
                        {module.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {module.stats.map((stat) => (
                          <span
                            key={stat.label}
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[11px] ${
                              stat.accent
                                ? "border-success/25 bg-success/10 text-success"
                                : "border-outline-variant bg-surface-container-low text-on-surface-variant"
                            }`}
                          >
                            <Icon name={stat.icon} className="text-sm" />
                            {stat.label}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div
                      className={`relative border-outline-variant p-5 sm:p-6 lg:col-span-7 ${
                        module.reverse
                          ? "order-2 border-t lg:order-1 lg:border-t-0 lg:border-r"
                          : "border-t lg:border-t-0 lg:border-l"
                      } ${palette.frame} ${
                        module.kind === "pipeline" ? "overflow-x-auto" : ""
                      }`}
                    >
                      <div className="mb-3 flex items-center justify-between font-mono text-[10px] text-on-surface-variant">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
                          Live preview
                        </span>
                        <span>DIUK · {module.kind}</span>
                      </div>

                      {module.kind === "chat" ? <ChatPreview /> : null}
                      {module.kind === "calendar" ? <CalendarPreview /> : null}
                      {module.kind === "pipeline" ? <PipelinePreview /> : null}
                    </div>
                  </div>
                </motion.article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ChatPreview() {
  return (
    <Stagger fast className="space-y-3 font-sans text-xs">
      <StaggerItem className="max-w-[82%] rounded-2xl rounded-tl-md border border-outline-variant bg-white p-3.5 shadow-xs">
        <span className="mb-1 block font-mono text-[9px] text-gray-400">
          Customer · WhatsApp
        </span>
        <p className="leading-relaxed text-on-surface">
          &quot;min, bisa booked besok buat facial acne ga? harganya brpan
          skrg?&quot;
        </p>
      </StaggerItem>

      <StaggerItem className="ml-auto max-w-[88%] rounded-2xl rounded-tr-md border border-primary/25 bg-primary/10 p-3.5 shadow-xs">
        <div className="mb-1.5 flex items-center justify-between font-mono text-[9px] text-primary-dark">
          <span className="inline-flex items-center gap-1 font-bold">
            <Icon name="smart_toy" className="text-[12px]" />
            DIUK Auto-Agent
          </span>
          <span>1.2s · 14:20</span>
        </div>
        <p className="leading-relaxed text-on-surface">
          &quot;Bisa banget kak! Untuk Facial Acne besok ada promo Rp 280.000
          (diskon 20%). Slot ready jam 11:00, 14:00, dan 16:30 di Senopati. Mau
          disimpankan jam berapa kak?&quot;
        </p>
        <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-primary/20 pt-2">
          {["11:00", "14:00", "16:30"].map((slot) => (
            <span
              key={slot}
              className="rounded-md bg-primary px-2 py-0.5 text-[10px] font-semibold text-white"
            >
              {slot}
            </span>
          ))}
        </div>
      </StaggerItem>
    </Stagger>
  );
}

function CalendarPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className="space-y-3 rounded-2xl border border-outline-variant bg-white p-4 font-mono text-xs shadow-xs"
    >
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div>
          <span className="mb-0.5 block text-[10px] text-gray-400">
            Reservation ticket
          </span>
          <span className="font-bold text-on-surface">
            Barber Booking Confirmed
          </span>
        </div>
        <motion.span
          className="rounded-full bg-success/15 px-2.5 py-1 text-[10px] font-bold text-success"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          STATUS: CONFIRMED
        </motion.span>
      </div>

      <div className="grid grid-cols-2 gap-3 font-sans text-[11px]">
        {[
          { label: "Service", value: "Haircut + Beard Styling" },
          { label: "Barber", value: "Yoga (Chair #2)" },
          { label: "Date & Time", value: "Saturday, 12 Sept • 14:00 WIB" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-outline-variant bg-surface-container-low/70 p-2.5"
          >
            <span className="mb-1 block font-mono text-[10px] text-gray-400">
              {item.label}
            </span>
            <span className="font-semibold text-on-surface">{item.value}</span>
          </div>
        ))}
        <div className="rounded-xl border border-success/20 bg-success/10 p-2.5">
          <span className="mb-1 block font-mono text-[10px] text-success/80">
            Sync Hook
          </span>
          <span className="flex items-center gap-1 font-semibold text-success">
            <Icon name="check_circle" className="text-[14px]" />
            Google Cal Synced
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function PipelinePreview() {
  const columns = [
    {
      title: "New Lead (8)",
      titleClass: "text-gray-400",
      cardClass: "bg-surface-container-low border-gray-100",
      name: "Dewi Lestari",
      detail: "Inquiry: Bridal",
      detailClass: "text-gray-500",
    },
    {
      title: "Qualified (5)",
      titleClass: "text-info",
      cardClass: "bg-info/10 border-info/20",
      name: "Rian K.",
      detail: "Rp 850.000",
      detailClass: "text-info",
    },
    {
      title: "Follow-up (3)",
      titleClass: "text-warning",
      cardClass: "bg-warning/10 border-warning/20",
      name: "Sari W.",
      detail: "Sent QRIS",
      detailClass: "text-warning",
    },
    {
      title: "Converted (14)",
      titleClass: "text-success",
      cardClass: "bg-success/10 border-success/20",
      name: "Farhan Z.",
      detail: "Rp 1.450.000",
      detailClass: "text-success font-bold",
    },
  ];

  return (
    <Stagger
      fast
      className="flex min-w-[520px] gap-2.5 font-mono text-xs"
    >
      {columns.map((column, index) => (
        <StaggerItem
          key={column.title}
          className="flex-1 rounded-xl border border-outline-variant bg-white p-2.5 shadow-xs"
        >
          <span
            className={`mb-2 block text-[10px] font-bold uppercase ${column.titleClass}`}
          >
            {column.title}
          </span>
          <motion.div
            className={`rounded-lg border p-2.5 font-sans text-[11px] ${column.cardClass}`}
            whileHover={{ y: -2 }}
          >
            <p className="font-bold text-on-surface">{column.name}</p>
            <span className={`font-mono text-[10px] ${column.detailClass}`}>
              {column.detail}
            </span>
          </motion.div>
          {index < columns.length - 1 ? (
            <div className="mt-2 flex justify-end">
              <Icon
                name="arrow_forward"
                className="text-[12px] text-outline-variant"
              />
            </div>
          ) : null}
        </StaggerItem>
      ))}
    </Stagger>
  );
}
