"use client";

import { landingPage } from "@/data/landing-page";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/landing/motion";

export function Cta() {
  const { cta } = landingPage;

  return (
    <section className="relative w-full overflow-hidden bg-secondary py-20 text-white">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <span className="mb-2 block font-mono text-xs font-bold tracking-wider text-primary-light uppercase">
              {cta.eyebrow}
            </span>
            <h2 className="mb-4 text-3xl leading-tight font-bold tracking-tight sm:text-5xl">
              {cta.title}
            </h2>
            <p className="mb-8 max-w-xl text-base text-white/80">
              {cta.description}
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <a
                href={cta.primaryCta.href}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-dark sm:w-auto"
              >
                <span>{cta.primaryCta.label}</span>
                <Icon name="arrow_forward" className="text-base" />
              </a>
              <a
                href={cta.secondaryCta.href}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-secondary-light/50 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-secondary-light sm:w-auto"
              >
                <Icon name="calendar_today" className="text-base" />
                <span>{cta.secondaryCta.label}</span>
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="lg:col-span-5">
            <div className="rounded-2xl border border-primary/30 bg-white p-5 text-on-surface shadow-2xl">
              <div className="mb-3 flex items-center justify-between border-b border-border pb-3 font-mono text-xs">
                <span className="flex items-center gap-1.5 font-bold text-success">
                  <Icon name="check_circle" className="text-base" /> Verified
                  WhatsApp Business
                </span>
                <span className="text-text-muted">16:02 WIB</span>
              </div>
              <div className="space-y-2 font-sans text-xs">
                <p className="font-medium text-on-surface">
                  &quot;Terima kasih Kak Siti! Deposit reservasi telah diterima
                  via QRIS.&quot;
                </p>
                <div className="space-y-1 rounded-lg border border-outline-variant bg-surface-container-low p-3 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Booking:</span>
                    <span className="font-bold text-on-surface">
                      Acne Laser • Dr. Nadia
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Status:</span>
                    <span className="font-bold text-success">
                      PAID & LOCKED
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
