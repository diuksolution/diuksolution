import { prisma } from "@/lib/prisma";

export async function getUnreadConversationCount(businessId: string) {
  return prisma.conversation.count({
    where: {
      businessId,
      unreadCount: { gt: 0 },
    },
  });
}
