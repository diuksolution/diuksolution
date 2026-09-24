"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import type {
  ChatConversation,
  ChatMessage,
  ChatWorkspaceData,
  InboxFilter,
} from "@/lib/chat/types";
import { ChatInbox } from "@/components/admin/chat-workspace/chat-inbox";
import { ChatProfile } from "@/components/admin/chat-workspace/chat-profile";
import { ChatThread } from "@/components/admin/chat-workspace/chat-thread";
import { Icon } from "@/components/ui/icon";

const INBOX_POLL_MS = 5000;
const ROOM_POLL_MS = 4000;
const AI_TOGGLE_GRACE_MS = 4000;

function jakartaTime(date = new Date()) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function ChatWorkspace({ data }: { data: ChatWorkspaceData }) {
  const live = Boolean(data.live);
  const searchParams = useSearchParams();
  const conversationFromUrl = searchParams.get("c");
  const [conversations, setConversations] = useState(data.conversations);
  const [selectedId, setSelectedId] = useState(
    conversationFromUrl &&
      data.conversations.some((item) => item.id === conversationFromUrl)
      ? conversationFromUrl
      : (data.conversations[0]?.id ?? ""),
  );
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [query, setQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(true);
  const [aiHandling, setAiHandling] = useState(
    () =>
      data.conversations.find(
        (item) =>
          item.id ===
          (conversationFromUrl ?? data.conversations[0]?.id),
      )?.aiActive ?? true,
  );
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [, startTransition] = useTransition();
  const selectedIdRef = useRef(selectedId);
  const messagesCacheRef = useRef<Record<string, ChatMessage[]>>({});
  const localAiRef = useRef<Record<string, { value: boolean; at: number }>>({});
  const inboxInFlightRef = useRef(false);
  const roomInFlightRef = useRef(false);
  const inboxRevRef = useRef(data.revision ?? 0);
  const roomRevRef = useRef<Record<string, number>>({});

  function resolveAiActive(conversationId: string, serverValue: boolean) {
    const local = localAiRef.current[conversationId];
    if (local && Date.now() - local.at < AI_TOGGLE_GRACE_MS) {
      return local.value;
    }
    return serverValue;
  }

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    for (const row of data.conversations) {
      if (row.messages.length > 0) {
        messagesCacheRef.current[row.id] = row.messages;
      }
    }
  }, [data.conversations]);

  useEffect(() => {
    if (
      conversationFromUrl &&
      conversations.some((item) => item.id === conversationFromUrl) &&
      conversationFromUrl !== selectedId
    ) {
      setSelectedId(conversationFromUrl);
    }
  }, [conversationFromUrl, conversations, selectedId]);

  const markRead = useCallback(async (id: string) => {
    if (!live || !id) {
      return;
    }

    setConversations((rows) =>
      rows.map((row) =>
        row.id === id && row.unread > 0 ? { ...row, unread: 0 } : row,
      ),
    );

    try {
      await fetch(`/api/chat/conversations/${id}/read`, { method: "POST" });
    } catch {
      // Keep UI optimistic; next poll will resync.
    }
  }, [live]);

  const applyMessages = useCallback((conversationId: string, messages: ChatMessage[]) => {
    messagesCacheRef.current[conversationId] = messages;
    setConversations((rows) =>
      rows.map((row) =>
        row.id === conversationId ? { ...row, messages } : row,
      ),
    );
  }, []);

  const loadRoomMessages = useCallback(
    async (conversationId: string, options?: { silent?: boolean }) => {
      if (!live || !conversationId || roomInFlightRef.current) {
        return;
      }
      roomInFlightRef.current = true;

      if (!options?.silent) {
        const cached = messagesCacheRef.current[conversationId];
        if (!cached || cached.length === 0) {
          setLoadingMessages(true);
        }
      }

      try {
        const hasRev = conversationId in roomRevRef.current;
        const revQuery = hasRev
          ? `?rev=${roomRevRef.current[conversationId]}`
          : "";
        const response = await fetch(
          `/api/chat/conversations/${conversationId}/messages${revQuery}`,
          { cache: "no-store" },
        );
        if (!response.ok) {
          return;
        }
        const payload = (await response.json()) as {
          messages?: ChatMessage[];
          unchanged?: boolean;
          revision?: number;
        };
        if (typeof payload.revision === "number") {
          roomRevRef.current[conversationId] = payload.revision;
        }
        if (payload.unchanged || !payload.messages) {
          return;
        }
        if (selectedIdRef.current === conversationId || options?.silent) {
          applyMessages(conversationId, payload.messages);
        } else {
          messagesCacheRef.current[conversationId] = payload.messages;
        }
      } finally {
        roomInFlightRef.current = false;
        if (!options?.silent) {
          setLoadingMessages(false);
        }
      }
    },
    [applyMessages, live],
  );

  const refreshInbox = useCallback(async () => {
    if (!live || inboxInFlightRef.current) {
      return;
    }
    inboxInFlightRef.current = true;

    try {
      const response = await fetch(
        `/api/chat/conversations?rev=${inboxRevRef.current}`,
        {
        cache: "no-store",
      });
      if (!response.ok) {
        return;
      }

      const next = (await response.json()) as ChatWorkspaceData & {
        unchanged?: boolean;
      };
      if (typeof next.revision === "number") {
        inboxRevRef.current = next.revision;
      }
      if (next.unchanged || !next.conversations) {
        return;
      }
      const openId = selectedIdRef.current;

      startTransition(() => {
        setConversations((prev) => {
          const prevMap = new Map(prev.map((row) => [row.id, row]));
          return next.conversations.map((row) => {
            const existing = prevMap.get(row.id);
            const cachedMessages =
              messagesCacheRef.current[row.id] ?? existing?.messages ?? [];
            return {
              ...row,
              aiActive: resolveAiActive(row.id, row.aiActive),
              unread: row.id === openId ? 0 : row.unread,
              messages: cachedMessages,
            };
          });
        });

        const open = next.conversations.find((row) => row.id === openId);
        if (open) {
          setAiHandling(resolveAiActive(open.id, open.aiActive));
        }
      });

      const open = next.conversations.find((row) => row.id === openId);
      if (open && open.unread > 0 && openId) {
        void markRead(openId);
      }
    } finally {
      inboxInFlightRef.current = false;
    }
  }, [live, markRead]);

  useEffect(() => {
    if (!live) {
      return;
    }
    const timer = window.setInterval(() => {
      void refreshInbox();
    }, INBOX_POLL_MS);
    return () => window.clearInterval(timer);
  }, [live, refreshInbox]);

  useEffect(() => {
    if (!live || !selectedId) {
      return;
    }

    void loadRoomMessages(selectedId);
    void markRead(selectedId);

    const timer = window.setInterval(() => {
      void loadRoomMessages(selectedId, { silent: true });
    }, ROOM_POLL_MS);

    return () => window.clearInterval(timer);
  }, [live, loadRoomMessages, markRead, selectedId]);

  const unreadCount = conversations.filter((item) => item.unread > 0).length;

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return conversations.filter((item) => {
      if (filter === "unread" && item.unread === 0) {
        return false;
      }
      if (filter === "read" && item.unread > 0) {
        return false;
      }
      if (filter === "assigned" && !item.assignedToMe) {
        return false;
      }
      if (filter === "ai" && !item.aiActive) {
        return false;
      }
      if (filter === "action" && !item.needsAction) {
        return false;
      }
      if (!needle) {
        return true;
      }
      return (
        item.name.toLowerCase().includes(needle) ||
        item.preview.toLowerCase().includes(needle) ||
        item.phone.toLowerCase().includes(needle)
      );
    });
  }, [conversations, filter, query]);

  const selected =
    conversations.find((item) => item.id === selectedId) ??
    visible[0] ??
    conversations[0];

  function handleSelect(id: string) {
    setSelectedId(id);
    setSendError(null);
    const next = conversations.find((item) => item.id === id);
    setAiHandling(next?.aiActive ?? true);

    const cached = messagesCacheRef.current[id];
    if (cached?.length) {
      setConversations((rows) =>
        rows.map((row) => (row.id === id ? { ...row, messages: cached } : row)),
      );
    }
  }

  async function handleToggleAi() {
    if (!selected || !live) {
      setAiHandling((value) => !value);
      return;
    }

    const nextValue = !aiHandling;
    localAiRef.current[selected.id] = { value: nextValue, at: Date.now() };
    setAiHandling(nextValue);
    setConversations((rows) =>
      rows.map((row) =>
        row.id === selected.id ? { ...row, aiActive: nextValue } : row,
      ),
    );

    try {
      const response = await fetch(
        `/api/chat/conversations/${selected.id}/ai`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ aiEnabled: nextValue }),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to save AI toggle");
      }
      localAiRef.current[selected.id] = { value: nextValue, at: Date.now() };
    } catch {
      localAiRef.current[selected.id] = { value: !nextValue, at: Date.now() };
      setAiHandling(!nextValue);
      setConversations((rows) =>
        rows.map((row) =>
          row.id === selected.id ? { ...row, aiActive: !nextValue } : row,
        ),
      );
    }
  }

  async function handleSend(text: string) {
    if (!selected || !live) {
      return;
    }

    const tempId = `local-${crypto.randomUUID()}`;
    const time = jakartaTime();
    const pending = {
      id: tempId,
      kind: "business",
      time,
      text,
      deliveryStatus: "PENDING",
    } satisfies ChatMessage;

    setSending(true);
    setSendError(null);
    setAiHandling(false);
    localAiRef.current[selected.id] = { value: false, at: Date.now() };
    setConversations((rows) =>
      rows.map((row) => {
        if (row.id !== selected.id) {
          return row;
        }
        const messages = [...row.messages, pending];
        messagesCacheRef.current[row.id] = messages;
        return {
          ...row,
          preview: text,
          time,
          aiActive: false,
          messages,
        } satisfies ChatConversation;
      }),
    );

    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selected.id,
          text,
        }),
      });
      const payload = (await response.json()) as ChatMessage & {
        error?: string;
      };

      const outbound: ChatMessage =
        payload.kind === "business" && payload.id
          ? {
              id: payload.id,
              kind: "business",
              time: payload.time,
              text: payload.text,
              deliveryStatus: payload.deliveryStatus ?? (response.ok ? "SENT" : "FAILED"),
            }
          : {
              ...pending,
              deliveryStatus: response.ok ? "SENT" : "FAILED",
            };

      setConversations((rows) =>
        rows.map((row) => {
          if (row.id !== selected.id) {
            return row;
          }
          const messages = row.messages.map((item) =>
            item.id === tempId ? outbound : item,
          );
          messagesCacheRef.current[row.id] = messages;
          return {
            ...row,
            preview: text,
            time: outbound.kind === "business" ? outbound.time : time,
            aiActive: false,
            messages,
          } satisfies ChatConversation;
        }),
      );

      if (!response.ok) {
        setSendError(payload.error ?? "Failed to send message.");
        return;
      }

      void loadRoomMessages(selected.id, { silent: true });
    } catch (error) {
      setSendError(error instanceof Error ? error.message : "Failed to send.");
      setConversations((rows) =>
        rows.map((row) => {
          if (row.id !== selected.id) {
            return row;
          }
          const messages = row.messages.map((item) =>
            item.id === tempId && item.kind === "business"
              ? { ...item, deliveryStatus: "FAILED" as const }
              : item,
          );
          messagesCacheRef.current[row.id] = messages;
          return { ...row, messages };
        }),
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-surface-container-low">
      <header className="flex h-[72px] shrink-0 items-center justify-between gap-4 border-b border-outline-variant bg-white px-6">
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="flex items-center gap-2.5 text-lg font-semibold text-on-surface">
            Conversations
            <span className="rounded-full bg-surface-container-high px-2.5 py-0.5 text-xs font-medium text-on-surface-variant">
              {conversations.length} active
            </span>
          </h1>
          <span className="hidden text-outline sm:inline">|</span>
          <p className="hidden text-sm text-on-surface-variant lg:block">
            {live
              ? "Live WhatsApp inbox for this business"
              : "Manage customer conversations across WhatsApp, Instagram, and Web in real time"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low px-3 py-1.5 text-xs text-on-surface-variant xl:flex">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span className="size-2 rounded-full bg-success" />
              WhatsApp Cloud Active
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary-dark">
            <Icon name="bolt" className="text-[16px]" />
            {live ? "Live inbox" : "DIUK AI v2.4"}
          </div>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <ChatInbox
          conversations={visible}
          selectedId={selected?.id ?? ""}
          filter={filter}
          query={query}
          searchPlaceholder={data.copy.searchPlaceholder}
          totalCount={conversations.length}
          unreadCount={unreadCount}
          onSelect={(id) => {
            void handleSelect(id);
          }}
          onFilter={setFilter}
          onQuery={setQuery}
        />
        {selected ? (
          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <ChatThread
              conversation={selected}
              customerSingular={data.copy.customerSingular}
              live={live}
              aiHandling={aiHandling}
              sending={sending}
              sendError={sendError}
              onTakeOver={() => {
                void handleToggleAi();
              }}
              onToggleProfile={() => setProfileOpen((value) => !value)}
              onSend={live ? handleSend : undefined}
              profileOpen={profileOpen}
            />
            {loadingMessages && selected.messages.length === 0 ? (
              <div className="pointer-events-none absolute inset-x-0 top-20 flex justify-center">
                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-on-surface-variant shadow-sm">
                  Loading messages…
                </span>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-on-surface-variant">
            {live
              ? "Belum ada chat. Kirim pesan ke nomor WhatsApp bisnis, lalu refresh."
              : "No conversations match this filter."}
          </div>
        )}
        {selected && profileOpen ? (
          <ChatProfile
            conversation={selected}
            copy={data.copy}
            onClose={() => setProfileOpen(false)}
          />
        ) : null}
      </div>
    </div>
  );
}
