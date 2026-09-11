"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminNavSection } from "@/components/admin/sidebar/types";
import { Icon } from "@/components/ui/icon";

function isActive(pathname: string, href: string) {
  const isWorkspaceHome =
    href === "/admin/clinic" ||
    href === "/admin/salon" ||
    href === "/admin/fnb";

  if (isWorkspaceHome) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function CoreNav({
  sections,
  collapsed,
  onNavigate,
}: {
  sections: AdminNavSection[];
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3 pb-4">
      {sections.map((section) => (
        <div key={section.title} className="pt-3 first:pt-1">
          {collapsed ? null : (
            <p className="px-3 pb-1 font-mono text-[10px] font-medium tracking-wider text-outline uppercase">
              {section.title}
            </p>
          )}
          {section.items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                title={collapsed ? item.label : undefined}
                onClick={onNavigate}
                className={`relative flex items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="relative">
                    <Icon name={item.icon} className="text-[20px] leading-none" />
                    {collapsed && item.badge ? (
                      <span className="absolute -top-1 -right-1 size-2 rounded-full bg-error ring-2 ring-surface-container-low" />
                    ) : null}
                  </span>
                  {collapsed ? null : (
                    <span className="truncate text-sm">{item.label}</span>
                  )}
                </span>
                {!collapsed && item.badge ? (
                  <span
                    className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] font-medium ${
                      active ? "bg-white/20 text-white" : "bg-primary text-white"
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
