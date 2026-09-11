import Image from "next/image";
import { landingPage } from "@/data/landing-page";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/landing/section-heading";

const badgeTones = {
  emerald: "bg-success/15 text-success",
  teal: "bg-primary/15 text-primary-dark",
  amber: "bg-warning/15 text-warning",
  blue: "bg-info/15 text-info",
};

export function Solutions() {
  const { solutions } = landingPage;

  return (
    <section
      id={solutions.id}
      className="w-full border-y border-outline-variant bg-white py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={solutions.eyebrow}
          title={solutions.title}
          description={solutions.description}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {solutions.cards.map((card) => (
            <div
              key={card.title}
              className="group relative flex h-[380px] flex-col justify-end overflow-hidden rounded-2xl border border-outline-variant p-6 shadow-sm"
            >
              <Image
                src={card.image}
                alt={card.imageAlt}
                fill
                unoptimized
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="relative z-10 rounded-xl border border-white/40 bg-white/95 p-4 shadow-lg backdrop-blur-md">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm font-bold text-on-surface">
                    <Icon
                      name={card.icon}
                      className="text-lg text-primary-dark"
                    />
                    {card.title}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${badgeTones[card.badgeTone]}`}
                  >
                    {card.badge}
                  </span>
                </div>
                <p className="mb-2.5 text-xs text-on-surface-variant">
                  {card.description}
                </p>
                <div className="flex items-center justify-between rounded border border-outline-variant bg-surface-container p-2 font-mono text-[11px]">
                  <span className="text-on-surface">{card.metaLabel}</span>
                  <span className="flex items-center gap-1 font-bold text-success">
                    {card.badgeTone === "emerald" ? (
                      <Icon name="verified" className="text-[13px]" />
                    ) : null}
                    {card.metaValue}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
