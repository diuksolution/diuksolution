"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { landingPage } from "@/data/landing-page";
import { Icon } from "@/components/ui/icon";

export function Header() {
  const { header } = landingPage;
  const [open, setOpen] = useState(false);
  const [activeHref, setActiveHref] = useState(header.navItems[0]?.href ?? "");

  useEffect(() => {
    const sectionIds = header.navItems
      .map((item) => item.href.replace(/^#/, ""))
      .filter(Boolean);

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0),
          );

        if (visible[0]?.target.id) {
          setActiveHref(`#${visible[0].target.id}`);
        }
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.1, 0.25, 0.5],
      },
    );

    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [header.navItems]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="pointer-events-auto mx-auto max-w-5xl">
        <div className="rounded-full border border-white/60 bg-white/55 shadow-[0_8px_32px_-12px_rgba(30,36,48,0.28)] backdrop-blur-xl supports-backdrop-filter:bg-white/45">
          <div className="flex h-14 items-center justify-between gap-3 px-3 sm:px-4">
            <a href={header.logo.href} className="flex shrink-0 items-center gap-2">
              <Image
                src={header.logo.src}
                alt={header.logo.alt}
                width={120}
                height={32}
                unoptimized
                className="h-7 w-auto object-contain sm:h-8"
                priority
              />
            </a>

            <nav className="hidden items-center gap-0.5 md:flex">
              {header.navItems.map((item) => {
                const isActive = activeHref === item.href;

                return (
                  <a
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => setActiveHref(item.href)}
                    className={`relative rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-white/70 ${
                      isActive
                        ? "text-on-surface"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {item.label}
                    <span
                      aria-hidden
                      className={`absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-primary transition-opacity duration-200 ${
                        isActive ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </a>
                );
              })}
            </nav>

            <div className="flex items-center gap-2 sm:gap-2.5">
              <a
                href={header.login.href}
                className="hidden rounded-full px-3 py-1.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-white/70 hover:text-on-surface sm:inline"
              >
                {header.login.label}
              </a>
              <a
                href={header.cta.href}
                className="flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark sm:px-4"
              >
                <span>{header.cta.label}</span>
                <Icon name="arrow_forward" className="text-base" />
              </a>
              <button
                type="button"
                className="rounded-full p-2 text-on-surface transition-colors hover:bg-white/70 md:hidden"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
              >
                <Icon name={open ? "close" : "menu"} className="text-2xl" />
              </button>
            </div>
          </div>

          {open ? (
            <nav className="border-t border-outline-variant/60 px-3 py-3 md:hidden">
              <div className="flex flex-col gap-0.5">
                {header.navItems.map((item) => {
                  const isActive = activeHref === item.href;

                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? "true" : undefined}
                      className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/70 ${
                        isActive
                          ? "bg-white/60 text-on-surface underline decoration-primary decoration-2 underline-offset-4"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                      onClick={() => {
                        setActiveHref(item.href);
                        setOpen(false);
                      }}
                    >
                      {item.label}
                    </a>
                  );
                })}
                <a
                  href={header.login.href}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-white/70 hover:text-on-surface sm:hidden"
                  onClick={() => setOpen(false)}
                >
                  {header.login.label}
                </a>
              </div>
            </nav>
          ) : null}
        </div>
      </div>
    </header>
  );
}
