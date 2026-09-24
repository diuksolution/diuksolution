import { NextResponse } from "next/server";
import { getConversationRevision } from "@/lib/chat/cache";
import { getConversationMessages } from "@/lib/chat/live-workspace";
import { getCurrentUser } from "@/lib/current-user";

type RouteContext = {
  params: Promise<{ conversationId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId } = await context.params;
  const clientRev = Number(new URL(request.url).searchParams.get("rev") ?? "");
  const revision = await getConversationRevision(conversationId);
  if (Number.isFinite(clientRev) && clientRev === revision) {
    return NextResponse.json({ unchanged: true, revision });
  }

  const messages = await getConversationMessages(
    user.businessId,
    conversationId,
  );

  if (!messages) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ messages, revision });
}
