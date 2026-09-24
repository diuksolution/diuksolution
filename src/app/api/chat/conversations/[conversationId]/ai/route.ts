import { NextResponse } from "next/server";
import { invalidateChatCache } from "@/lib/chat/cache";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ conversationId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId } = await context.params;
  const body = (await request.json()) as { aiEnabled?: boolean };

  if (typeof body.aiEnabled !== "boolean") {
    return NextResponse.json(
      { error: "aiEnabled boolean is required" },
      { status: 400 },
    );
  }

  const result = await prisma.conversation.updateMany({
    where: {
      id: conversationId,
      businessId: user.businessId,
    },
    data: { aiEnabled: body.aiEnabled },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await invalidateChatCache(user.businessId, conversationId);

  return NextResponse.json({
    id: conversationId,
    aiEnabled: body.aiEnabled,
  });
}
