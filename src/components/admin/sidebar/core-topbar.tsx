"use client";

import { useEffect, useRef, useState } from "react";
import type { AdminShellUser } from "@/components/admin/sidebar/types";
import { signOutAction } from "@/components/admin/sign-out-action";
import { Icon } from "@/components/ui/icon";

export function CoreTopbar({
  user,
  searchPlaceholder,
  locationLabel,
  collapsed,
  onMenu,
}: {
  user: AdminShellUser;
  searchPlaceholder: string;
  locationLabel: string;
  collapsed: boolean;
  onMenu: () => void;
}) {
  const roleLabel = user.role === "ADMIN" ? "Admin" : "Staff";
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [profileOpen]);

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-40 flex h-16 items-center justify-between bg-white/90 px-4 shadow-sm backdrop-blur-xl sm:px-6 ${
        collapsed ? "lg:left-[76px]" : "lg:left-[260px]"
      }`}
    >
      <div className="flex max-w-xl flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onMenu}
          className="flex size-9 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container lg:hidden"
          aria-label="Open menu"
        >
          <Icon name="menu" className="text-[22px] leading-none" />
        </button>
        <div className="relative w-full">
          <Icon
            name="search"
            className="absolute top-1/2 left-3 -translate-y-1/2 text-[18px] text-outline"
          />
          <input
            className="h-[38px] w-full rounded-lg bg-surface-container-low pr-3 pl-10 text-sm text-on-surface transition-all placeholder:text-outline focus:bg-white focus:shadow-sm focus:outline-none"
            placeholder={searchPlaceholder}
            type="search"
          />
        </div>
        <div className="hidden shrink-0 items-center gap-1 rounded-lg bg-surface-container-low px-2 py-1.5 xl:flex">
          <Icon name="location_on" className="text-[16px] text-outline" />
          <span className="text-xs font-medium text-on-surface">{locationLabel}</span>
          <Icon name="expand_more" className="text-[16px] text-outline" />
        </div>
      </div>

      <div className="ml-3 flex items-center gap-2 sm:gap-3">
        <div className="hidden items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 font-mono text-[11px] font-medium text-success md:flex">
          <span className="size-1.5 animate-pulse rounded-full bg-success" />
          AI Active • 82% Handled
        </div>
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
          aria-label="Help"
        >
          <Icon name="help_outline" className="text-[20px] leading-none" />
        </button>
        <button
          type="button"
          className="relative flex size-9 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
          aria-label="Notifications"
        >
          <Icon name="notifications" className="text-[20px] leading-none" />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-error ring-2 ring-white" />
        </button>

        <div ref={profileRef} className="relative pl-1">
          <button
            type="button"
            onClick={() => setProfileOpen((open) => !open)}
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-surface-container"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-white">
              <Icon name="person" className="text-[18px] leading-none" />
            </span>
            <div className="hidden text-left lg:flex lg:flex-col">
              <span className="text-xs leading-tight font-semibold text-on-surface">
                {user.name ?? user.email}
              </span>
              <span className="text-[11px] leading-tight text-on-surface-variant">
                {roleLabel}
              </span>
            </div>
            <Icon
              name="expand_more"
              className={`hidden text-[18px] text-outline transition-transform lg:inline ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {profileOpen ? (
            <div
              role="menu"
              className="absolute top-full right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-lg"
            >
              <div className="border-b border-outline-variant px-3 py-2.5 lg:hidden">
                <p className="truncate text-xs font-semibold text-on-surface">
                  {user.name ?? user.email}
                </p>
                <p className="truncate text-[11px] text-on-surface-variant">
                  {roleLabel}
                </p>
              </div>
              <form action={signOutAction}>
                <button
                  type="submit"
                  role="menuitem"
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                >
                  <Icon name="logout" className="text-[18px] leading-none" />
                  Sign out
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
