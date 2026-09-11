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

const INBOX_POLL_MS = 2500;
const ROOM_POLL_MS = 1500;

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
      if (!live || !conversationId) {
        return;
      }

      if (!options?.silent) {
        const cached = messagesCacheRef.current[conversationId];
        if (!cached || cached.length === 0) {
          setLoadingMessages(true);
        }
      }

      try {
        const response = await fetch(
          `/api/chat/conversations/${conversationId}/messages`,
          { cache: "no-store" },
        );
        if (!response.ok) {
          return;
        }
        const payload = (await response.json()) as { messages: ChatMessage[] };
        if (selectedIdRef.current === conversationId || options?.silent) {
          applyMessages(conversationId, payload.messages);
        } else {
          messagesCacheRef.current[conversationId] = payload.messages;
        }
      } finally {
        if (!options?.silent) {
          setLoadingMessages(false);
        }
      }
    },
    [applyMessages, live],
  );

  const refreshInbox = useCallback(async () => {
    if (!live) {
      return;
    }

    const response = await fetch("/api/chat/conversations", {
      cache: "no-store",
    });
    if (!response.ok) {
      return;
    }

    const next = (await response.json()) as ChatWorkspaceData;
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
            unread: row.id === openId ? 0 : row.unread,
            messages: cachedMessages,
          };
        });
      });

      const open = next.conversations.find((row) => row.id === openId);
      if (open) {
        setAiHandling(open.aiActive);
      }
    });

    const open = next.conversations.find((row) => row.id === openId);
    if (open && open.unread > 0 && openId) {
      void markRead(openId);
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

  const selected = visible.find((item) => item.id === selectedId) ?? visible[0];

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
    } catch {
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

    setSending(true);
    setSendError(null);

    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selected.id,
          text,
        }),
      });
      const payload = (await response.json()) as ChatMessage & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to send message.");
      }

      const outbound =
        payload.kind === "business"
          ? payload
          : ({
              id: crypto.randomUUID(),
              kind: "business",
              time: new Intl.DateTimeFormat("en-GB", {
                timeZone: "Asia/Jakarta",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              }).format(new Date()),
              text,
              deliveryStatus: "SENT",
            } satisfies ChatMessage);

      setConversations((rows) =>
        rows.map((row) => {
          if (row.id !== selected.id) {
            return row;
          }
          const messages = [...row.messages, outbound];
          messagesCacheRef.current[row.id] = messages;
          return {
            ...row,
            preview: text,
            time: outbound.time,
            messages,
          } satisfies ChatConversation;
        }),
      );
      void loadRoomMessages(selected.id, { silent: true });
      void refreshInbox();
    } catch (error) {
      setSendError(error instanceof Error ? error.message : "Failed to send.");
      throw error;
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
