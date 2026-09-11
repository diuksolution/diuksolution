import { landingPage } from "@/data/landing-page";
import { Icon } from "@/components/ui/icon";

export function Hero() {
  const { hero } = landingPage;

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-background via-white to-surface-container-low/40 pt-12 pb-20">
      <div className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[360px] w-[850px] -translate-x-1/2 bg-gradient-to-tr from-primary-light/20 via-primary-light/40 to-transparent blur-3xl" />
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-outline-variant bg-white px-3 py-1 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="font-mono text-xs font-medium tracking-tight text-on-surface-variant">
            {hero.badge}
          </span>
        </div>

        <h1 className="mb-4 max-w-4xl text-4xl leading-[1.12] font-bold tracking-tight text-on-surface sm:text-5xl lg:text-[58px]">
          {hero.headline}{" "}
          <span className="text-primary-dark underline decoration-primary-light decoration-4 underline-offset-4">
            {hero.headlineAccent}
          </span>
        </h1>

        <p className="mb-8 max-w-2xl text-base text-on-surface-variant sm:text-lg">
          {hero.subtitle}
        </p>

        <div className="mb-4 flex w-full max-w-sm flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={hero.primaryCta.href}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark sm:w-auto"
          >
            <span>{hero.primaryCta.label}</span>
            <Icon name="arrow_forward" className="text-base" />
          </a>
          <a
            href={hero.secondaryCta.href}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant bg-white px-5 py-3 text-sm font-semibold text-on-surface shadow-xs transition-colors hover:bg-surface-container-low sm:w-auto"
          >
            <Icon name="play_circle" className="text-lg text-primary-dark" />
            <span>{hero.secondaryCta.label}</span>
          </a>
        </div>

        <p className="mb-12 font-mono text-xs text-on-surface-variant">
          {hero.footnote}
        </p>

        <HeroSimulation />
      </div>
    </section>
  );
}

function HeroSimulation() {
  const { simulation } = landingPage.hero;

  return (
    <div className="relative w-full max-w-6xl overflow-hidden rounded-2xl border border-outline-variant bg-white text-left shadow-2xl">
      <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-primary" />
          <span className="ml-2 font-mono text-xs font-medium text-on-surface-variant">
            {simulation.title}
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs text-on-surface-variant">
          <span className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-success">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
            {simulation.latency}
          </span>
          <span className="hidden rounded border border-outline-variant bg-white px-2 py-0.5 sm:inline">
            {simulation.version}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 divide-y divide-outline-variant lg:grid-cols-12 lg:divide-x lg:divide-y-0">
        <WhatsAppPanel />
        <ReasoningPanel />
        <CrmPanel />
      </div>
    </div>
  );
}

function WhatsAppPanel() {
  return (
    <div className="flex flex-col justify-between bg-background p-5 lg:col-span-4">
      <div>
        <div className="mb-4 flex items-center justify-between border-b border-outline-variant pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success text-xs font-bold text-white shadow-xs">
              WA
            </div>
            <div>
              <h4 className="text-xs font-bold text-on-surface">
                Senopati Clinic VIP
              </h4>
              <span className="font-mono text-[10px] text-success">
                ● Online via DIUK
              </span>
            </div>
          </div>
          <span className="rounded border border-outline-variant bg-white px-2 py-0.5 font-mono text-[10px] text-on-surface-variant">
            WhatsApp API
          </span>
        </div>

        <div className="space-y-3 font-sans text-xs">
          <div className="max-w-[90%] rounded-xl border border-outline-variant bg-white p-3 shadow-xs">
            <span className="mb-1 block font-mono text-[10px] text-gray-400">
              Customer • 15:58
            </span>
            <p className="leading-relaxed text-on-surface">
              Halo Kak, mau booking facial treatment sore ini jam 16:00 di
              Senopati masih ada?
            </p>
          </div>
          <div className="ml-auto max-w-[92%] rounded-xl border border-primary-light bg-primary/10 p-3 shadow-xs">
            <div className="mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1 font-mono text-[10px] font-bold text-primary-dark">
                <Icon name="smart_toy" className="text-[13px]" /> DIUK AI Bot
              </span>
              <span className="font-mono text-[10px] text-primary-dark">
                15:58:01
              </span>
            </div>
            <p className="leading-relaxed text-on-surface">
              Halo Kak! Ada 2 slot tersedia untuk Facial Treatment sore ini jam
              16:00 bersama dr. Nadia. Boleh kami bantu kunci slotnya sekarang?
            </p>
            <div className="mt-2.5 flex items-center gap-2 border-t border-primary-light/60 pt-2">
              <span className="rounded bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">
                Lock Slot (dr. Nadia)
              </span>
              <span className="font-mono text-[10px] text-primary-dark">
                1-Tap Confirmation
              </span>
            </div>
          </div>
          <div className="max-w-[85%] rounded-xl border border-outline-variant bg-white p-3 shadow-xs">
            <span className="mb-1 block font-mono text-[10px] text-gray-400">
              Customer • 15:58:24
            </span>
            <p className="text-on-surface">
              Mau kunci sekarang ya kak, via QRIS bisa?
            </p>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-outline-variant pt-4 font-mono text-[11px] text-on-surface-variant">
        <span>Natural Bahasa Indo Engine</span>
        <span className="font-medium text-success">99.8% Parsed</span>
      </div>
    </div>
  );
}

