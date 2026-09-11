import { landingPage } from "@/data/landing-page";
import { SectionHeading } from "@/components/landing/section-heading";

const avatarTones = {
  teal: "bg-primary/15 text-primary-dark",
  blue: "bg-secondary/10 text-secondary",
  emerald: "bg-success/15 text-success",
};

export function Testimonials() {
  const { testimonials } = landingPage;

  return (
    <section className="w-full bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={testimonials.eyebrow}
          title={testimonials.title}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.items.map((item) => (
            <div
              key={item.name}
              className="flex flex-col justify-between rounded-2xl border border-outline-variant bg-white p-6 shadow-sm"
            >
              <p className="mb-6 text-sm leading-relaxed text-on-surface">
                &quot;{item.quoteBefore}
                <strong className="text-primary-dark">
                  {item.quoteHighlight}
                </strong>
                {item.quoteAfter}&quot;
              </p>
              <div className="flex items-center gap-3 border-t border-outline-variant pt-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${avatarTones[item.tone]}`}
                >
                  {item.initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">{item.name}</p>
                  <p className="text-xs text-on-surface-variant">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
