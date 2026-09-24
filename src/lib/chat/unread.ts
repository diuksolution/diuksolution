import { rememberUnread } from "@/lib/chat/cache";
import { prisma } from "@/lib/prisma";

export async function getUnreadConversationCount(businessId: string) {
  return rememberUnread(businessId, () =>
    prisma.conversation.count({
      where: {
        businessId,
        unreadCount: { gt: 0 },
      },
    }),
  );
}
