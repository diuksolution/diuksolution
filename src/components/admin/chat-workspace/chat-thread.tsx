"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ChatConversation } from "@/lib/chat/types";
import { InitialsAvatar } from "@/components/admin/chat-workspace/chat-bits";
import { Icon } from "@/components/ui/icon";

function channelMeta(channel: ChatConversation["channel"]) {
  if (channel === "instagram") {
    return {
      label: "Instagram",
      icon: "photo_camera",
      className: "bg-secondary/10 text-secondary",
    };
  }
  if (channel === "web") {
    return {
      label: "Website",
      icon: "language",
      className: "bg-info/10 text-info",
    };
  }
  return {
    label: "WhatsApp",
    icon: "chat",
    className: "bg-success/10 text-success",
  };
}

function DeliveryTicks({
  status,
}: {
  status?: "PENDING" | "SENT" | "DELIVERED" | "READ" | "FAILED";
}) {
  if (!status || status === "PENDING") {
    return (
      <span title="Pending">
        <Icon name="schedule" className="text-[14px] text-white/70" />
      </span>
    );
  }

  if (status === "FAILED") {
    return (
      <span title="Failed">
        <Icon name="error" className="text-[14px] text-warning" />
      </span>
    );
  }

  if (status === "SENT") {
    return (
      <span title="Sent">
        <Icon name="done" className="text-[14px] text-white/70" />
      </span>
    );
  }

  if (status === "DELIVERED") {
    return (
      <span title="Delivered">
        <Icon name="done_all" className="text-[14px] text-white/70" />
      </span>
    );
  }

  return (
    <span title="Read">
      <Icon name="done_all" className="text-[14px] text-sky-300" />
    </span>
  );
}

