"use client";

import { landingPage } from "@/data/landing-page";
import { SectionHeading } from "@/components/landing/section-heading";
import { CountUp, Stagger, StaggerItem } from "@/components/landing/motion";

export function Impact() {
  const { impact } = landingPage;

  return (
    <section className="w-full border-y border-outline-variant bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={impact.eyebrow}
          title={impact.title}
          align="center"
          className="mx-auto mb-14 max-w-3xl text-center"
        />

        <Stagger className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {impact.stats.map((stat) => (
            <StaggerItem
              key={stat.title}
              className="flex flex-col justify-between rounded-2xl border border-outline-variant bg-surface-container-low p-8 text-center"
            >
              <div>
                <div className="mb-2 text-6xl font-bold tracking-tight text-primary-dark">
                  <CountUp value={stat.value} />
                </div>
                <h3 className="mb-2 text-lg font-bold text-on-surface">
                  {stat.title}
                </h3>
                <p className="text-sm text-on-surface-variant">
                  {stat.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
