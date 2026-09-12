"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { landingPage } from "@/data/landing-page";
import { Icon } from "@/components/ui/icon";

export function BrandsMarquee() {
  const { brands } = landingPage;
  const track = [
    ...brands.logos,
    ...brands.logos,
    ...brands.logos,
    ...brands.logos,
    ...brands.logos,
    ...brands.logos,
  ];

  return (
    <section className="relative z-20 w-full overflow-hidden border-y border-outline-variant bg-linear-to-b from-white via-surface-container-low/40 to-white py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(134,187,81,0.12), transparent 40%), radial-gradient(circle at 80% 40%, rgba(45,52,120,0.1), transparent 38%)",
        }}
      />

      <div className="relative mx-auto mb-8 max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex flex-col items-center gap-2"
        >
          {/* <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 font-mono text-[10px] font-bold tracking-wider text-primary-dark uppercase">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Trusted partners
          </span> */}
          <p className="text-sm font-semibold text-on-surface sm:text-base">
            {brands.label}
          </p>
        </motion.div>
      </div>

      <div className="relative space-y-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-white via-white/80 to-transparent sm:w-28" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-white via-white/80 to-transparent sm:w-28" />

        <MarqueeRow items={track} speedClass="animate-brands-marquee" />
        <MarqueeRow
          items={[...track].reverse()}
          speedClass="animate-brands-marquee-reverse"
        />      </div>
    </section>
  );
}

function MarqueeRow({
  items,
  speedClass,
}: {
  items: { name: string; src: string }[];
  speedClass: string;
}) {
  return (
    <div
      className={`flex w-max items-center gap-4 hover:[animation-play-state:paused] sm:gap-5 ${speedClass}`}
    >
      {items.map((logo, index) => (
        <div
          key={`${logo.name}-${speedClass}-${index}`}
          className="group flex h-[88px] w-[210px] shrink-0 items-center gap-3 rounded-2xl border border-outline-variant bg-white/90 px-4 shadow-xs backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md"
        >
          <div className="flex h-full w-full shrink-0 items-center justify-center overflow-hidden rounded-xl  ">
            <Image
              src={logo.src}
              alt={logo.name}
              width={100}
              height={100}
              unoptimized
              className="h-full w-full object-contain"
            />
          </div>
          {/* <div className="min-w-0 text-left">
            <p className="truncate text-sm font-bold text-on-surface">{logo.name}</p>
            <p className="flex items-center gap-1 font-mono text-[10px] text-primary-dark">
              <Icon name="verified" className="text-[12px]" />
              DIUK partner
            </p>
          </div> */}
        </div>
      ))}
    </div>
  );
}
