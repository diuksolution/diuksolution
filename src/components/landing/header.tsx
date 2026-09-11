"use client";

import { useState } from "react";
import Image from "next/image";
import { landingPage } from "@/data/landing-page";
import { Icon } from "@/components/ui/icon";

export function Header() {
  const { header } = landingPage;
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-outline-variant bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href={header.logo.href} className="flex items-center gap-2">
          <Image
            src={header.logo.src}
            alt={header.logo.alt}
            width={120}
            height={32}
            unoptimized
            className="h-8 w-auto object-contain"
            priority
          />
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {header.navItems.map((item, index) => (
            <a
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-surface-container ${
                index === 0
                  ? "text-on-surface hover:text-primary-dark"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={header.login.href}
            className="hidden rounded-md px-3 py-1.5 text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface sm:inline"
          >
            {header.login.label}
          </a>
          <a
            href={header.cta.href}
            className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark"
          >
            <span>{header.cta.label}</span>
            <Icon name="arrow_forward" className="text-base" />
          </a>
          <button
            type="button"
            className="rounded-md p-2 text-on-surface md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <Icon name={open ? "close" : "menu"} className="text-2xl" />
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-outline-variant bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {header.navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a
              href={header.login.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              onClick={() => setOpen(false)}
            >
              {header.login.label}
            </a>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
