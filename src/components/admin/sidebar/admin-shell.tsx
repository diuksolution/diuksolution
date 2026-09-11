"use client";

import { Suspense, useState } from "react";
import { usePathname } from "next/navigation";
import type { AdminShellProps } from "@/components/admin/sidebar/types";
import { CoreTopbar } from "@/components/admin/sidebar/core-topbar";
import { NavProgress } from "@/components/admin/sidebar/nav-progress";

export function AdminShell({
  user,
  Sidebar,
  industryLabel,
  roleLabel,
  searchPlaceholder,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const flush = pathname.includes("/chat");

  return (
    <div className="min-h-dvh bg-background">
      <Suspense fallback={null}>
        <NavProgress />
      </Suspense>
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <Sidebar
        businessName={user.businessName}
        industryLabel={industryLabel}
        roleLabel={roleLabel}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCollapse={() => setCollapsed((value) => !value)}
        onNavigate={() => setMobileOpen(false)}
      />

      <div
        className={`min-h-dvh transition-[padding] duration-200 ${
          flush ? "h-dvh overflow-hidden" : ""
        } ${collapsed ? "lg:pl-[76px]" : "lg:pl-[260px]"}`}
      >
        <CoreTopbar
          user={user}
          searchPlaceholder={searchPlaceholder}
          locationLabel={`${user.businessName} · Jakarta`}
          collapsed={collapsed}
          onMenu={() => setMobileOpen(true)}
        />
        <main
          className={
            flush
              ? "h-dvh overflow-hidden bg-background pt-16"
              : "min-h-dvh w-full bg-background px-4 pt-20 pb-8 sm:px-6 lg:px-8"
          }
        >
          {children}
        </main>
      </div>
    </div>
  );
}
