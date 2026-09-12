"use client";

import { landingPage } from "@/data/landing-page";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/landing/section-heading";
import { Stagger, StaggerItem } from "@/components/landing/motion";
import { buildWhatsAppUrl } from "@/lib/landing/whatsapp";

export function Pricing() {
  const { pricing } = landingPage;

  return (
    <section
      id={pricing.id}
      className="w-full border-y border-outline-variant bg-white py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={pricing.eyebrow}
          title={pricing.title}
          description={pricing.description}
          align="center"
          className="mx-auto mb-12 max-w-3xl text-center"
        />

        <Stagger className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-8 lg:grid-cols-3">
          {pricing.plans.map((plan) => (
            <StaggerItem
              key={plan.name}
              className={`relative flex flex-col justify-between rounded-2xl p-6 sm:p-8 ${
                plan.featured
                  ? "border-2 border-primary bg-white shadow-xl lg:scale-[1.03]"
                  : "border border-outline-variant bg-surface-container-low"
              }`}
            >
              {plan.featured ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 font-mono text-[10px] font-bold tracking-wider text-white uppercase shadow-xs">
                  {plan.badge}
                </div>
              ) : null}
              <div>
                <span className="mb-1 block font-mono text-[10px] font-bold tracking-wider text-on-surface-variant uppercase">
                  {plan.category}
                </span>
                <h3 className="mb-1 text-lg font-bold text-on-surface">
                  {plan.name}
                </h3>
                <p className="mb-4 text-xs text-on-surface-variant">
                  {plan.description}
                </p>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-on-surface">
                    {plan.price}
                  </span>
                  <span className="font-mono text-xs text-on-surface-variant">
                    {plan.period}
                  </span>
                </div>
                <ul className="mb-6 space-y-2.5 font-sans text-xs text-on-surface">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Icon
                        name="check"
                        className="text-base text-primary-dark"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mb-8 rounded-lg border border-outline-variant bg-white px-3 py-2.5">
                  <span className="block font-mono text-[10px] text-on-surface-variant">
                    Setup fee
                  </span>
                  <span className="text-sm font-bold text-on-surface">
                    {plan.setupFee}
                  </span>
                </div>
              </div>
              <a
                href={buildWhatsAppUrl(plan.waMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className={`rounded-lg py-2.5 text-center text-xs font-semibold transition-all ${
                  plan.featured
                    ? "bg-primary text-white shadow-xs hover:bg-primary-dark"
                    : "border border-outline-variant bg-white text-on-surface hover:bg-surface-container"
                }`}
              >
                {plan.cta}
              </a>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