function ReasoningPanel() {
  return (
    <div className="flex flex-col justify-between bg-white p-5 lg:col-span-4">
      <div>
        <div className="mb-4 flex items-center justify-between border-b border-outline-variant pb-3">
          <span className="font-mono text-xs font-bold text-on-surface-variant uppercase">
            DIUK Reasoning Node
          </span>
          <span className="rounded-full border border-primary-light bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary-dark">
            Score: 96/100
          </span>
        </div>
        <div className="space-y-3 font-mono text-xs">
          <div className="rounded-xl border border-outline-variant bg-surface-container-low p-3">
            <div className="mb-1.5 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 font-semibold text-on-surface">
                <Icon name="psychology" className="text-[15px] text-primary-dark" />{" "}
                Intent Parsed
              </span>
              <span className="font-bold text-success">Conf: 0.99</span>
            </div>
            <div className="font-sans text-[11px] text-on-surface">
              <span className="font-semibold">Booking & Availability Check</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {["[Branch: Senopati]", "[Service: Facial]", "[Time: 16:00]"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="rounded border border-outline-variant bg-white px-1.5 py-0.5 text-[10px] text-on-surface-variant"
                  >
                    {tag}
                  </span>
                ),
              )}
            </div>
          </div>
          <div className="rounded-xl border border-outline-variant bg-surface-container-low p-3">
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 font-semibold text-on-surface">
                <Icon name="sync" className="text-[15px] text-secondary" />{" "}
                Calendar Sync
              </span>
              <span className="text-xs text-on-surface-variant">18ms</span>
            </div>
            <p className="font-sans text-[11px] text-on-surface">
              Room 02 & dr. Nadia reserved temporarily (10m lock).
            </p>
          </div>
          <div className="rounded-xl border border-outline-variant bg-surface-container-low p-3">
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 font-semibold text-on-surface">
                <Icon name="qr_code_2" className="text-[15px] text-success" />{" "}
                Dynamic QRIS
              </span>
              <span className="font-bold text-success">Auto-Gen</span>
            </div>
            <p className="font-sans text-[11px] text-on-surface">
              Invoice ID: INV-8921 • Rp 150.000 (Commit)
            </p>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-outline-variant pt-4 font-mono text-[11px]">
        <span className="text-on-surface-variant">Workflow State</span>
        <span className="font-bold text-primary-dark">
          Autonomous Execution
        </span>
      </div>
    </div>
  );
}

function CrmPanel() {
  return (
    <div className="flex flex-col justify-between bg-background p-5 lg:col-span-4">
      <div>
        <div className="mb-4 flex items-center justify-between border-b border-outline-variant pb-3">
          <span className="font-mono text-xs font-bold text-on-surface-variant uppercase">
            Lead & CRM Sync
          </span>
          <span className="flex items-center gap-1 rounded border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-success">
            <Icon name="check_circle" className="text-[12px]" /> Live Hook
          </span>
        </div>
        <div className="mb-3 rounded-xl border border-outline-variant bg-white p-3.5 shadow-xs">
          <div className="mb-2 flex items-start justify-between">
            <div>
              <h4 className="text-xs font-bold text-on-surface">
                Clarissa Angela
              </h4>
              <p className="font-mono text-[10px] text-on-surface-variant">
                +62 812-3920-1100
              </p>
            </div>
            <span className="rounded bg-primary/15 px-1.5 py-0.5 font-mono text-[9px] font-bold text-primary-dark">
              VIP (LTV 6.2M)
            </span>
          </div>
          <div className="space-y-1.5 font-sans text-[11px]">
            <div className="flex justify-between border-b border-gray-100 py-1">
              <span className="text-on-surface-variant">Service:</span>
              <span className="font-medium text-on-surface">
                Acne Laser Facial
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-1">
              <span className="text-on-surface-variant">Schedule:</span>
              <span className="font-medium text-on-surface">
                Today, 16:00 WIB
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-1">
              <span className="text-on-surface-variant">Payment:</span>
              <span className="font-semibold text-success">
                QRIS Verified (Rp 150k)
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-outline-variant bg-white p-2.5 text-[11px]">
          <span className="font-mono text-on-surface-variant">
            Front Desk Operator:
          </span>
          <span className="flex items-center gap-1 font-semibold text-on-surface">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Standby
            / Notified
          </span>
        </div>
      </div>
      <div className="mt-4 border-t border-outline-variant pt-3">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-surface-container py-2 font-mono text-xs text-on-surface transition-colors hover:bg-surface-container-high"
        >
          <Icon name="open_in_new" className="text-sm" />
          <span>View in Unified Dashboard</span>
        </button>
      </div>
    </div>
  );
}
