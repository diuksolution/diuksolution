import { landingPage } from "@/data/landing-page";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/landing/section-heading";

export function Features() {
  const { features } = landingPage;

  return (
    <section id={features.id} className="w-full bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={features.eyebrow}
          title={features.title}
          description={features.description}
          className="mb-14"
        />

        <div className="space-y-10">
          {features.modules.map((module) => (
            <div
              key={module.module}
              className="grid grid-cols-1 items-center gap-8 rounded-2xl border border-outline-variant bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-12"
            >
              <div
                className={`lg:col-span-5 ${module.reverse ? "order-1 lg:order-2" : ""}`}
              >
                <span className="font-mono text-xs font-bold tracking-wider text-primary-dark uppercase">
                  {module.module}
                </span>
                <h3 className="mt-1 mb-2 text-2xl font-bold text-on-surface">
                  {module.title}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-on-surface-variant">
                  {module.description}
                </p>
                <div className="flex items-center gap-3 font-mono text-xs text-on-surface-variant">
                  {module.stats.map((stat) => (
                    <span
                      key={stat.label}
                      className={`flex items-center gap-1 ${stat.accent ? "text-success" : ""}`}
                    >
                      <Icon name={stat.icon} className="text-base" />
                      {stat.label}
                    </span>
                  ))}
                </div>
              </div>
              <div
                className={`rounded-xl border border-outline-variant bg-background p-5 lg:col-span-7 ${
                  module.reverse ? "order-2 lg:order-1" : ""
                } ${module.kind === "pipeline" ? "overflow-x-auto" : ""}`}
              >
                {module.kind === "chat" ? <ChatPreview /> : null}
                {module.kind === "calendar" ? <CalendarPreview /> : null}
                {module.kind === "pipeline" ? <PipelinePreview /> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ChatPreview() {
  return (
    <div className="space-y-3 font-sans text-xs">
      <div className="max-w-[80%] rounded-lg border border-outline-variant bg-white p-3 shadow-xs">
        <span className="mb-0.5 block font-mono text-[9px] text-gray-400">
          Customer
        </span>
        <p className="text-on-surface">
          &quot;min, bisa booked besok buat facial acne ga? harganya brpan
          skrg?&quot;
        </p>
      </div>
      <div className="ml-auto max-w-[85%] rounded-lg border border-primary-light bg-primary/10 p-3 shadow-xs">
        <div className="mb-1 flex items-center justify-between font-mono text-[9px] text-primary-dark">
          <span className="font-bold">DIUK Auto-Agent (1.2s)</span>
          <span>14:20</span>
        </div>
        <p className="text-on-surface">
          &quot;Bisa banget kak! Untuk Facial Acne besok ada promo Rp 280.000
          (diskon 20%). Slot ready jam 11:00, 14:00, dan 16:30 di Senopati. Mau
          disimpankan jam berapa kak?&quot;
        </p>
      </div>
    </div>
  );
}

function CalendarPreview() {
  return (
    <div className="space-y-3 rounded-xl border border-outline-variant bg-white p-4 font-mono text-xs shadow-xs">
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <span className="font-bold text-on-surface">Barber Booking Confirmed</span>
        <span className="rounded bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
          STATUS: CONFIRMED
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 font-sans text-[11px]">
        <div>
          <span className="block font-mono text-[10px] text-gray-400">
            Service:
          </span>
          <span className="font-semibold text-on-surface">
            Haircut + Beard Styling
          </span>
        </div>
        <div>
          <span className="block font-mono text-[10px] text-gray-400">
            Barber:
          </span>
          <span className="font-semibold text-on-surface">Yoga (Chair #2)</span>
        </div>
        <div>
          <span className="block font-mono text-[10px] text-gray-400">
            Date & Time:
          </span>
          <span className="font-semibold text-on-surface">
            Saturday, 12 Sept • 14:00 WIB
          </span>
        </div>
        <div>
          <span className="block font-mono text-[10px] text-gray-400">
            Sync Hook:
          </span>
          <span className="flex items-center gap-1 font-semibold text-success">
            <Icon name="check" className="text-[14px]" /> Google Cal Synced
          </span>
        </div>
      </div>
    </div>
  );
}

function PipelinePreview() {
  const columns = [
    {
      title: "New Lead (8)",
      titleClass: "text-gray-400",
      cardClass: "bg-surface-container-low border-gray-100",
      name: "Dewi Lestari",
      detail: "Inquiry: Bridal",
      detailClass: "text-gray-500",
    },
    {
      title: "Qualified (5)",
      titleClass: "text-info",
      cardClass: "bg-info/10 border-info/20",
      name: "Rian K.",
      detail: "Rp 850.000",
      detailClass: "text-info",
    },
    {
      title: "Follow-up (3)",
      titleClass: "text-warning",
      cardClass: "bg-warning/10 border-warning/20",
      name: "Sari W.",
      detail: "Sent QRIS",
      detailClass: "text-warning",
    },
    {
      title: "Converted (14)",
      titleClass: "text-success",
      cardClass: "bg-success/10 border-success/20",
      name: "Farhan Z.",
      detail: "Rp 1.450.000",
      detailClass: "text-success font-bold",
    },
  ];

  return (
    <div className="flex min-w-[500px] gap-2.5 font-mono text-xs">
      {columns.map((column) => (
        <div
          key={column.title}
          className="flex-1 rounded-lg border border-outline-variant bg-white p-2.5"
        >
          <span
            className={`mb-2 block text-[10px] font-bold uppercase ${column.titleClass}`}
          >
            {column.title}
          </span>
          <div className={`rounded border p-2 font-sans text-[11px] ${column.cardClass}`}>
            <p className="font-bold text-on-surface">{column.name}</p>
            <span className={`font-mono text-[10px] ${column.detailClass}`}>
              {column.detail}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
