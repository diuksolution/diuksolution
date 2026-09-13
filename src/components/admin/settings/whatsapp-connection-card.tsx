"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import type { WhatsAppConnectionStatus } from "@/lib/whatsapp/credentials";

export function WhatsAppConnectionCard({
  initial,
}: {
  initial: WhatsAppConnectionStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [phoneNumberId, setPhoneNumberId] = useState(
    initial.phoneNumberId ?? "",
  );
  const [displayNumber, setDisplayNumber] = useState(
    initial.displayNumber ?? "",
  );
  const [wabaId, setWabaId] = useState(initial.wabaId ?? "");
  const [accessToken, setAccessToken] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [verifyToken, setVerifyToken] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState(initial);

  async function save() {
    setMessage(null);
    setError(null);

    const response = await fetch("/api/whatsapp/connection", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumberId,
        displayNumber: displayNumber || null,
        wabaId: wabaId || null,
        accessToken: accessToken || null,
        appSecret: appSecret || null,
        verifyToken: verifyToken || null,
      }),
    });

    const payload = (await response.json()) as
      | WhatsAppConnectionStatus
      | { error?: string };

    if (!response.ok) {
      setError(
        "error" in payload && payload.error
          ? payload.error
          : "Gagal menyimpan koneksi WhatsApp.",
      );
      return;
    }

    setStatus(payload as WhatsAppConnectionStatus);
    setAccessToken("");
    setAppSecret("");
    setVerifyToken("");
    setMessage("Koneksi WhatsApp tersimpan.");
    startTransition(() => router.refresh());
  }

  async function disconnect() {
    setMessage(null);
    setError(null);

    const response = await fetch("/api/whatsapp/connection", {
      method: "DELETE",
    });

    if (!response.ok) {
      setError("Gagal memutus koneksi WhatsApp.");
      return;
    }

    setStatus({
      connected: false,
      phoneNumberId: null,
      displayNumber: null,
      wabaId: null,
      hasAccessToken: false,
      hasAppSecret: false,
      hasVerifyToken: false,
    });
    setPhoneNumberId("");
    setDisplayNumber("");
    setWabaId("");
    setAccessToken("");
    setAppSecret("");
    setVerifyToken("");
    setMessage("Koneksi WhatsApp dihapus.");
    startTransition(() => router.refresh());
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm">
      <div className="border-b border-outline-variant bg-linear-to-br from-surface-container-low via-white to-white px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-success/15">
              <Icon name="forum" className="text-[20px] text-success" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-on-surface">
                WhatsApp Cloud API
              </h2>
              <p className="mt-0.5 text-xs text-on-surface-variant">
                Daftarkan nomor di Meta dulu, lalu masukkan credential di sini
                per bisnis.
              </p>
            </div>
          </div>
          <span
            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
              status.connected
                ? "border-success/30 bg-success/15 text-success"
                : "border-outline-variant bg-surface-container-low text-on-surface-variant"
            }`}
          >
            {status.connected ? "Connected" : "Not connected"}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-5">
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

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="text-xs font-medium text-on-surface-variant">
              Phone number ID
            </span>
            <input
              value={phoneNumberId}
              onChange={(event) => setPhoneNumberId(event.target.value)}
              placeholder="Dari Meta → WhatsApp → API Setup"
              className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-3.5 py-2.5 text-sm text-on-surface focus:bg-white focus:outline-none"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-on-surface-variant">
              Display number (opsional)
            </span>
            <input
              value={displayNumber}
              onChange={(event) => setDisplayNumber(event.target.value)}
              placeholder="+62…"
              className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-3.5 py-2.5 text-sm text-on-surface focus:bg-white focus:outline-none"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-on-surface-variant">
              WABA ID (opsional)
            </span>
            <input
              value={wabaId}
              onChange={(event) => setWabaId(event.target.value)}
              placeholder="WhatsApp Business Account ID"
              className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-3.5 py-2.5 text-sm text-on-surface focus:bg-white focus:outline-none"
            />
          </label>

          <label className="block space-y-1.5 sm:col-span-2">
            <span className="text-xs font-medium text-on-surface-variant">
              Access token{" "}
              {status.hasAccessToken ? (
                <span className="text-success">(tersimpan — isi ulang untuk ganti)</span>
              ) : null}
            </span>
            <input
              type="password"
              value={accessToken}
              onChange={(event) => setAccessToken(event.target.value)}
              placeholder={
                status.hasAccessToken
                  ? "•••••••• (biarkan kosong jika tidak diganti)"
                  : "Permanent / system user token"
              }
              className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-3.5 py-2.5 font-mono text-sm text-on-surface focus:bg-white focus:outline-none"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-on-surface-variant">
              App secret{" "}
              {status.hasAppSecret ? (
                <span className="text-success">(tersimpan)</span>
              ) : null}
            </span>
            <input
              type="password"
              value={appSecret}
              onChange={(event) => setAppSecret(event.target.value)}
              placeholder="Untuk validasi signature webhook"
              className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-3.5 py-2.5 font-mono text-sm text-on-surface focus:bg-white focus:outline-none"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-on-surface-variant">
              Verify token{" "}
              {status.hasVerifyToken ? (
                <span className="text-success">(tersimpan)</span>
              ) : null}
            </span>
            <input
              type="password"
              value={verifyToken}
              onChange={(event) => setVerifyToken(event.target.value)}
              placeholder="Token yang sama di Meta webhook"
              className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-3.5 py-2.5 font-mono text-sm text-on-surface focus:bg-white focus:outline-none"
            />
          </label>
        </div>

        <p className="text-xs text-on-surface-variant">
          Webhook URL (semua bisnis):{" "}
          <code className="rounded bg-surface-container-high px-1.5 py-0.5 font-mono text-[11px]">
            {"{AUTH_URL}/api/webhooks/whatsapp"}
          </code>
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={save}
            disabled={pending || !phoneNumberId.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            <Icon name="save" className="text-[18px]" />
            {pending ? "Saving…" : "Save connection"}
          </button>
          {status.phoneNumberId || status.connected ? (
            <button
              type="button"
              onClick={disconnect}
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-xl border border-error/30 bg-error/10 px-4 py-2.5 text-sm font-semibold text-error hover:bg-error/15 disabled:opacity-60"
            >
              Disconnect
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
