"use client";

import {
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ContactLifecycle, FollowUpType } from "@prisma/client";
import {
  ChannelBadge,
  InitialsAvatar,
} from "@/components/admin/chat-workspace/chat-bits";
import { Icon } from "@/components/ui/icon";
import { LIFECYCLE_ORDER, LIFECYCLE_LABELS } from "@/lib/crm/labels";
import type {
  CrmContactDetail,
  CrmTag,
  CrmWorkspacePayload,
} from "@/lib/crm/types";

type FilterId = "all" | ContactLifecycle | "needs_reply" | "follow_up";

function tagTone(color: string) {
  switch (color) {
    case "success":
      return "bg-success/10 text-success";
    case "warning":
      return "bg-warning/15 text-on-surface";
    case "info":
      return "bg-info/10 text-info";
    case "secondary":
      return "bg-secondary/10 text-secondary";
    default:
      return "bg-primary/10 text-primary-dark";
  }
}

function lifecycleTone(lifecycle: ContactLifecycle) {
  switch (lifecycle) {
    case "NEW_LEAD":
      return "bg-info/10 text-info";
    case "CONTACTED":
    case "INTERESTED":
      return "bg-primary/10 text-primary-dark";
    case "BOOKED":
    case "CUSTOMER":
    case "RETURNING":
      return "bg-success/10 text-success";
    case "INACTIVE":
      return "bg-surface-container-high text-on-surface-variant";
    case "LOST":
      return "bg-warning/15 text-on-surface";
    default:
      return "bg-surface-container-high text-on-surface-variant";
  }
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-outline-variant px-5 py-5 last:border-b-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-on-surface">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function ContactDetailPanel({
  contact,
  availableTags,
  customerSingular,
  chatBaseHref,
}: {
  contact: CrmContactDetail;
  availableTags: CrmTag[];
  customerSingular: string;
  chatBaseHref: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const [followUpType, setFollowUpType] = useState<FollowUpType>("NO_BOOKING");
  const [followUpDue, setFollowUpDue] = useState("");
  const [followUpNote, setFollowUpNote] = useState("");
  const [copied, setCopied] = useState(false);

  function refresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  async function patchContact(payload: Record<string, unknown>) {
    await fetch(`/api/crm/contacts/${contact.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    refresh();
  }

  async function submitNote() {
    if (!note.trim()) {
      return;
    }
    await fetch(`/api/crm/contacts/${contact.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: note }),
    });
    setNote("");
    refresh();
  }

  async function toggleTag(tagId: string) {
    await fetch(`/api/crm/contacts/${contact.id}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagId }),
    });
    refresh();
  }

  async function createFollowUp() {
    if (!followUpDue) {
      return;
    }
    await fetch(`/api/crm/contacts/${contact.id}/follow-ups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: followUpType,
        dueAt: `${followUpDue}T09:00:00`,
        note: followUpNote,
      }),
    });
    setFollowUpDue("");
    setFollowUpNote("");
    refresh();
  }

  async function completeFollowUp(completeId: string) {
    await fetch(`/api/crm/contacts/${contact.id}/follow-ups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completeId }),
    });
    refresh();
  }

  async function copyPhone() {
    try {
      await navigator.clipboard.writeText(contact.phone);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  const selectedTagIds = new Set(contact.tags.map((tag) => tag.id));
  const pendingFollowUps = contact.followUps.filter(
    (item) => item.status === "PENDING",
  );

  return (
    <aside className="overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm">
      <div className="border-b border-outline-variant bg-surface-container-low/40 p-5">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <InitialsAvatar initials={contact.initials} size="lg" featured />
            <ChannelBadge channel={contact.channel} size="md" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl font-semibold text-on-surface">
                {contact.name}
              </h2>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${lifecycleTone(contact.lifecycle)}`}
              >
                {contact.lifecycleLabel}
              </span>
            </div>
            <p className="mt-1 text-sm text-on-surface-variant">
              {contact.sourceLabel} · Last interaction:{" "}
              {contact.lastRelativeLabel}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyPhone}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-sm text-on-surface shadow-sm"
              >
                <Icon name="call" className="text-[16px]" />
                {contact.phone}
                <Icon
                  name={copied ? "check" : "content_copy"}
                  className="text-[14px]"
                />
              </button>
              {contact.conversationId ? (
                <Link
                  href={`${chatBaseHref}?c=${contact.conversationId}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark"
                >
                  Open chat
                  <Icon name="arrow_forward" className="text-[16px]" />
                </Link>
              ) : null}
            </div>
          </div>
        </div>
        {pending ? (
          <p className="mt-3 text-xs text-on-surface-variant">Saving…</p>
        ) : null}
      </div>

      <Section title="1. Customer profile">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            ["Name", contact.name],
            ["WhatsApp", contact.phone],
            ["Email", contact.email || "Belum diisi"],
            ["Gender", contact.genderLabel],
            ["Birth date", contact.birthDateLabel || "—"],
            ["Source", contact.sourceLabel],
            ["First contact", contact.firstContactLabel],
            ["Last interaction", contact.lastMessageLabel],
            ["Assigned staff", contact.assignedStaff || "Unassigned"],
            ["Potential value", contact.potentialValueLabel || "—"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl bg-surface-container-low px-3 py-2.5"
            >
              <dt className="text-[11px] tracking-wide text-on-surface-variant uppercase">
                {label}
              </dt>
              <dd className="mt-0.5 text-sm font-medium text-on-surface">
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-on-surface-variant">
          Catatan: data medis sensitif tidak disimpan di CRM umum — hanya info
          operasional {customerSingular.toLowerCase()}.
        </p>
      </Section>

      <Section
        title="2. Conversation history"
        action={
          contact.conversationId ? (
            <Link
              href={`${chatBaseHref}?c=${contact.conversationId}`}
              className="text-xs font-semibold text-primary-dark hover:underline"
            >
              Open full chat
            </Link>
          ) : null
        }
      >
        {contact.recentMessages.length === 0 ? (
          <p className="text-sm text-on-surface-variant">
            Belum ada percakapan tersimpan.
          </p>
        ) : (
          <ul className="space-y-2">
            {contact.recentMessages.map((message) => {
              const inbound = message.direction === "INBOUND";
              return (
                <li
                  key={message.id}
                  className={`rounded-xl px-3 py-2.5 ${
                    inbound ? "bg-surface-container-low" : "bg-primary/10"
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold tracking-wide text-on-surface-variant uppercase">
                      {inbound ? "Customer" : "AI / Team"}
                    </span>
                    <span className="text-[11px] text-outline">
                      {message.timeLabel}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-on-surface">
                    {message.text}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section title="3. Booking / transaction history">
        <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            ["Total booking", String(contact.bookingStats.total)],
            ["Total spending", contact.bookingStats.totalSpendLabel],
            ["Last booking", contact.bookingStats.lastBookingLabel || "—"],
            ["Next booking", contact.bookingStats.nextBookingLabel || "—"],
            ["Completed", String(contact.bookingStats.completed)],
            ["Cancelled", String(contact.bookingStats.cancelled)],
            ["No-show", String(contact.bookingStats.noShow)],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl bg-surface-container-low px-3 py-2"
            >
              <p className="text-[11px] text-on-surface-variant">{label}</p>
              <p className="text-sm font-semibold text-on-surface">{value}</p>
            </div>
          ))}
        </div>

        {contact.bookings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-outline-variant px-4 py-6 text-center">
            <p className="text-sm font-medium text-on-surface">
              Belum ada booking
            </p>
            <p className="mt-1 text-xs text-on-surface-variant">
              Riwayat service akan muncul di sini saat appointment engine aktif.
              Schema `CrmBooking` sudah siap.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-outline-variant">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-surface-container-low text-xs text-on-surface-variant uppercase">
                <tr>
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Service</th>
                  <th className="px-3 py-2 font-medium">Staff</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {contact.bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-t border-outline-variant"
                  >
                    <td className="px-3 py-2">{booking.dateLabel}</td>
                    <td className="px-3 py-2">{booking.service}</td>
                    <td className="px-3 py-2">{booking.staffName}</td>
                    <td className="px-3 py-2">{booking.statusLabel}</td>
                    <td className="px-3 py-2 font-medium">
                      {booking.amountLabel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="4. Customer tags">
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => {
            const active = selectedTagIds.has(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? tagTone(tag.color)
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                {active ? "✓ " : "+ "}
                {tag.name}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="5. Lead / sales pipeline">
        <label className="mb-2 block text-xs text-on-surface-variant">
          Current stage
        </label>
        <select
          value={contact.lifecycle}
          onChange={(event) =>
            patchContact({
              lifecycle: event.target.value as ContactLifecycle,
            })
          }
          className="h-10 w-full rounded-xl border border-outline-variant bg-white px-3 text-sm text-on-surface"
        >
          {LIFECYCLE_ORDER.map((stage) => (
            <option key={stage} value={stage}>
              {LIFECYCLE_LABELS[stage]}
            </option>
          ))}
        </select>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {LIFECYCLE_ORDER.slice(0, 6).map((stage) => (
            <span
              key={stage}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                stage === contact.lifecycle
                  ? "bg-primary text-white"
                  : "bg-surface-container-low text-on-surface-variant"
              }`}
            >
              {LIFECYCLE_LABELS[stage]}
            </span>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-xl bg-surface-container-low px-3 py-2.5">
            <p className="text-[11px] text-on-surface-variant">Lead source</p>
            <p className="text-sm font-medium text-on-surface">
              {contact.sourceLabel}
            </p>
          </div>
          <div className="rounded-xl bg-surface-container-low px-3 py-2.5">
            <p className="text-[11px] text-on-surface-variant">Assigned staff</p>
            <p className="text-sm font-medium text-on-surface">
              {contact.assignedStaff || "Unassigned"}
            </p>
          </div>
        </div>
      </Section>

      <Section title="6. Notes & internal info">
        <div className="space-y-2">
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder='Contoh: "Customer lebih suka appointment pagi."'
            className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface placeholder:text-outline focus:bg-white focus:outline-none"
          />
          <button
            type="button"
            onClick={submitNote}
            className="rounded-xl bg-secondary px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
          >
            Add note
          </button>
        </div>
        <ul className="mt-4 space-y-2">
          {contact.notes.length === 0 ? (
            <li className="text-sm text-on-surface-variant">
              Belum ada catatan internal.
            </li>
          ) : (
            contact.notes.map((item) => (
              <li
                key={item.id}
                className="rounded-xl bg-surface-container-low px-3 py-2.5"
              >
                <p className="text-sm text-on-surface">{item.body}</p>
                <p className="mt-1 text-[11px] text-outline">
                  {item.authorName} · {item.timeLabel}
                </p>
              </li>
            ))
          )}
        </ul>
      </Section>

      <Section title="7. Follow-up">
        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <select
            value={followUpType}
            onChange={(event) =>
              setFollowUpType(event.target.value as FollowUpType)
            }
            className="h-10 rounded-xl border border-outline-variant bg-white px-3 text-sm"
          >
            <option value="BOOKING">Follow up booking</option>
            <option value="REMINDER">Reminder appointment</option>
            <option value="POST_SERVICE">Post-service</option>
            <option value="PROMO">Promo</option>
            <option value="UNREPLIED">Belum membalas</option>
            <option value="NO_BOOKING">Belum booking</option>
            <option value="CUSTOM">Custom</option>
          </select>
          <input
            type="date"
            value={followUpDue}
            onChange={(event) => setFollowUpDue(event.target.value)}
            className="h-10 rounded-xl border border-outline-variant bg-white px-3 text-sm"
          />
          <button
            type="button"
            onClick={createFollowUp}
            className="h-10 rounded-xl bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Schedule
          </button>
        </div>
        <input
          value={followUpNote}
          onChange={(event) => setFollowUpNote(event.target.value)}
          placeholder="Catatan follow-up (opsional)"
          className="mb-4 h-10 w-full rounded-xl border border-outline-variant bg-white px-3 text-sm"
        />

        {pendingFollowUps.length === 0 ? (
          <p className="text-sm text-on-surface-variant">
            Tidak ada follow-up pending.
          </p>
        ) : (
          <ul className="space-y-2">
            {pendingFollowUps.map((item) => (
              <li
                key={item.id}
                className={`rounded-xl px-3 py-3 ${
                  item.overdue ? "bg-warning/15" : "bg-surface-container-low"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      {item.overdue ? "🔴 " : ""}
                      {item.typeLabel}
                    </p>
                    <p className="mt-0.5 text-xs text-on-surface-variant">
                      {item.relativeDue} · {item.dueLabel}
                    </p>
                    {item.note ? (
                      <p className="mt-1 text-sm text-on-surface">{item.note}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => completeFollowUp(item.id)}
                    className="shrink-0 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-on-surface shadow-sm"
                  >
                    Done
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="8. Customer activity timeline">
        {contact.timeline.length === 0 ? (
          <p className="text-sm text-on-surface-variant">Belum ada aktivitas.</p>
        ) : (
          <ol className="relative space-y-4 border-l border-outline-variant pl-4">
            {contact.timeline.map((event) => (
              <li key={event.id} className="relative">
                <span
                  className={`absolute -left-[21px] top-1 size-2.5 rounded-full ${
                    event.tone === "success"
                      ? "bg-success"
                      : event.tone === "warning"
                        ? "bg-warning"
                        : event.tone === "primary"
                          ? "bg-primary"
                          : "bg-outline"
                  }`}
                />
                <p className="text-[11px] font-medium text-outline">
                  {event.timeLabel}
                </p>
                <p className="text-sm font-semibold text-on-surface">
                  {event.title}
                </p>
                {event.detail ? (
                  <p className="mt-0.5 text-sm text-on-surface-variant">
                    {event.detail}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </Section>
    </aside>
  );
}

export function CrmWorkspace({
  data,
  customerPlural,
  customerSingular,
  chatBaseHref,
}: {
  data: CrmWorkspacePayload;
  customerPlural: string;
  customerSingular: string;
  chatBaseHref: string;
}) {
  const { contacts, stats, availableTags, followUpsDue } = data;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");
  const [selectedId, setSelectedId] = useState<string | null>(
    contacts[0]?.id ?? null,
  );

  const filters: { id: FilterId; label: string }[] = [
    { id: "all", label: "All" },
    { id: "needs_reply", label: "Needs reply" },
    { id: "follow_up", label: "Follow-up due" },
    { id: "NEW_LEAD", label: "New Lead" },
    { id: "INTERESTED", label: "Interested" },
    { id: "BOOKED", label: "Booked" },
    { id: "CUSTOMER", label: "Customer" },
    { id: "RETURNING", label: "Returning" },
  ];

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return contacts.filter((item) => {
      if (filter === "needs_reply" && item.unreadCount <= 0) {
        return false;
      }
      if (filter === "follow_up") {
        const dueIds = new Set(followUpsDue.map((f) => f.contactId));
        if (!dueIds.has(item.id)) {
          return false;
        }
      } else if (
        filter !== "all" &&
        filter !== "needs_reply" &&
        item.lifecycle !== filter
      ) {
        return false;
      }
      if (!needle) {
        return true;
      }
      return (
        item.name.toLowerCase().includes(needle) ||
        item.phone.toLowerCase().includes(needle) ||
        item.lastPreview.toLowerCase().includes(needle) ||
        item.tags.some((tag) => tag.name.toLowerCase().includes(needle))
      );
    });
  }, [contacts, filter, followUpsDue, query]);

  const selected =
    visible.find((item) => item.id === selectedId) ??
    visible[0] ??
    contacts.find((item) => item.id === selectedId) ??
    null;

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-on-surface">
          CRM
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-on-surface-variant">
          Profil {customerPlural.toLowerCase()}, riwayat chat, pipeline, tags,
          follow-up, dan timeline — bukan sekadar daftar nama + nomor.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: `Total ${customerPlural}`,
            value: String(stats.total),
            hint: "Semua kontak tersimpan",
            icon: "groups",
          },
          {
            label: "Needs reply",
            value: String(stats.needsReply),
            hint: "Chat belum dibaca",
            icon: "mark_chat_unread",
          },
          {
            label: "Follow-ups due",
            value: String(stats.followUpsDue),
            hint: "Jatuh tempo hari ini / overdue",
            icon: "event_upcoming",
          },
          {
            label: "Pipeline value",
            value: stats.pipelineValueLabel,
            hint: `${stats.newThisMonth} new this month`,
            icon: "payments",
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
                <p className="mt-2 text-3xl font-semibold tracking-tight text-on-surface">
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  {card.hint}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-surface-container-high">
                <Icon name={card.icon} className="text-[20px] text-primary-dark" />
              </div>
            </div>
          </article>
        ))}
      </div>

      {followUpsDue.length > 0 ? (
        <section className="rounded-2xl border border-warning/40 bg-warning/10 p-4">
          <h2 className="mb-3 text-sm font-semibold text-on-surface">
            Follow-up due
          </h2>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {followUpsDue.slice(0, 6).map((item) => (
              <button
                key={`${item.contactId}-${item.followUp.id}`}
                type="button"
                onClick={() => setSelectedId(item.contactId)}
                className="rounded-xl bg-white px-3 py-3 text-left shadow-sm hover:shadow-md"
              >
                <p className="text-sm font-semibold text-on-surface">
                  🔴 {item.contactName}
                </p>
                <p className="mt-0.5 text-xs text-on-surface-variant">
                  {item.tagNames.slice(0, 2).join(" · ") ||
                    item.followUp.typeLabel}
                </p>
                <p className="mt-1 text-xs font-medium text-on-surface">
                  {item.followUp.relativeDue}
                </p>
              </button>
            ))}
          </div>
        </section>
      ) : null}

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
                placeholder={`Search ${customerPlural.toLowerCase()}, phone, tags...`}
                className="h-11 w-full rounded-xl bg-surface-container-low pr-3 pl-11 text-sm text-on-surface placeholder:text-outline focus:bg-white focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {filters.map((item) => {
                const active = filter === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFilter(item.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      active
                        ? "bg-primary text-white"
                        : "bg-surface-container-low text-on-surface-variant"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm font-medium text-on-surface">
                {contacts.length === 0
                  ? `Belum ada ${customerSingular.toLowerCase()}.`
                  : "Tidak ada hasil."}
              </p>
            </div>
          ) : (
            <ul className="max-h-[820px] divide-y divide-outline-variant overflow-y-auto">
              {visible.map((contact) => {
                const active = selected?.id === contact.id;
                return (
                  <li key={contact.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(contact.id)}
                      className={`flex w-full items-start gap-3 px-4 py-4 text-left ${
                        active
                          ? "bg-primary/10"
                          : "hover:bg-surface-container-low/70"
                      }`}
                    >
                      <div className="relative shrink-0">
                        <InitialsAvatar
                          initials={contact.initials}
                          featured={active}
                        />
                        <ChannelBadge channel={contact.channel} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-on-surface">
                              {contact.name}
                            </p>
                            <p className="truncate text-xs text-on-surface-variant">
                              {contact.sourceLabel} · {contact.phone}
                            </p>
                          </div>
                          <p className="shrink-0 text-[11px] text-outline">
                            {contact.lastRelativeLabel}
                          </p>
                        </div>
                        <p className="mt-1.5 line-clamp-2 text-sm text-on-surface-variant">
                          {contact.lastPreview}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${lifecycleTone(contact.lifecycle)}`}
                          >
                            {contact.lifecycleLabel}
                          </span>
                          {contact.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag.id}
                              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${tagTone(tag.color)}`}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="xl:sticky xl:top-4 xl:col-span-7 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto">
          {selected ? (
            <ContactDetailPanel
              contact={selected}
              availableTags={availableTags}
              customerSingular={customerSingular}
              chatBaseHref={chatBaseHref}
            />
          ) : (
            <div className="flex min-h-80 items-center justify-center rounded-2xl border border-dashed border-outline-variant bg-white px-6 py-16 text-center">
              <p className="text-sm text-on-surface-variant">
                Pilih {customerSingular.toLowerCase()} untuk melihat CRM lengkap.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
