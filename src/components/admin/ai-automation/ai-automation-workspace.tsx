"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import type { AiAutomationSettingsDto } from "@/lib/ai/settings";
import {
  DEFAULT_BOOKING_SYSTEM_PROMPT,
  DEFAULT_WELCOME_PROMPT,
} from "@/lib/ai/prompt-defaults";

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-surface-container-high"
      }`}
    >
      <span
        className={`inline-block size-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export function AiAutomationWorkspace({
  settings: initial,
  llm,
}: {
  settings: AiAutomationSettingsDto;
  llm: {
    provider: string | null;
    model: string | null;
    configured: boolean;
  };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [enabled, setEnabled] = useState(initial.enabled);
  const [welcomeEnabled, setWelcomeEnabled] = useState(initial.welcomeEnabled);
  const [welcomePrompt, setWelcomePrompt] = useState(initial.welcomePrompt);
  const [bookingSystemPrompt, setBookingSystemPrompt] = useState(
    initial.bookingSystemPrompt,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setMessage(null);
    setError(null);

    const response = await fetch("/api/ai/automation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enabled,
        welcomeEnabled,
        welcomePrompt,
        bookingSystemPrompt,
      }),
    });

    if (!response.ok) {
      setError("Gagal menyimpan pengaturan.");
      return;
    }

    setMessage("Pengaturan AI tersimpan.");
    startTransition(() => router.refresh());
  }

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-5 pb-24">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-on-surface">
          AI Automation
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">
          Atur balasan WhatsApp AI: status aktif, welcome message, dan prompt
          booking.
        </p>
      </div>

      {message ? (
        <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm font-medium text-error">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border border-outline-variant bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium tracking-wide text-on-surface-variant uppercase">
                LLM provider
              </p>
              <p className="mt-1.5 text-lg font-semibold text-on-surface">
                {llm.configured ? llm.provider : "Not set"}
              </p>
              <p className="mt-1 text-xs text-on-surface-variant">
                {llm.configured
                  ? `Model · ${llm.model}`
                  : "Tambah MOONSHOT_API_KEY di .env"}
              </p>
            </div>
            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                llm.configured
                  ? "border-success/30 bg-success/15 text-success"
                  : "border-warning/30 bg-warning/15 text-warning"
              }`}
            >
              {llm.configured ? "Ready" : "Missing"}
            </span>
          </div>
        </article>

        <article className="rounded-2xl border border-outline-variant bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium tracking-wide text-on-surface-variant uppercase">
                AI booking
              </p>
              <p className="mt-1.5 text-lg font-semibold text-on-surface">
                {enabled ? "Aktif" : "Nonaktif"}
              </p>
              <p className="mt-1 text-xs text-on-surface-variant">
                Auto-reply & booking WhatsApp
              </p>
            </div>
            <Toggle
              checked={enabled}
              onChange={setEnabled}
              label="Toggle AI booking"
            />
          </div>
        </article>

        <article className="rounded-2xl border border-outline-variant bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium tracking-wide text-on-surface-variant uppercase">
                Welcome message
              </p>
              <p className="mt-1.5 text-lg font-semibold text-on-surface">
                {welcomeEnabled ? "Aktif" : "Nonaktif"}
              </p>
              <p className="mt-1 text-xs text-on-surface-variant">
                Kirim saat chat pertama
              </p>
            </div>
            <Toggle
              checked={welcomeEnabled}
              onChange={setWelcomeEnabled}
              label="Toggle welcome message"
            />
          </div>
        </article>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm">
          <div className="border-b border-outline-variant bg-linear-to-br from-surface-container-low via-white to-white px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
                <Icon name="waving_hand" className="text-[20px] text-primary-dark" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-on-surface">
                  Welcome prompt
                </h2>
                <p className="mt-0.5 text-xs text-on-surface-variant">
                  Template balasan pertama. Placeholder{" "}
                  <code className="rounded bg-surface-container-high px-1 font-mono text-[10px]">
                    {"{{name}}"}
                  </code>{" "}
                  ·{" "}
                  <code className="rounded bg-surface-container-high px-1 font-mono text-[10px]">
                    {"{{business}}"}
                  </code>
                </p>
              </div>
            </div>
          </div>
          <div className="p-5">
            <textarea
              value={welcomePrompt}
              onChange={(event) => setWelcomePrompt(event.target.value)}
              rows={12}
              disabled={!welcomeEnabled}
              className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-3.5 py-3 text-sm leading-relaxed text-on-surface focus:bg-white focus:outline-none disabled:opacity-50"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setWelcomePrompt(DEFAULT_WELCOME_PROMPT)}
                className="text-xs font-semibold text-primary-dark hover:underline"
              >
                Reset ke default
              </button>
              <p className="font-mono text-[11px] text-on-surface-variant">
                {welcomePrompt.length} chars
              </p>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm">
          <div className="border-b border-outline-variant bg-linear-to-br from-surface-container-low via-white to-white px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10">
                <Icon name="event_available" className="text-[20px] text-secondary" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-on-surface">
                  Booking system prompt
                </h2>
                <p className="mt-0.5 text-xs text-on-surface-variant">
                  Instruksi AI saat cek jadwal & booking. Support{" "}
                  <code className="rounded bg-surface-container-high px-1 font-mono text-[10px]">
                    {"{{business}}"}
                  </code>{" "}
                  /{" "}
                  <code className="rounded bg-surface-container-high px-1 font-mono text-[10px]">
                    {"{{name}}"}
                  </code>
                </p>
              </div>
            </div>
          </div>
          <div className="p-5">
            <textarea
              value={bookingSystemPrompt}
              onChange={(event) => setBookingSystemPrompt(event.target.value)}
              rows={12}
              disabled={!enabled}
              className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-3.5 py-3 font-mono text-xs leading-relaxed text-on-surface focus:bg-white focus:outline-none disabled:opacity-50"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() =>
                  setBookingSystemPrompt(DEFAULT_BOOKING_SYSTEM_PROMPT)
                }
                className="text-xs font-semibold text-primary-dark hover:underline"
              >
                Reset ke default
              </button>
              <p className="font-mono text-[11px] text-on-surface-variant">
                {bookingSystemPrompt.length} chars
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-outline-variant bg-white/95 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex w-full max-w-[1100px] items-center justify-between gap-3">
          <p className="text-xs text-on-surface-variant">
            Perubahan prompt baru berlaku setelah disimpan.
          </p>
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            <Icon name="save" className="text-[18px]" />
            {pending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
