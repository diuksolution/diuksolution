"use client";

import { useState } from "react";
import type { VelocityDayData } from "@/lib/appointment/dashboard-data";

export function VelocityPanel({ days }: { days: VelocityDayData[] }) {
  const [range, setRange] = useState<"7" | "30">("7");

  return (
    <section className="flex flex-col justify-between space-y-4 rounded-2xl bg-white p-5 shadow-sm lg:col-span-5">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[22px] leading-7 font-semibold text-on-surface">
              Appointment Velocity
            </h2>
            <p className="text-[13px] text-on-surface-variant">
              Weekly distribution & capacity ceiling
            </p>
          </div>
          <div className="flex items-center rounded-xl bg-surface-container-low p-0.5">
            <button
              type="button"
              onClick={() => setRange("7")}
              className={`rounded-lg px-2 py-0.5 text-xs font-medium ${
                range === "7"
                  ? "bg-white font-semibold text-primary shadow-sm"
                  : "text-on-surface-variant"
              }`}
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => setRange("30")}
              className={`rounded-lg px-2 py-0.5 text-xs font-medium ${
                range === "30"
                  ? "bg-white font-semibold text-primary shadow-sm"
                  : "text-on-surface-variant"
              }`}
            >
              30 Days
            </button>
          </div>
        </div>
        <div className="mt-5 pt-4">
          <div className="flex h-48 w-full items-end justify-between gap-2 px-1">
            {days.map((day) => (
              <div
                key={day.label}
                className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5"
              >
                <span
                  className={`font-mono text-[11px] ${
                    day.peak
                      ? "font-bold text-success opacity-100"
                      : "text-on-surface-variant opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {day.value}
                </span>
                <div
                  className={`w-full max-w-7 rounded-t-lg transition-colors ${
                    day.peak
                      ? "bg-success shadow-sm"
                      : "bg-surface-container-high group-hover:bg-primary-light"
                  }`}
                  style={{ height: `${day.height}%` }}
                />
                <span
                  className={`font-mono text-[11px] ${
                    day.peak ? "font-bold text-success" : "text-on-surface-variant"
                  }`}
                >
                  {day.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="pt-4">
        <div className="space-y-1.5 rounded-xl bg-surface-container-low p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] tracking-wider text-on-surface-variant uppercase">
              Key Operational Metric
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-success">
              <span className="size-1.5 rounded-full bg-success" />
              Optimal
            </span>
          </div>
          <p className="text-xs font-semibold text-on-surface">
            Peak velocity: Saturday (42 slots) • AI Booking Ratio: 78.4%
          </p>
          <p className="text-[11px] text-on-surface-variant">
            Capacity reaches 94% on weekend slots. Intelligent auto-staggering
            is active{range === "30" ? " across the last 30 days." : "."}
          </p>
        </div>
      </div>
    </section>
  );
}
