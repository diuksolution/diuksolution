import { NextResponse } from "next/server";
import { getChatRevision } from "@/lib/chat/cache";
import { getUnreadConversationCount } from "@/lib/chat/unread";
import { getCurrentUser } from "@/lib/current-user";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientRev = Number(new URL(request.url).searchParams.get("rev") ?? "");
  const revision = await getChatRevision(user.businessId);
  if (Number.isFinite(clientRev) && clientRev === revision) {
    return NextResponse.json({ unchanged: true, revision });
  }

  const count = await getUnreadConversationCount(user.businessId);
  return NextResponse.json({ count, revision });
}
