"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { landingPage } from "@/data/landing-page";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/landing/section-heading";
import { Stagger, StaggerItem } from "@/components/landing/motion";

const tones = {
  red: {
    glow: "from-error/25 via-error/10 to-transparent",
    icon: "bg-error text-white shadow-[0_10px_24px_-10px_rgba(217,83,79,0.8)]",
    ring: "border-error/25",
    accent: "text-error",
    bar: "bg-error",
    chip: "bg-error/15 text-error",
  },
  amber: {
    glow: "from-warning/25 via-warning/10 to-transparent",
    icon: "bg-warning text-white shadow-[0_10px_24px_-10px_rgba(229,169,61,0.8)]",
    ring: "border-warning/30",
    accent: "text-warning",
    bar: "bg-warning",
    chip: "bg-warning/15 text-warning",
  },
  blue: {
    glow: "from-info/25 via-info/10 to-transparent",
    icon: "bg-info text-white shadow-[0_10px_24px_-10px_rgba(75,123,197,0.8)]",
    ring: "border-info/25",
    accent: "text-info",
    bar: "bg-info",
    chip: "bg-info/15 text-info",
  },
};

export function Problem() {
  const { problem } = landingPage;
  const [slow, lost, manual] = problem.cards;

  return (
    <section className="relative w-full overflow-hidden bg-secondary py-20 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 20%, rgba(217,83,79,0.22), transparent 32%), radial-gradient(circle at 88% 70%, rgba(134,187,81,0.12), transparent 30%), linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "auto, auto, 42px 42px, 42px 42px",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-black/20 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={problem.eyebrow}
          title={problem.title}
          description={problem.description}
          eyebrowClassName="text-error"
          inverted
          className="mb-12 max-w-2xl"
        />

        <Stagger className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          <StaggerItem>
            <ProblemCard
              tone={slow.tone}
              icon={slow.icon}
              title={slow.title}
              description={slow.description}
            >
              <div className="relative z-10 rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
                <div className="mb-2 flex items-center justify-between font-mono text-xs">
                  <span className="flex items-center gap-1 font-bold text-error">
                    <Icon name="schedule" className="text-sm" /> {slow.metric}
                  </span>
                  <span className="rounded bg-error/20 px-1.5 py-0.5 text-[10px] text-red-200">
                    {slow.badge}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-error"
                    initial={{ width: 0 }}
                    whileInView={{ width: slow.barWidth }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <p className="mt-2 font-mono text-[10px] text-white/55">{slow.note}</p>
              </div>
            </ProblemCard>
          </StaggerItem>

          <StaggerItem>
            <ProblemCard
              tone={lost.tone}
              icon={lost.icon}
              title={lost.title}
              description={lost.description}
            >
              <div className="relative z-10 rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-white/85">
                    {lost.inboxLabel}
                  </span>
                  <motion.span
                    className="rounded-full bg-error px-2 py-0.5 font-mono text-[10px] font-bold text-white shadow-xs"
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {lost.unread}
                  </motion.span>
                </div>
                <div className="flex items-center justify-between rounded border border-white/10 bg-secondary-dark/50 p-2.5 font-mono text-[11px] text-white/65">
                  <span>{lost.revenueLabel}</span>
                  <span className="font-bold text-error">{lost.revenue}</span>
                </div>
              </div>
            </ProblemCard>
          </StaggerItem>

          <StaggerItem>
            <ProblemCard
              tone={manual.tone}
              icon={manual.icon}
              title={manual.title}
              description={manual.description}
            >
              <div className="relative z-10 rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
                <div className="mb-1 flex items-center justify-between font-mono text-xs font-bold text-amber-200">
                  <span className="flex items-center gap-1">
                    <Icon name="warning" className="text-sm" /> {manual.alert}
                  </span>
                  <span className="rounded bg-warning/20 px-1.5 py-0.5 text-[10px] text-warning">
                    {manual.badge}
                  </span>
                </div>
                <div className="space-y-1 rounded border border-white/10 bg-secondary-dark/50 p-2.5 font-mono text-[10px]">
                  <p className="text-white/40">{manual.sheet}</p>
                  <p className="font-semibold text-error">{manual.conflict}</p>
                </div>
              </div>
            </ProblemCard>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}

function ProblemCard({
  tone,
  icon,
  title,
  description,
  children,
}: {
  tone: keyof typeof tones;
  icon: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const palette = tones[tone];

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className={`relative flex h-[340px] flex-col justify-between overflow-hidden rounded-2xl border bg-white/5 p-6 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.65)] backdrop-blur-md ${palette.ring}`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-linear-to-br ${palette.glow} opacity-90`}
      />
      <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/5 blur-2xl" />

      <div className="relative z-10">
        <div
          className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${palette.icon}`}
        >
          <Icon name={icon} className="text-2xl" />
        </div>
        <h3 className="mb-1.5 text-xl font-bold tracking-tight text-white">
          {title}
        </h3>
        <p className="text-sm text-white/65">{description}</p>
      </div>
      {children}
    </motion.div>
  );
}
