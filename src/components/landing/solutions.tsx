"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { landingPage } from "@/data/landing-page";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/landing/section-heading";
import { CountUp, Stagger, StaggerItem } from "@/components/landing/motion";

const badgeTones = {
  emerald: {
    badge: "bg-success/15 text-success border-success/25",
    glow: "from-success/35 via-transparent to-transparent",
    icon: "bg-success text-white",
  },
  teal: {
    badge: "bg-primary/15 text-primary-dark border-primary/25",
    glow: "from-primary/35 via-transparent to-transparent",
    icon: "bg-primary text-white",
  },
  amber: {
    badge: "bg-warning/15 text-warning border-warning/25",
    glow: "from-warning/35 via-transparent to-transparent",
    icon: "bg-warning text-white",
  },
  blue: {
    badge: "bg-info/15 text-info border-info/25",
    glow: "from-info/35 via-transparent to-transparent",
    icon: "bg-info text-white",
  },
};

export function Solutions() {
  const { solutions } = landingPage;

  return (
    <section
      id={solutions.id}
      className="relative w-full overflow-hidden border-y border-outline-variant bg-background py-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 18%, rgba(134,187,81,0.12), transparent 30%), radial-gradient(circle at 88% 72%, rgba(45,52,120,0.1), transparent 28%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-5 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow={solutions.eyebrow}
            title={solutions.title}
            description={solutions.description}
            className="mb-0 max-w-2xl"
          />
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="inline-flex items-center gap-2 self-start rounded-full border border-secondary/20 bg-white px-3 py-1.5 font-mono text-[11px] font-semibold text-secondary shadow-xs"
          >
            <Icon name="domain" className="text-sm" />
            {solutions.cards.length} industries live
          </motion.div>
        </div>

        <Stagger className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          {solutions.cards.map((card, index) => {
            const tone = badgeTones[card.badgeTone];

            return (
              <StaggerItem key={card.title}>
                <motion.article
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="group relative flex h-[400px] flex-col justify-end overflow-hidden rounded-3xl border border-outline-variant shadow-[0_24px_60px_-36px_rgba(32,38,92,0.45)]"
                >
                  <Image
                    src={card.image}
                    alt={card.imageAlt}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-linear-to-t from-secondary-dark via-secondary-dark/55 to-secondary-dark/10" />
                  <div
                    className={`pointer-events-none absolute inset-0 bg-linear-to-br ${tone.glow} opacity-80`}
                  />

                  <div className="absolute top-5 left-5 right-5 z-10 flex items-start justify-between gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider text-white uppercase backdrop-blur-md">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full ${tone.icon}`}
                      >
                        <Icon name={card.icon} className="text-[14px]" />
                      </span>
                      Industry 0{index + 1}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold backdrop-blur-md ${tone.badge}`}
                    >
                      <CountUp value={card.badge} />
                    </span>
                  </div>

                  <div className="relative z-10 p-5 sm:p-6">
                    <div className="rounded-2xl border border-white/25 bg-white/95 p-4 shadow-xl backdrop-blur-xl">
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="text-base font-bold tracking-tight text-on-surface sm:text-lg">
                          {card.title}
                        </h3>
                      </div>
                      <p className="mb-3 text-xs leading-relaxed text-on-surface-variant sm:text-sm">
                        {card.description}
                      </p>
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-mono text-[11px]">
                        <span className="text-on-surface-variant">
                          {card.metaLabel}
                        </span>
                        <span className="inline-flex items-center gap-1 font-bold text-success">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
                          </span>
                          {card.metaValue}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
