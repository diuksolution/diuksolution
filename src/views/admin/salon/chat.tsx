import { Suspense } from "react";
import { ChatWorkspace } from "@/components/admin/chat-workspace";
import { getLiveChatWorkspace } from "@/lib/chat/live-workspace";
import { requireUser } from "@/lib/current-user";

export async function SalonChatView() {
  const user = await requireUser();
  const data = await getLiveChatWorkspace(user.businessId, "salon");

  return (
    <Suspense fallback={<div className="p-6 text-sm text-on-surface-variant">Loading chat...</div>}>
      <ChatWorkspace data={data} />
    </Suspense>
  );
}
