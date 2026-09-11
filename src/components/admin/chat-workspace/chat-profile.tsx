import type { ChatConversation, ChatCopy } from "@/lib/chat/types";
import { InitialsAvatar } from "@/components/admin/chat-workspace/chat-bits";
import { Icon } from "@/components/ui/icon";

export function ChatProfile({
  conversation,
  copy,
  onClose,
}: {
  conversation: ChatConversation;
  copy: ChatCopy;
  onClose: () => void;
}) {
  return (
    <aside className="absolute inset-y-0 right-0 z-20 flex h-full w-[360px] shrink-0 flex-col overflow-y-auto bg-white shadow-xl xl:static xl:shadow-none">
      <div className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
        <h3 className="text-xs font-semibold tracking-wider text-on-surface uppercase">
          Customer Profile
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="flex size-8 items-center justify-center rounded-lg text-outline hover:bg-surface-container hover:text-on-surface"
          aria-label="Close profile"
        >
          <Icon name="close" className="text-[18px]" />
        </button>
      </div>

      <div className="space-y-6 p-5">
        <div className="border-b border-outline-variant pb-5 text-center">
          <div className="relative mx-auto mb-3 w-16">
            <InitialsAvatar initials={conversation.initials} size="lg" featured />
            {conversation.online ? (
              <span className="absolute right-0 bottom-0 size-4 rounded-full border-2 border-white bg-success" />
            ) : null}
          </div>
          <h4 className="text-base font-semibold text-on-surface">
            {conversation.name}
          </h4>
          <p className="mt-1 text-sm text-on-surface-variant">{conversation.phone}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {conversation.vip ? (
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary-dark">
                VIP Tier 2
              </span>
            ) : null}
            <span className="rounded-full bg-surface-container-high px-2.5 py-1 text-xs font-medium text-on-surface-variant">
              Returning {copy.customerSingular}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: "call", label: "Call" },
            { icon: "calendar_month", label: copy.bookLabel },
            { icon: "description", label: copy.chartLabel },
          ].map((action) => (
            <button
              key={action.label}
              type="button"
              className="rounded-xl border border-outline-variant bg-surface-container-low px-2 py-3 text-center hover:bg-surface-container"
            >
              <Icon
                name={action.icon}
                className="mx-auto mb-1 text-[20px] text-on-surface-variant"
              />
              <span className="block text-xs font-semibold text-on-surface">
                {action.label}
              </span>
            </button>
          ))}
        </div>

        {conversation.booking ? (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-on-surface uppercase">
                Upcoming Booking
              </span>
              <span className="rounded-md border border-success/30 bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                Confirmed
              </span>
            </div>
            <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-4">
              <p className="text-sm font-semibold text-on-surface">
                {conversation.booking.service}
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm text-on-surface-variant">
                <Icon name="person" className="text-[16px] text-outline" />
                {conversation.booking.practitioner}
              </p>
              <p className="mt-1.5 flex items-center gap-2 text-sm text-on-surface-variant">
                <Icon name="calendar_today" className="text-[16px] text-outline" />
                {conversation.booking.schedule}
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-outline-variant pt-3 text-xs">
                <span className="text-on-surface-variant">
                  Deposit: {conversation.booking.deposit}
                </span>
                <span className="font-semibold text-success">
                  {conversation.booking.paid ? "QRIS Paid" : "Hold"}
                </span>
              </div>
            </div>
          </div>
        ) : null}

        <div>
          <span className="mb-2 block text-xs font-semibold tracking-wider text-on-surface uppercase">
            {copy.customerSingular} Lifetime Data
          </span>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl border border-outline-variant bg-surface-container-low p-3">
              <p className="text-xs text-outline">Total Visits</p>
              <p className="mt-1 text-base font-semibold text-on-surface">
                {conversation.lifetimeVisits}
              </p>
            </div>
            <div className="rounded-xl border border-outline-variant bg-surface-container-low p-3">
              <p className="text-xs text-outline">Lifetime Value</p>
              <p className="mt-1 text-base font-semibold text-primary-dark">
                {conversation.lifetimeValue}
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-on-surface uppercase">
              Assigned Tags
            </span>
            <button
              type="button"
              className="text-xs font-medium text-primary hover:text-primary-dark"
            >
              + Add Tag
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {conversation.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-surface-container-high px-2 py-1 text-xs font-medium text-on-surface"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-on-surface uppercase">
              {copy.notesTitle}
            </span>
            <span className="text-xs text-outline">Private</span>
          </div>
          <div className="rounded-2xl bg-warning/10 p-3.5 text-sm leading-6 text-on-surface">
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold">
              <Icon name="edit_note" className="text-[16px] text-warning" />
              {conversation.notesAuthor}
            </p>
            {conversation.notes}
          </div>
        </div>
      </div>
    </aside>
  );
}
