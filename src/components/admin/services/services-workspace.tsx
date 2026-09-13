"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { formatIdr } from "@/lib/services/format";
import type { ServiceRow } from "@/lib/services/types";

type FormState = {
  name: string;
  description: string;
  price: string;
  dpAmount: string;
  durationMin: string;
  isActive: boolean;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  price: "",
  dpAmount: "0",
  durationMin: "",
  isActive: true,
};

function digitsOnly(value: string) {
  return value.replace(/[^\d]/g, "");
}

function toForm(service: ServiceRow): FormState {
  return {
    name: service.name,
    description: service.description ?? "",
    price: String(service.price),
    dpAmount: String(service.dpAmount),
    durationMin:
      service.durationMin === null || service.durationMin === undefined
        ? ""
        : String(service.durationMin),
    isActive: service.isActive,
  };
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-[11px] font-medium tracking-wide text-on-surface-variant uppercase">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="mt-1.5 block text-[11px] text-on-surface-variant">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

function MoneyPreview({ value }: { value: string }) {
  const amount = Number(digitsOnly(value) || "0");
  if (!digitsOnly(value)) {
    return null;
  }
  return (
    <p className="mt-1.5 font-mono text-[11px] text-primary-dark">
      {formatIdr(amount)}
    </p>
  );
}

export function ServicesWorkspace({
  services,
}: {
  services: ServiceRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [selectedId, setSelectedId] = useState<string | null>(
    services[0]?.id ?? null,
  );
  const [mode, setMode] = useState<"view" | "create" | "edit">("view");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return services.filter((item) => {
      if (filter === "active" && !item.isActive) return false;
      if (filter === "inactive" && item.isActive) return false;
      if (!needle) return true;
      return (
        item.name.toLowerCase().includes(needle) ||
        (item.description?.toLowerCase().includes(needle) ?? false)
      );
    });
  }, [services, query, filter]);

  const selected =
    visible.find((item) => item.id === selectedId) ??
    services.find((item) => item.id === selectedId) ??
    visible[0] ??
    null;

  const activeCount = services.filter((item) => item.isActive).length;
  const withDpCount = services.filter((item) => item.dpAmount > 0).length;

  const inputClass =
    "h-11 w-full rounded-xl border border-outline-variant bg-surface-container-low px-3.5 text-sm text-on-surface focus:bg-white focus:outline-none";

  function refresh() {
    startTransition(() => router.refresh());
  }

  function openCreate() {
    setMode("create");
    setForm(emptyForm);
    setError(null);
    setMessage(null);
  }

  function openEdit(service: ServiceRow) {
    setSelectedId(service.id);
    setMode("edit");
    setForm(toForm(service));
    setError(null);
    setMessage(null);
  }

  function cancelForm() {
    setMode("view");
    setError(null);
    if (selected) {
      setForm(toForm(selected));
    } else {
      setForm(emptyForm);
    }
  }

  async function saveForm() {
    setError(null);
    setMessage(null);

    if (!form.name.trim()) {
      setError("Nama layanan wajib diisi.");
      return;
    }
    if (!digitsOnly(form.price)) {
      setError("Harga wajib diisi.");
      return;
    }

    const payload = {
      name: form.name,
      description: form.description || null,
      price: Number(digitsOnly(form.price)),
      dpAmount: Number(digitsOnly(form.dpAmount) || "0"),
      durationMin: form.durationMin.trim()
        ? Number(form.durationMin)
        : null,
      isActive: form.isActive,
    };

    const response =
      mode === "create"
        ? await fetch("/api/services", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/services/${selected?.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

    const body = (await response.json()) as {
      service?: ServiceRow;
      error?: string;
    };

    if (!response.ok || !body.service) {
      setError(body.error ?? "Gagal menyimpan layanan.");
      return;
    }

    setSelectedId(body.service.id);
    setMode("view");
    setMessage(mode === "create" ? "Layanan ditambahkan." : "Layanan diperbarui.");
    refresh();
  }

  async function toggleActive(service: ServiceRow) {
    await fetch(`/api/services/${service.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !service.isActive }),
    });
    refresh();
  }

  async function removeService(service: ServiceRow) {
    if (!window.confirm(`Hapus “${service.name}” dari katalog?`)) {
      return;
    }
    const response = await fetch(`/api/services/${service.id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setError(body.error ?? "Gagal menghapus.");
      return;
    }
    setSelectedId(null);
    setMode("view");
    setMessage("Layanan dihapus.");
    refresh();
  }

  const editing = mode === "create" || mode === "edit";

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface">
            Services
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">
            Katalog treatment & harga. Dipakai AI saat tawarkan DP atau bayar
            lunas.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"
        >
          <Icon name="add" className="text-[18px]" />
          Add service
        </button>
      </div>

      {message ? (
        <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success">
          {message}
        </div>
      ) : null}
      {error && !editing ? (
        <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm font-medium text-error">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            label: "Total services",
            value: String(services.length),
            hint: "Semua katalog",
            icon: "medical_services",
          },
          {
            label: "Active",
            value: String(activeCount),
            hint: "Bisa ditawarkan AI",
            icon: "verified",
          },
          {
            label: "With DP",
            value: String(withDpCount),
            hint: "Ada opsi down payment",
            icon: "payments",
          },
        ].map((card) => (
          <article
            key={card.label}
            className="rounded-2xl border border-outline-variant bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium tracking-wide text-on-surface-variant uppercase">
                  {card.label}
                </p>
                <p className="mt-1.5 text-2xl font-semibold tracking-tight text-on-surface">
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-on-surface-variant">{card.hint}</p>
              </div>
              <div className="flex size-9 items-center justify-center rounded-xl bg-surface-container-high">
                <Icon name={card.icon} className="text-[18px] text-primary-dark" />
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
        <section className="overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm xl:col-span-4">
          <div className="space-y-3 border-b border-outline-variant p-4">
            <div className="relative">
              <Icon
                name="search"
                className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[18px] text-outline"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari layanan…"
                className="h-11 w-full rounded-xl border border-transparent bg-surface-container-low pr-3 pl-11 text-sm text-on-surface placeholder:text-outline focus:border-outline-variant focus:bg-white focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  ["all", "All"],
                  ["active", "Active"],
                  ["inactive", "Inactive"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilter(id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    filter === id
                      ? "bg-primary text-white"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="font-mono text-[11px] text-on-surface-variant">
              {visible.length} shown · {services.length} total
            </p>
          </div>

          {visible.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Icon
                name="medical_services"
                className="text-[32px] text-outline"
              />
              <p className="mt-2 text-sm font-medium text-on-surface">
                Belum ada layanan.
              </p>
              <p className="mt-1 text-xs text-on-surface-variant">
                Tambah treatment untuk mulai isi katalog harga.
              </p>
            </div>
          ) : (
            <ul className="max-h-[860px] divide-y divide-outline-variant overflow-y-auto">
              {visible.map((item) => {
                const active = selected?.id === item.id && mode !== "create";
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(item.id);
                        setMode("view");
                        setError(null);
                        setMessage(null);
                      }}
                      className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors ${
                        active
                          ? "bg-primary/10"
                          : "hover:bg-surface-container-low/80"
                      }`}
                    >
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-secondary/20 bg-secondary/10">
                        <Icon
                          name="spa"
                          className="text-[20px] text-secondary"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-on-surface">
                              {item.name}
                            </p>
                            <p className="mt-0.5 text-xs font-semibold text-primary-dark">
                              {formatIdr(item.price)}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                              item.isActive
                                ? "border-success/30 bg-success/15 text-success"
                                : "border-outline-variant bg-surface-container-high text-on-surface-variant"
                            }`}
                          >
                            {item.isActive ? "Active" : "Off"}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {item.dpAmount > 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[10px] font-semibold text-warning">
                              DP {formatIdr(item.dpAmount)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-outline-variant bg-surface-container-high px-2 py-0.5 text-[10px] font-medium text-on-surface-variant">
                              Full only
                            </span>
                          )}
                          {item.durationMin ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-outline-variant bg-surface-container-high px-2 py-0.5 text-[10px] font-medium text-on-surface-variant">
                              <Icon name="schedule" className="text-[12px]" />
                              {item.durationMin}m
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="xl:sticky xl:top-4 xl:col-span-8 xl:max-h-[calc(100vh-5.5rem)] xl:overflow-y-auto">
          {editing ? (
            <aside className="rounded-2xl border border-outline-variant bg-white shadow-sm">
              <div className="border-b border-outline-variant bg-linear-to-br from-surface-container-low via-white to-white px-5 py-5 sm:px-6">
                <h2 className="text-lg font-semibold tracking-tight text-on-surface">
                  {mode === "create" ? "Add service" : "Edit service"}
                </h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Set harga lunas & DP. AI akan membaca nilai ini saat booking.
                </p>
              </div>

              <div className="space-y-4 p-5 sm:p-6">
                {error ? (
                  <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm font-medium text-error">
                    {error}
                  </div>
                ) : null}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Field label="Nama layanan *">
                      <input
                        value={form.name}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                        placeholder="Pico Laser"
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <Field label="Harga lunas (IDR) *" hint="Nominal full payment">
                    <input
                      value={form.price}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          price: digitsOnly(event.target.value),
                        }))
                      }
                      inputMode="numeric"
                      placeholder="1500000"
                      className={inputClass}
                    />
                    <MoneyPreview value={form.price} />
                  </Field>

                  <Field
                    label="DP (IDR)"
                    hint="Isi 0 jika tidak ada opsi DP"
                  >
                    <input
                      value={form.dpAmount}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          dpAmount: digitsOnly(event.target.value),
                        }))
                      }
                      inputMode="numeric"
                      placeholder="300000"
                      className={inputClass}
                    />
                    <MoneyPreview value={form.dpAmount} />
                  </Field>

                  <Field label="Durasi (menit)" hint="Opsional">
                    <input
                      value={form.durationMin}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          durationMin: digitsOnly(event.target.value),
                        }))
                      }
                      inputMode="numeric"
                      placeholder="60"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Status">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={form.isActive}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          isActive: !prev.isActive,
                        }))
                      }
                      className={`flex h-11 w-full items-center justify-between rounded-xl border px-3.5 text-sm font-medium ${
                        form.isActive
                          ? "border-success/30 bg-success/10 text-success"
                          : "border-outline-variant bg-surface-container-low text-on-surface-variant"
                      }`}
                    >
                      {form.isActive ? "Active — ditawarkan AI" : "Inactive"}
                      <span
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          form.isActive ? "bg-success" : "bg-outline-variant"
                        }`}
                      >
                        <span
                          className={`inline-block size-4 rounded-full bg-white transition-transform ${
                            form.isActive ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </span>
                    </button>
                  </Field>

                  <div className="sm:col-span-2">
                    <Field label="Deskripsi">
                      <textarea
                        value={form.description}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            description: event.target.value,
                          }))
                        }
                        rows={3}
                        placeholder="Ringkas untuk AI & staff…"
                        className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none"
                      />
                    </Field>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 border-t border-outline-variant pt-4">
                  <button
                    type="button"
                    onClick={saveForm}
                    disabled={pending}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
                  >
                    <Icon name="save" className="text-[18px]" />
                    {pending ? "Saving…" : "Save service"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelForm}
                    className="rounded-xl border border-outline-variant px-4 py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-container-low"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </aside>
          ) : !selected ? (
            <aside className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant bg-white px-6 py-16 text-center shadow-sm">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-surface-container-high">
                <Icon
                  name="medical_services"
                  className="text-[28px] text-on-surface-variant"
                />
              </div>
              <p className="mt-4 text-sm font-semibold text-on-surface">
                Pilih layanan
              </p>
              <p className="mt-1 max-w-sm text-sm text-on-surface-variant">
                Atau tambah treatment baru untuk mulai set harga & DP.
              </p>
              <button
                type="button"
                onClick={openCreate}
                className="mt-5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                Add service
              </button>
            </aside>
          ) : (
            <aside className="overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm">
              <div className="border-b border-outline-variant bg-linear-to-br from-surface-container-low via-white to-white px-5 py-5 sm:px-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-secondary/20 bg-secondary/10">
                      <Icon
                        name="spa"
                        className="text-[28px] text-secondary"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-semibold tracking-tight text-on-surface">
                          {selected.name}
                        </h2>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                            selected.isActive
                              ? "border-success/30 bg-success/15 text-success"
                              : "border-outline-variant bg-surface-container-high text-on-surface-variant"
                          }`}
                        >
                          {selected.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      {selected.description ? (
                        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-on-surface-variant">
                          {selected.description}
                        </p>
                      ) : (
                        <p className="mt-1.5 text-sm text-on-surface-variant/70 italic">
                          Belum ada deskripsi
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(selected)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant bg-white px-3.5 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container-low"
                    >
                      <Icon name="edit" className="text-[16px]" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActive(selected)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant bg-white px-3.5 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container-low"
                    >
                      <Icon
                        name={selected.isActive ? "visibility_off" : "visibility"}
                        className="text-[16px]"
                      />
                      {selected.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeService(selected)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-error/30 bg-error/10 px-3.5 py-2 text-sm font-semibold text-error hover:bg-error/15"
                    >
                      <Icon name="delete" className="text-[16px]" />
                      Hapus
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-center gap-2 text-primary-dark">
                      <Icon name="sell" className="text-[18px]" />
                      <p className="text-[11px] font-medium tracking-wide uppercase">
                        Harga lunas
                      </p>
                    </div>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-on-surface">
                      {formatIdr(selected.price)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-warning/25 bg-warning/5 p-4">
                    <div className="flex items-center gap-2 text-warning">
                      <Icon name="payments" className="text-[18px]" />
                      <p className="text-[11px] font-medium tracking-wide uppercase">
                        Down payment
                      </p>
                    </div>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-on-surface">
                      {selected.dpAmount > 0
                        ? formatIdr(selected.dpAmount)
                        : "—"}
                    </p>
                    <p className="mt-1 text-xs text-on-surface-variant">
                      {selected.dpAmount > 0
                        ? `Sisa ${formatIdr(selected.price - selected.dpAmount)}`
                        : "Hanya opsi bayar penuh"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-4">
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <Icon name="schedule" className="text-[18px]" />
                      <p className="text-[11px] font-medium tracking-wide uppercase">
                        Durasi
                      </p>
                    </div>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-on-surface">
                      {selected.durationMin
                        ? `${selected.durationMin}`
                        : "—"}
                      {selected.durationMin ? (
                        <span className="ml-1 text-sm font-medium text-on-surface-variant">
                          menit
                        </span>
                      ) : null}
                    </p>
                  </div>
                </div>

                <section className="rounded-2xl border border-outline-variant bg-surface-container-low/50 p-4">
                  <h3 className="text-sm font-semibold text-on-surface">
                    Ringkasan untuk AI
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                    Saat pasien booking <strong>{selected.name}</strong>, AI
                    bisa tawarkan{" "}
                    {selected.dpAmount > 0 ? (
                      <>
                        DP <strong>{formatIdr(selected.dpAmount)}</strong> atau
                        lunas <strong>{formatIdr(selected.price)}</strong>
                      </>
                    ) : (
                      <>
                        bayar lunas <strong>{formatIdr(selected.price)}</strong>
                      </>
                    )}
                    {selected.isActive
                      ? "."
                      : " — tapi layanan ini sedang nonaktif."}
                  </p>
                </section>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
