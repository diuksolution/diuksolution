"use client";

import Image from "next/image";
import type { CoreSidebarProps } from "@/components/admin/sidebar/types";
import { CoreNav } from "@/components/admin/sidebar/core-nav";
import { Icon } from "@/components/ui/icon";

export function CoreSidebar({
  businessName,
  industryLabel,
  roleLabel,
  nav,
  collapsed,
  mobileOpen,
  onCollapse,
  onNavigate,
}: CoreSidebarProps) {
  return (
    <aside
      className={`fixed top-0 left-0 z-50 flex h-dvh flex-col overflow-y-auto bg-surface-container-low shadow-sm transition-[width,transform] duration-200 ${
        collapsed ? "w-[76px]" : "w-[260px]"
      } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
    >
      <div
        className={`flex p-3 ${
          collapsed ? "flex-col items-center gap-2" : "items-center justify-between gap-2"
        }`}
      >
          {/* <div className={`flex items-center ${collapsed ? "" : "gap-2"}`}> */}
            <Image
              src="/logo.png"
              alt="DIUK"
              width={32}
              height={32}
              unoptimized
              className="h-8 w-auto object-contain"
            />
          {/* </div> */}
        <button
          type="button"
          onClick={onCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        >
          <Icon
            name={collapsed ? "dock_to_left" : "dock_to_right"}
            className="text-[18px] leading-none"
          />
        </button>
      </div>
        <div className="h-px bg-surface-container-high mx-4 mb-4"></div>

      {collapsed ? null : (
        <div className="px-3 pb-3">
          <div className="flex flex-col gap-1 rounded-xl bg-surface p-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                  <Icon name="spa" className="text-[15px] leading-none" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-on-surface">
                    {businessName}
                  </p>
                  <p className="truncate text-[11px] text-on-surface-variant">
                    {industryLabel}
                  </p>
                </div>
              </div>
              <Icon name="unfold_more" className="text-[18px] text-outline" />
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-success">
                <span className="size-1.5 animate-pulse rounded-full bg-success" />
                LIVE
              </span>
              <span className="rounded-full bg-surface-container-high px-1.5 py-0.5 text-[11px] font-medium text-on-surface-variant">
                Role: {roleLabel}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-0 flex-1">
        <CoreNav sections={nav} collapsed={collapsed} onNavigate={onNavigate} />
      </div>

      {/* {collapsed ? null : (
        <div className="p-3">
          <div className="flex items-center justify-between rounded-xl bg-surface p-2 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-success" />
              <div className="flex flex-col">
                <span className="font-mono text-[11px] font-semibold text-on-surface">
                  AI Engine v2.4
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  99.9% Autonomous
                </span>
              </div>
            </div>
            <Icon name="check_circle" className="text-[16px] text-success" />
          </div>
        </div>
      )} */}
    </aside>
  );
}
