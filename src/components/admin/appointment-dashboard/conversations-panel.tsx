import Link from "next/link";
import type { ConversationData } from "@/lib/appointment/dashboard-data";
import { Icon } from "@/components/ui/icon";

export function ConversationsPanel({
  conversations,
  chatHref,
}: {
  conversations: ConversationData[];
  chatHref: string;
}) {
  return (
    <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm lg:col-span-7">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[22px] leading-7 font-semibold text-on-surface">
            Recent Conversations
          </h2>
          <p className="text-[13px] text-on-surface-variant">
            Real-time omnichannel messaging stream
          </p>
        </div>
        <Link
          href={chatHref}
          className="inline-flex items-center gap-0.5 text-xs font-semibold text-primary hover:text-primary-dark"
        >
          Open Inbox
          <Icon name="arrow_forward" className="text-[16px]" />
        </Link>
      </div>
      <div className="space-y-4">
        {conversations.map((item) => (
          <article
            key={item.id}
            className="space-y-2 rounded-xl bg-surface-container-low p-4 transition-shadow hover:shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon name={item.channelIcon} className="text-[14px]" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-on-surface">
                    {item.name}
                  </span>
                  <span className="ml-1.5 font-mono text-[11px] text-on-surface-variant">
                    {item.channel}
                  </span>
                </div>
              </div>
              {item.status === "escalated" ? (
                <span className="rounded-full bg-error/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-error">
                  {item.statusLabel}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-success">
                  <Icon
                    name={item.status === "paid" ? "verified" : "auto_awesome"}
                    className="text-[12px]"
                  />
                  {item.statusLabel}
                </span>
              )}
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="rounded-xl bg-surface-container p-2 text-[13px] text-on-surface">
                {item.inbound}
              </div>
              {item.reply ? (
                <div className="flex items-start gap-2 rounded-xl bg-white p-2 text-[13px] text-on-surface-variant shadow-sm">
                  <Icon
                    name={item.replyIcon ?? "smart_toy"}
                    className={`mt-0.5 shrink-0 text-[16px] ${
                      item.status === "paid" ? "text-success" : "text-primary"
                    }`}
                  />
                  <div>
                    {item.replyTitle ? (
                      <p className="font-medium text-on-surface">{item.replyTitle}</p>
                    ) : null}
                    <p>{item.reply}</p>
                  </div>
                </div>
              ) : null}
              {item.waitingLabel ? (
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-[11px] text-on-surface-variant">
                    {item.waitingLabel}
                  </span>
                  <Link
                    href={chatHref}
                    className="rounded-lg bg-surface-container-high px-2 py-0.5 text-xs font-semibold text-on-surface hover:bg-surface-container"
                  >
                    {item.actionLabel}
                  </Link>
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
