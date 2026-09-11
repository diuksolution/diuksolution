"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import type {
  PractitionerRow,
  PractitionerTone,
} from "@/lib/practitioners/types";

const toneClass: Record<PractitionerTone, string> = {
  primary: "bg-primary/10 text-primary-dark",
  secondary: "bg-secondary/10 text-secondary",
  success: "bg-success/10 text-success",
};

type FormState = {
  name: string;
  title: string;
  specialty: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  tone: PractitionerTone;
  isActive: boolean;
};

const emptyForm: FormState = {
  name: "",
  title: "",
  specialty: "",
  email: "",
  phone: "",
  location: "",
  bio: "",
  tone: "primary",
  isActive: true,
};

function toForm(doctor: PractitionerRow): FormState {
  return {
    name: doctor.name,
    title: doctor.title ?? "",
    specialty: doctor.specialty ?? "",
    email: doctor.email ?? "",
    phone: doctor.phone ?? "",
    location: doctor.location ?? "",
    bio: doctor.bio ?? "",
    tone: doctor.tone,
    isActive: doctor.isActive,
  };
}

export function DoctorListWorkspace({
  doctors: initialDoctors,
}: {
  doctors: PractitionerRow[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [banner, setBanner] = useState<string | null>(null);
  const [bannerTone, setBannerTone] = useState<"success" | "error">("success");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "calendar">("all");
  const [selectedId, setSelectedId] = useState<string | null>(
    initialDoctors[0]?.id ?? null,
  );
  const [mode, setMode] = useState<"view" | "create" | "edit">("view");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const doctors = initialDoctors;

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return doctors.filter((item) => {
      if (filter === "active" && !item.isActive) {
        return false;
      }
      if (filter === "calendar" && item.calendarStatus !== "connected") {
        return false;
      }
      if (!needle) {
        return true;
      }
      return (
        item.name.toLowerCase().includes(needle) ||
        (item.specialty?.toLowerCase().includes(needle) ?? false) ||
        (item.email?.toLowerCase().includes(needle) ?? false) ||
        (item.location?.toLowerCase().includes(needle) ?? false)
      );
    });
  }, [doctors, filter, query]);

  const selected =
    visible.find((item) => item.id === selectedId) ??
    doctors.find((item) => item.id === selectedId) ??
    visible[0] ??
    null;

  const connectedCount = doctors.filter(
    (item) => item.calendarStatus === "connected",
  ).length;
  const activeCount = doctors.filter((item) => item.isActive).length;

  useEffect(() => {
    const status = searchParams.get("calendar");
    const message = searchParams.get("message");
    if (status === "connected") {
      setBanner("Google Calendar connected.");
      setBannerTone("success");
    } else if (status === "error") {
      setBanner(message || "Failed to connect Google Calendar.");
      setBannerTone("error");
    }

    if (status) {
      const url = new URL(window.location.href);
      url.searchParams.delete("calendar");
      url.searchParams.delete("message");
      window.history.replaceState({}, "", url.pathname);
    }
  }, [searchParams]);

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function disconnectCalendar(doctor: PractitionerRow) {
    const ok = window.confirm(
      `Disconnect Google Calendar from ${doctor.name}?`,
    );
    if (!ok) {
      return;
    }

    await fetch("/api/integrations/google-calendar/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ practitionerId: doctor.id }),
    });
    refresh();
  }

  function openCreate() {
    setMode("create");
    setForm(emptyForm);
    setError(null);
  }

  function openEdit(doctor: PractitionerRow) {
    setSelectedId(doctor.id);
    setMode("edit");
    setForm(toForm(doctor));
    setError(null);
  }

  async function saveForm() {
    setError(null);
    if (!form.name.trim()) {
      setError("Nama dokter wajib diisi.");
      return;
    }

    const payload = {
      name: form.name,
      title: form.title || null,
      specialty: form.specialty || null,
      email: form.email || null,
      phone: form.phone || null,
      location: form.location || null,
      bio: form.bio || null,
      tone: form.tone,
      isActive: form.isActive,
    };

    const response =
      mode === "create"
        ? await fetch("/api/practitioners", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/practitioners/${selected?.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error || "Gagal menyimpan dokter.");
      return;
    }

    const data = (await response.json()) as { practitioner: PractitionerRow };
    setSelectedId(data.practitioner.id);
    setMode("view");
    refresh();
  }

  async function toggleActive(doctor: PractitionerRow) {
    await fetch(`/api/practitioners/${doctor.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !doctor.isActive }),
    });
    refresh();
  }

  async function removeDoctor(doctor: PractitionerRow) {
    const ok = window.confirm(`Hapus ${doctor.name} dari doctor list?`);
    if (!ok) {
      return;
    }
    await fetch(`/api/practitioners/${doctor.id}`, { method: "DELETE" });
    setSelectedId(null);
    setMode("view");
    refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface">
            Doctor List
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">
            Roster dokter klinik. Nanti tiap dokter bisa dihubungkan ke Google
            Calendar-nya sendiri untuk cek slot & sync booking.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          <Icon name="person_add" className="text-[18px]" />
          Add doctor
        </button>
      </div>

      {banner ? (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            bannerTone === "success"
              ? "bg-success/10 text-success"
              : "bg-warning/15 text-on-surface"
          }`}
        >
          {banner}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: "Total doctors",
            value: String(doctors.length),
            hint: "Semua roster",
            icon: "stethoscope",
          },
          {
            label: "Active",
            value: String(activeCount),
            hint: "Bisa di-assign booking",
            icon: "verified_user",
          },
          {
            label: "Calendar connected",
            value: String(connectedCount),
            hint: "Siap sync Google Calendar",
            icon: "calendar_month",
          },
        ].map((card) => (
          <article
            key={card.label}
            className="rounded-2xl border border-outline-variant bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium tracking-wide text-on-surface-variant uppercase">
                  {card.label}
                </p>
                <p className="mt-2 text-3xl font-semibold text-on-surface">
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-on-surface-variant">{card.hint}</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-surface-container-high">
                <Icon name={card.icon} className="text-[20px] text-primary-dark" />
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
        <section className="overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm xl:col-span-5">
          <div className="space-y-3 border-b border-outline-variant p-4">
            <div className="relative">
              <Icon
                name="search"
                className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[18px] text-outline"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search doctor, specialty, suite..."
                className="h-11 w-full rounded-xl bg-surface-container-low pr-3 pl-11 text-sm text-on-surface placeholder:text-outline focus:bg-white focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  ["all", "All"],
                  ["active", "Active"],
                  ["calendar", "Calendar ready"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilter(id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    filter === id
                      ? "bg-primary text-white"
                      : "bg-surface-container-low text-on-surface-variant"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm font-medium text-on-surface">
                Belum ada dokter.
              </p>
              <p className="mt-1 text-sm text-on-surface-variant">
                Tambah dokter supaya bisa dihubungkan ke Google Calendar.
              </p>
            </div>
          ) : (
            <ul className="max-h-[720px] divide-y divide-outline-variant overflow-y-auto">
              {visible.map((doctor) => {
                const active = selected?.id === doctor.id && mode !== "create";
                return (
                  <li key={doctor.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(doctor.id);
                        setMode("view");
                      }}
                      className={`flex w-full items-start gap-3 px-4 py-4 text-left ${
                        active
                          ? "bg-primary/10"
                          : "hover:bg-surface-container-low/70"
                      }`}
                    >
                      <div
                        className={`flex size-11 shrink-0 items-center justify-center rounded-full text-xs font-bold ${toneClass[doctor.tone]}`}
                      >
                        {doctor.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-on-surface">
                              {doctor.name}
                              {doctor.title ? (
                                <span className="font-medium text-on-surface-variant">
                                  {" "}
                                  {doctor.title}
                                </span>
                              ) : null}
                            </p>
                            <p className="truncate text-xs text-on-surface-variant">
                              {doctor.displaySpecialty}
                            </p>
                          </div>
                          {doctor.isActive ? (
                            <span className="shrink-0 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
                              Active
                            </span>
                          ) : (
                            <span className="shrink-0 rounded-full bg-surface-container-high px-2 py-0.5 text-[11px] font-semibold text-on-surface-variant">
                              Inactive
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {doctor.calendarStatus === "connected" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary-dark">
                              <Icon name="check_circle" className="text-[12px]" />
                              Calendar connected
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-high px-2 py-0.5 text-[11px] font-medium text-on-surface-variant">
                              <Icon name="link_off" className="text-[12px]" />
                              Calendar not connected
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="xl:col-span-7">
          {mode === "create" || mode === "edit" ? (
            <aside className="rounded-2xl border border-outline-variant bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-on-surface">
                {mode === "create" ? "Add doctor" : "Edit doctor"}
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Data dasar dokter. Koneksi Google Calendar menyusul per dokter.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(
                  [
                    ["name", "Full name *", "Dr. Sarah Wijaya"],
                    ["title", "Title", "Sp.KK"],
                    ["specialty", "Specialty", "Dermatologist"],
                    ["location", "Suite / room", "Suite 2"],
                    ["email", "Email", "doctor@clinic.com"],
                    ["phone", "Phone", "+62812..."],
                  ] as const
                ).map(([key, label, placeholder]) => (
                  <label key={key} className="block text-sm">
                    <span className="mb-1.5 block text-xs font-medium text-on-surface-variant">
                      {label}
                    </span>
                    <input
                      value={form[key]}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          [key]: event.target.value,
                        }))
                      }
                      placeholder={placeholder}
                      className="h-11 w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 text-sm text-on-surface focus:bg-white focus:outline-none"
                    />
                  </label>
                ))}
              </div>

              <label className="mt-3 block text-sm">
                <span className="mb-1.5 block text-xs font-medium text-on-surface-variant">
                  Bio / notes
                </span>
                <textarea
                  value={form.bio}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, bio: event.target.value }))
                  }
                  rows={3}
                  placeholder="Fokus treatment acne, prefer appointment pagi..."
                  className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2 text-sm focus:bg-white focus:outline-none"
                />
              </label>

              <div className="mt-3 flex flex-wrap items-center gap-4">
                <label className="text-sm">
                  <span className="mb-1.5 block text-xs font-medium text-on-surface-variant">
                    Accent
                  </span>
                  <select
                    value={form.tone}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        tone: event.target.value as PractitionerTone,
                      }))
                    }
                    className="h-11 rounded-xl border border-outline-variant bg-white px-3 text-sm"
                  >
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="success">Success</option>
                  </select>
                </label>
                <label className="mt-5 inline-flex items-center gap-2 text-sm text-on-surface">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        isActive: event.target.checked,
                      }))
                    }
                    className="size-4 rounded border-outline-variant"
                  />
                  Active (bisa di-book)
                </label>
              </div>

              {error ? (
                <p className="mt-3 text-sm text-warning">{error}</p>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={saveForm}
                  disabled={pending}
                  className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
                >
                  {mode === "create" ? "Save doctor" : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("view")}
                  className="rounded-xl bg-surface-container-high px-4 py-2.5 text-sm font-semibold text-on-surface"
                >
                  Cancel
                </button>
              </div>
            </aside>
          ) : selected ? (
            <aside className="rounded-2xl border border-outline-variant bg-white shadow-sm">
              <div className="border-b border-outline-variant p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex size-16 shrink-0 items-center justify-center rounded-full text-lg font-bold ${toneClass[selected.tone]}`}
                  >
                    {selected.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold text-on-surface">
                        {selected.name}
                      </h2>
                      {selected.title ? (
                        <span className="text-sm text-on-surface-variant">
                          {selected.title}
                        </span>
                      ) : null}
                      {selected.isActive ? (
                        <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-[11px] font-semibold text-on-surface-variant">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {selected.displaySpecialty}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(selected)}
                        className="rounded-xl bg-secondary px-3 py-2 text-xs font-semibold text-white"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleActive(selected)}
                        className="rounded-xl bg-surface-container-high px-3 py-2 text-xs font-semibold text-on-surface"
                      >
                        {selected.isActive ? "Set inactive" : "Set active"}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeDoctor(selected)}
                        className="rounded-xl bg-warning/15 px-3 py-2 text-xs font-semibold text-on-surface"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 border-b border-outline-variant p-6 sm:grid-cols-2">
                {[
                  ["Email", selected.email || "—"],
                  ["Phone", selected.phone || "—"],
                  ["Location", selected.location || "—"],
                  ["Timezone", selected.timezone],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl bg-surface-container-low px-3 py-2.5"
                  >
                    <p className="text-[11px] tracking-wide text-on-surface-variant uppercase">
                      {label}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-on-surface">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {selected.bio ? (
                <div className="border-b border-outline-variant px-6 py-5">
                  <h3 className="text-sm font-semibold text-on-surface">Bio</h3>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                    {selected.bio}
                  </p>
                </div>
              ) : null}

              <div className="p-6">
                <h3 className="text-sm font-semibold text-on-surface">
                  Google Calendar
                </h3>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Booking dokter ini nanti bisa cek availability & write event ke
                  calendar pribadinya.
                </p>

                {selected.calendarStatus === "connected" ? (
                  <div className="mt-4 space-y-3">
                    <div className="rounded-xl bg-success/10 px-4 py-3">
                      <p className="text-sm font-semibold text-success">
                        Connected as {selected.googleAccountEmail}
                      </p>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        Calendar ID: {selected.googleCalendarId}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={`/api/integrations/google-calendar/connect?practitionerId=${selected.id}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-surface-container-high px-3 py-2 text-xs font-semibold text-on-surface"
                      >
                        <Icon name="sync" className="text-[16px]" />
                        Reconnect
                      </a>
                      <button
                        type="button"
                        onClick={() => disconnectCalendar(selected)}
                        className="inline-flex items-center gap-2 rounded-xl bg-warning/15 px-3 py-2 text-xs font-semibold text-on-surface"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-dashed border-outline-variant px-4 py-5">
                    <p className="text-sm font-medium text-on-surface">
                      Belum terhubung
                    </p>
                    <p className="mt-1 text-xs text-on-surface-variant">
                      Login pakai akun Google dokter ini, lalu izinkan akses
                      Calendar. Token & calendar ID akan tersimpan otomatis.
                    </p>
                    <a
                      href={`/api/integrations/google-calendar/connect?practitionerId=${selected.id}`}
                      className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-dark"
                    >
                      <Icon name="link" className="text-[16px]" />
                      Connect Google Calendar
                    </a>
                  </div>
                )}

                <div className="mt-4 rounded-xl bg-surface-container-low px-4 py-3 text-xs text-on-surface-variant">
                  <p className="font-semibold text-on-surface">Cara connect</p>
                  <ul className="mt-2 list-disc space-y-1 pl-4">
                    <li>Klik Connect Google Calendar</li>
                    <li>Pilih akun Google milik dokter</li>
                    <li>Izinkan akses Calendar</li>
                    <li>DIUK otomatis pakai calendar primary</li>
                  </ul>
                </div>
              </div>
            </aside>
          ) : (
            <div className="flex min-h-80 items-center justify-center rounded-2xl border border-dashed border-outline-variant bg-white px-6 py-16 text-center">
              <div>
                <p className="text-sm font-medium text-on-surface">
                  Pilih dokter
                </p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Atau tambah dokter baru untuk mulai isi roster.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
