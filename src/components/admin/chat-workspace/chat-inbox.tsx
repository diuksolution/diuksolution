import type { ChatConversation, InboxFilter } from "@/lib/chat/types";
import {
  ChannelBadge,
  InitialsAvatar,
} from "@/components/admin/chat-workspace/chat-bits";
import { Icon } from "@/components/ui/icon";

const filters: { id: InboxFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "read", label: "Read" },
];

export function ChatInbox({
  conversations,
  selectedId,
  filter,
  query,
  searchPlaceholder,
  totalCount,
  unreadCount,
  onSelect,
  onFilter,
  onQuery,
}: {
  conversations: ChatConversation[];
  selectedId: string;
  filter: InboxFilter;
  query: string;
  searchPlaceholder: string;
  totalCount: number;
  unreadCount: number;
  onSelect: (id: string) => void;
  onFilter: (filter: InboxFilter) => void;
  onQuery: (value: string) => void;
}) {
  return (
    <section className="flex h-full w-[400px] shrink-0 flex-col border-r border-outline-variant bg-white">
      <div className="space-y-3 border-b border-outline-variant p-4">
        <div className="relative">
          <Icon
            name="search"
            className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[18px] text-outline"
          />
          <input
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-11 w-full rounded-xl bg-surface-container-low pr-3 pl-11 text-sm text-on-surface placeholder:text-outline focus:bg-white focus:shadow-sm focus:outline-none"
          />
        </div>
        <div className="flex gap-1.5">
          {filters.map((item) => {
            const active = filter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onFilter(item.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-primary text-white"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {item.label}
                {item.id === "all" ? (
                  <span className={active ? "text-white/80" : "text-outline"}>
                    {totalCount}
                  </span>
                ) : null}
                {item.id === "unread" && unreadCount > 0 ? (
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-success text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <p className="p-6 text-sm text-on-surface-variant">
            No conversations match this filter.
          </p>
        ) : null}
        {conversations.map((item) => {
          const selected = item.id === selectedId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`w-full border-b border-outline-variant p-4 text-left transition-colors ${
                selected
                  ? "border-l-4 border-l-primary bg-primary/10"
                  : "border-l-4 border-l-transparent hover:bg-surface-container-low"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative shrink-0">
                  <InitialsAvatar initials={item.initials} featured={selected} />
                  <ChannelBadge channel={item.channel} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-on-surface">
                      {item.name}
                    </p>
                    <span
                      className={`shrink-0 text-xs font-medium ${
                        selected ? "text-primary-dark" : "text-outline"
                      }`}
                    >
                      {item.time}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="min-w-0 flex-1 truncate text-sm text-on-surface-variant">
                      {item.preview}
                    </p>
                    {item.unread > 0 ? (
                      <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                        {item.unread}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