export function ChatThread({
  conversation,
  live,
  aiHandling,
  sending,
  sendError,
  onTakeOver,
  onToggleProfile,
  onSend,
  profileOpen,
}: {
  conversation: ChatConversation;
  customerSingular?: string;
  live?: boolean;
  aiHandling: boolean;
  sending?: boolean;
  sendError?: string | null;
  onTakeOver: () => void;
  onToggleProfile: () => void;
  onSend?: (text: string) => Promise<void> | void;
  profileOpen: boolean;
}) {
  const [draft, setDraft] = useState("");
  const messagesRef = useRef<HTMLDivElement>(null);
  const messageCount = conversation.messages.length;
  const lastMessageId = conversation.messages[messageCount - 1]?.id;

  useEffect(() => {
    const node = messagesRef.current;
    if (!node) {
      return;
    }
    node.scrollTop = node.scrollHeight;
  }, [conversation.id, lastMessageId, messageCount]);

  async function submitDraft() {
    const text = draft.trim();
    if (!text || sending) {
      return;
    }

    if (!onSend) {
      setDraft("");
      return;
    }

    await onSend(text);
    setDraft("");
  }

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-outline-variant bg-white px-6 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <InitialsAvatar initials={conversation.initials} featured />
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-on-surface">
              {conversation.name}
            </h2>
            <p className="mt-0.5 truncate text-xs text-on-surface-variant">
              {conversation.phone}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onTakeOver}
            className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-colors ${
              aiHandling
                ? "border-primary/30 bg-primary/10 text-primary-dark"
                : "border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-low"
            }`}
            title={aiHandling ? "Turn AI off" : "Turn AI on"}
          >
            <span
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                aiHandling ? "bg-primary" : "bg-surface-container-high"
              }`}
            >
              <span
                className={`absolute size-4 rounded-full bg-white shadow-sm transition-transform ${
                  aiHandling ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </span>
            AI
          </button>
          <button
            type="button"
            onClick={onToggleProfile}
            className={`flex size-10 items-center justify-center rounded-xl border border-outline-variant ${
              profileOpen
                ? "bg-surface-container text-on-surface"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
            title="Customer details"
          >
            <Icon name="view_sidebar" className="text-[20px]" />
          </button>
        </div>
      </div>

      <div
        ref={messagesRef}
        className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-6 py-6"
      >
        {conversation.messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-on-surface-variant">
            No messages yet. Reply below to start.
          </div>
        ) : null}
        {conversation.messages.map((message) => {
          if (message.kind === "date") {
            return (
              <div key={message.id} className="flex justify-center">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-on-surface-variant shadow-sm">
                  {message.label}
                </span>
              </div>
            );
          }

          if (message.kind === "customer") {
            return (
              <div key={message.id} className="flex max-w-[78%] items-start gap-3">
                <InitialsAvatar initials={message.initials} size="sm" featured />
                <div>
                  <div className="mb-1.5 flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-on-surface">
                      {message.name}
                    </span>
                    <span className="text-xs text-outline">{message.time}</span>
                  </div>
                  <div className="rounded-2xl rounded-tl-md bg-white px-4 py-3 text-sm leading-6 text-on-surface shadow-sm">
                    {message.text}
                  </div>
                </div>
              </div>
            );
          }

          if (message.kind === "business") {
            return (
              <div
                key={message.id}
                className="ml-auto flex max-w-[78%] flex-row-reverse items-start gap-3"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-white">
                  You
                </div>
                <div className="text-right">
                  <div className="mb-1.5 flex items-baseline justify-end gap-2">
                    <span className="text-sm font-semibold text-on-surface">You</span>
                    <span className="text-xs text-outline">{message.time}</span>
                  </div>
                  <div className="rounded-2xl rounded-tr-md bg-secondary px-4 py-3 text-left text-sm leading-6 text-white shadow-sm">
                    {message.text}
                    <div className="mt-1 flex items-center justify-end gap-1">
                      <DeliveryTicks status={message.deliveryStatus} />
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          if (message.kind === "ai") {
            return (
              <div
                key={message.id}
                className="ml-auto flex max-w-[78%] flex-row-reverse items-start gap-3"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-white">
                  AI
                </div>
                <div className="text-right">
                  <div className="mb-1.5 flex items-baseline justify-end gap-2">
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary-dark">
                      DIUK Engine • {message.latency}
                    </span>
                    <span className="text-sm font-semibold text-on-surface">
                      DIUK AI Assistant
                    </span>
                    <span className="text-xs text-outline">{message.time}</span>
                  </div>
                  <div className="rounded-2xl rounded-tr-md bg-secondary px-4 py-3 text-left text-sm leading-6 text-white shadow-sm">
                    {message.paragraphs.map((paragraph, index) => (
                      <p
                        key={`${message.id}-${index}`}
                        className="mt-1.5 first:mt-0"
                      >
                        {paragraph}
                      </p>
                    ))}
                    {message.slots?.length ? (
                      <div className="mt-3 space-y-1 rounded-xl bg-white/10 p-3 text-sm">
                        {message.slots.map((slot) => (
                          <p key={slot}>• {slot}</p>
                        ))}
                      </div>
                    ) : null}
                    {message.closing ? (
                      <p className="mt-3">{message.closing}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          }

          if (message.kind === "system") {
            return (
              <div key={message.id} className="flex justify-center">
                <div className="w-full max-w-lg rounded-2xl border border-success/30 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-success/10 text-success">
                      <Icon name="check_circle" className="text-[22px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-on-surface">
                          {message.title}
                          <span className="rounded-md border border-success/30 bg-success/10 px-1.5 py-0.5 text-[11px] font-bold tracking-wide text-success uppercase">
                            Autonomous
                          </span>
                        </p>
                        <span className="shrink-0 text-xs text-outline">
                          {message.time}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-on-surface-variant">
                        <span className="font-medium text-on-surface">
                          {message.service}
                        </span>{" "}
                        • {message.practitioner}
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
                        <span>{message.schedule}</span>
                        <span>•</span>
                        <span className="font-semibold text-success">
                          Synced with workspace
                        </span>
                      </p>
                      <div className="mt-3 flex items-center justify-between border-t border-outline-variant pt-3">
                        <span className="text-xs text-outline">
                          Booking ID: {message.bookingId} • {message.extra}
                        </span>
                        <Link
                          href={message.href}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark"
                        >
                          View details
                          <Icon name="arrow_forward" className="text-[14px]" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>

      <div className="shrink-0 border-t border-outline-variant bg-white p-5">
        <div className="rounded-2xl border border-outline-variant bg-white p-3 shadow-sm focus-within:border-primary">
          <textarea
            rows={2}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void submitDraft();
              }
            }}
            placeholder={`Type a message (${channelMeta(conversation.channel).label})...`}
            className="w-full resize-none bg-transparent px-1 text-sm leading-6 text-on-surface placeholder:text-outline focus:outline-none"
          />
          {sendError ? (
            <p className="px-1 pt-1 text-xs text-error">{sendError}</p>
          ) : null}
          <div className="mt-2 flex items-center justify-between border-t border-outline-variant pt-2">
            <div className="flex items-center gap-1 text-on-surface-variant">
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-lg hover:bg-surface-container hover:text-on-surface"
                title="Attach file"
              >
                <Icon name="attach_file" className="text-[20px]" />
              </button>
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-lg hover:bg-surface-container hover:text-on-surface"
                title="Add emoji"
              >
                <Icon name="mood" className="text-[20px]" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-outline sm:inline">
                Press Enter to send
              </span>
              <button
                type="button"
                disabled={sending || !draft.trim()}
                onClick={() => void submitDraft()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send"}
                <Icon name="send" className="text-[16px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
