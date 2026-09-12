"use client";

import { landingPage } from "@/data/landing-page";
import { Icon } from "@/components/ui/icon";
import { Reveal, Stagger, StaggerItem } from "@/components/landing/motion";

export function TrustBar() {
  const { trust } = landingPage;

  return (
    <section className="w-full border-y border-outline-variant bg-white py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal y={12}>
          <p className="mb-4 text-center font-mono text-xs text-on-surface-variant uppercase tracking-wider">
            {trust.label}
          </p>
        </Reveal>
        <Stagger
          fast
          className="flex flex-wrap items-center justify-center gap-2 font-mono text-xs sm:gap-3"
        >
          {trust.industries.map((item) => (
            <StaggerItem
              key={item.label}
              className="flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container px-3 py-1.5 text-on-surface"
            >
              <Icon name={item.icon} className="text-[15px] text-primary-dark" />
              {item.label}
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
