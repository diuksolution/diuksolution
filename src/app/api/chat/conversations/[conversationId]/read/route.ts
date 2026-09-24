import { NextResponse } from "next/server";
import { invalidateChatCache } from "@/lib/chat/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId } = await params;

  await prisma.conversation.updateMany({
    where: { id: conversationId, businessId: user.businessId },
    data: { unreadCount: 0 },
  });
  await invalidateChatCache(user.businessId, conversationId);

  return NextResponse.json({ ok: true });
}
