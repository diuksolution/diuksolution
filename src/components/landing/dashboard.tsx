import { landingPage } from "@/data/landing-page";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/landing/section-heading";

const hintTones = {
  navy: "text-secondary",
  muted: "text-on-surface-variant",
};

export function Dashboard() {
  const { dashboard } = landingPage;

  return (
    <section className="w-full bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={dashboard.eyebrow}
          title={dashboard.title}
          description={dashboard.description}
          eyebrowClassName="text-secondary"
        />

        <div className="relative overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-secondary-dark/40 bg-secondary px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/40" />
              <span className="h-2.5 w-2.5 rounded-full bg-white" />
              <span className="ml-2 font-mono text-xs font-medium text-white/80">
                DIUK Operations Cockpit
              </span>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-secondary-light/40 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                {dashboard.badges[0]}
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-secondary-dark/50 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-white">
                <Icon name="bolt" className="text-[14px] text-white" />
                {dashboard.badges[1]}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {dashboard.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-xl border border-outline-variant bg-surface-container-low p-4"
                >
                  <span className="mb-1 block font-mono text-[11px] text-on-surface-variant">
                    {metric.label}
                  </span>
                  <p className="text-2xl font-bold text-secondary">{metric.value}</p>
                  <span
                    className={`font-mono text-[10px] font-semibold ${hintTones[metric.hintTone]}`}
                  >
                    {metric.hint}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="flex flex-col justify-between rounded-xl border border-outline-variant bg-surface-container-low p-5 lg:col-span-7">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-secondary uppercase">
                      {dashboard.gmv.label}
                    </span>
                    <h4 className="text-2xl font-bold text-secondary">
                      {dashboard.gmv.value}
                    </h4>
                  </div>
                  <span className="rounded-full bg-secondary/10 px-2.5 py-1 font-mono text-xs font-bold text-secondary">
                    {dashboard.gmv.growth}
                  </span>
                </div>
                <div className="flex h-32 items-end justify-between gap-3 pt-4">
                  {dashboard.gmv.weeks.map((week) => (
                    <div
                      key={week.label}
                      className="flex flex-1 flex-col items-center gap-1.5"
                    >
                      <div
                        className={`w-full rounded-t ${week.height} ${
                          week.active ? "bg-secondary" : "bg-secondary-light/35"
                        }`}
                      />
                      <span
                        className={`font-mono text-[10px] ${
                          week.active
                            ? "font-bold text-secondary"
                            : "text-text-muted"
                        }`}
                      >
                        {week.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-outline-variant bg-surface-container-low p-5 lg:col-span-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-secondary uppercase">
                    Live Conversation Activity
                  </span>
                  <span className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
                </div>
                <div className="space-y-2 font-mono text-xs">
                  {dashboard.activity.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between rounded border-l-2 border-secondary bg-white p-2"
                    >
                      <div>
                        <p className="font-sans font-bold text-on-surface">
                          {item.name}
                        </p>
                        <span className="text-[10px] text-text-muted">
                          {item.detail}
                        </span>
                      </div>
                      <span className="font-bold text-secondary">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
