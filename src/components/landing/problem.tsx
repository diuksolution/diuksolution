import type { ReactNode } from "react";
import { landingPage } from "@/data/landing-page";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/landing/section-heading";

const tones = {
  red: {
    glow: "bg-error/10",
    icon: "bg-error/15 text-error",
  },
  amber: {
    glow: "bg-warning/10",
    icon: "bg-warning/15 text-warning",
  },
  blue: {
    glow: "bg-info/10",
    icon: "bg-info/15 text-info",
  },
};

export function Problem() {
  const { problem } = landingPage;
  const [slow, lost, manual] = problem.cards;

  return (
    <section className="w-full bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={problem.eyebrow}
          title={problem.title}
          description={problem.description}
          eyebrowClassName="text-error"
          className="mb-12 max-w-2xl"
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <ProblemCard tone={slow.tone} icon={slow.icon} title={slow.title} description={slow.description}>
            <div className="relative z-10 rounded-xl border border-outline-variant bg-surface-container-low p-3.5">
              <div className="mb-2 flex items-center justify-between font-mono text-xs">
                <span className="flex items-center gap-1 font-bold text-error">
                  <Icon name="schedule" className="text-sm" /> {slow.metric}
                </span>
                <span className="rounded bg-error/15 px-1.5 py-0.5 text-[10px] text-error">
                  {slow.badge}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div className="h-full bg-error" style={{ width: slow.barWidth }} />
              </div>
              <p className="mt-2 font-mono text-[10px] text-on-surface-variant">
                {slow.note}
              </p>
            </div>
          </ProblemCard>

          <ProblemCard tone={lost.tone} icon={lost.icon} title={lost.title} description={lost.description}>
            <div className="relative z-10 rounded-xl border border-outline-variant bg-surface-container-low p-3.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-on-surface">
                  {lost.inboxLabel}
                </span>
                <span className="rounded-full bg-error px-2 py-0.5 font-mono text-[10px] font-bold text-white shadow-xs">
                  {lost.unread}
                </span>
              </div>
              <div className="flex items-center justify-between rounded border border-outline-variant bg-white p-2 font-mono text-[11px] text-on-surface-variant">
                <span>{lost.revenueLabel}</span>
                <span className="font-bold text-error">{lost.revenue}</span>
              </div>
            </div>
          </ProblemCard>

          <ProblemCard tone={manual.tone} icon={manual.icon} title={manual.title} description={manual.description}>
            <div className="relative z-10 rounded-xl border border-outline-variant bg-surface-container-low p-3.5">
              <div className="mb-1 flex items-center justify-between font-mono text-xs font-bold text-error">
                <span className="flex items-center gap-1">
                  <Icon name="warning" className="text-sm" /> {manual.alert}
                </span>
                <span className="rounded bg-error/15 px-1.5 py-0.5 text-[10px] text-error">
                  {manual.badge}
                </span>
              </div>
              <div className="space-y-1 rounded border border-outline-variant bg-white p-2 font-mono text-[10px] text-on-surface">
                <p className="text-gray-400">{manual.sheet}</p>
                <p className="font-semibold text-error">{manual.conflict}</p>
              </div>
            </div>
          </ProblemCard>
        </div>
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
    <div className="relative flex h-[320px] flex-col justify-between overflow-hidden rounded-2xl border border-outline-variant bg-white p-6 shadow-sm">
      <div
        className={`pointer-events-none absolute -right-8 -bottom-8 h-44 w-44 rounded-full blur-2xl ${palette.glow}`}
      />
      <div>
        <div
          className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${palette.icon}`}
        >
          <Icon name={icon} className="text-2xl" />
        </div>
        <h3 className="mb-1 text-lg font-bold text-on-surface">{title}</h3>
        <p className="text-xs text-on-surface-variant">{description}</p>
      </div>
      {children}
    </div>
  );
}
