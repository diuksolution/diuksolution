import type { KpiCardData } from "@/lib/appointment/dashboard-data";
import { Icon } from "@/components/ui/icon";

export function KpiGrid({ items }: { items: KpiCardData[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <article
          key={item.id}
          className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <span className="font-mono text-[11px] tracking-wider text-on-surface-variant uppercase">
                {item.eyebrow}
              </span>
              <h2 className="text-lg font-medium text-on-surface">{item.title}</h2>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-surface-container-high">
              <Icon name={item.icon} className={`text-[20px] ${item.iconClassName}`} />
            </div>
          </div>
          <div className="pt-5">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl leading-none font-semibold tracking-tight text-on-surface">
                {item.value}
                {item.valueSuffix ? (
                  <span className="text-[22px] text-on-surface-variant">
                    {item.valueSuffix}
                  </span>
                ) : null}
              </span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-success/10 px-1.5 py-0.5 text-xs font-semibold text-success">
                <Icon name="trending_up" className="text-[14px]" />
                {item.delta}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between pt-3 text-on-surface-variant">
              <span className="text-[11px]">{item.footer}</span>
              <span className="font-mono text-[11px] font-medium text-success">
                {item.meta}
              </span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
