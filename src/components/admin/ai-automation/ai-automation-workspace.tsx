"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import type { AiAutomationSettingsDto } from "@/lib/ai/settings";
import {
  DEFAULT_BOOKING_SYSTEM_PROMPT,
  DEFAULT_WELCOME_PROMPT,
} from "@/lib/ai/prompt-defaults";

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

    setMessage("Prompt AI tersimpan.");
    startTransition(() => router.refresh());
  }

  return (
    <div className="mx-auto flex w-full max-w-[960px] flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-on-surface">
          AI Automation
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Atur welcoming chat, system prompt booking, dan status AI WhatsApp.
        </p>
      </div>

      <section className="rounded-2xl border border-outline-variant bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-on-surface">LLM provider</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              {llm.configured
                ? `Aktif: ${llm.provider} · model ${llm.model}`
                : "Belum ada API key. Tambah MOONSHOT_API_KEY di .env"}
            </p>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              llm.configured
                ? "bg-success/10 text-success"
                : "bg-warning/15 text-on-surface"
            }`}
          >
            {llm.configured ? "Configured" : "Missing key"}
          </span>
        </div>

      </section>

      <section className="rounded-2xl border border-outline-variant bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-on-surface">AI status</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Matikan jika ingin semua chat dijawab manual.
            </p>
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-on-surface">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(event) => setEnabled(event.target.checked)}
              className="size-4 rounded border-outline-variant"
            />
            AI booking aktif
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-outline-variant bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-on-surface">
              Welcome prompt
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Dipakai saat chat pertama masuk. Placeholder:{" "}
              <code className="font-mono text-[11px]">{"{{name}}"}</code>,{" "}
              <code className="font-mono text-[11px]">{"{{business}}"}</code>
            </p>
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-on-surface">
            <input
              type="checkbox"
              checked={welcomeEnabled}
              onChange={(event) => setWelcomeEnabled(event.target.checked)}
              className="size-4 rounded border-outline-variant"
            />
            Kirim welcome
          </label>
        </div>
        <textarea
          value={welcomePrompt}
          onChange={(event) => setWelcomePrompt(event.target.value)}
          rows={10}
          className="mt-4 w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-3 text-sm text-on-surface focus:bg-white focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setWelcomePrompt(DEFAULT_WELCOME_PROMPT)}
          className="mt-2 text-xs font-semibold text-primary-dark hover:underline"
        >
          Reset ke default
        </button>
      </section>

      <section className="rounded-2xl border border-outline-variant bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-on-surface">
          Booking system prompt
        </h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Instruksi inti AI saat cek jadwal & booking. Juga support{" "}
          <code className="font-mono text-[11px]">{"{{business}}"}</code> /{" "}
          <code className="font-mono text-[11px]">{"{{name}}"}</code>.
        </p>
        <textarea
          value={bookingSystemPrompt}
          onChange={(event) => setBookingSystemPrompt(event.target.value)}
          rows={14}
          className="mt-4 w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-3 font-mono text-xs leading-relaxed text-on-surface focus:bg-white focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setBookingSystemPrompt(DEFAULT_BOOKING_SYSTEM_PROMPT)}
          className="mt-2 text-xs font-semibold text-primary-dark hover:underline"
        >
          Reset ke default
        </button>
      </section>

      {message ? (
        <p className="rounded-xl bg-success/10 px-4 py-3 text-sm font-medium text-success">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl bg-warning/15 px-4 py-3 text-sm font-medium text-on-surface">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2 pb-4">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
        >
          <Icon name="save" className="text-[18px]" />
          Save prompts
        </button>
      </div>
    </div>
  );
}
