import Link from "next/link";
import type { PipelineColumnData } from "@/lib/appointment/dashboard-data";
import { Icon } from "@/components/ui/icon";

export function SalesPipeline({
  value,
  columns,
  leadsHref,
}: {
  value: string;
  columns: PipelineColumnData[];
  leadsHref: string;
}) {
  return (
    <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[22px] leading-7 font-semibold text-on-surface">
              Conversational Sales Pipeline
            </h2>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary">
              Live Funnel
            </span>
          </div>
          <p className="text-[13px] text-on-surface-variant">
            Total active deal value:{" "}
            <span className="font-semibold text-on-surface">{value}</span> across
            active chat threads
          </p>
        </div>
        <Link
          href={leadsHref}
          className="inline-flex items-center gap-0.5 self-start text-xs font-semibold text-primary hover:text-primary-dark sm:self-auto"
        >
          View All Leads
          <Icon name="arrow_forward" className="text-[16px]" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 pt-1 md:grid-cols-3 lg:grid-cols-5">
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex flex-col gap-2 rounded-xl bg-surface-container-low p-3"
          >
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-1.5">
                <span className={`size-2 rounded-full ${column.dotClassName}`} />
                <span className="text-xs font-semibold text-on-surface">
                  {column.title}
                </span>
              </div>
              <span className="rounded-md bg-white px-1.5 py-0.5 font-mono text-[11px] text-on-surface-variant">
                {column.count}
              </span>
            </div>
            {column.cards.map((card) => (
              <div
                key={card.id}
                className="space-y-1.5 rounded-xl bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-primary">
                    {card.source}
                  </span>
                  <span className="font-mono text-[11px] text-on-surface-variant">
                    {card.time}
                  </span>
                </div>
                <p className="text-xs font-semibold text-on-surface">{card.name}</p>
                <p className="truncate text-[11px] text-on-surface-variant">
                  {card.service}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span
                    className={`font-mono text-[11px] font-semibold ${
                      card.done ? "text-success" : "text-primary"
                    }`}
                  >
                    {card.value}
                  </span>
                  <Icon
                    name={card.done ? "check_circle" : "trending_flat"}
                    className={`text-[16px] ${
                      card.done ? "text-success" : "text-outline"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
