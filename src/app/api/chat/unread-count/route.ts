import { NextResponse } from "next/server";
import { getUnreadConversationCount } from "@/lib/chat/unread";
import { getCurrentUser } from "@/lib/current-user";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const count = await getUnreadConversationCount(user.businessId);
  return NextResponse.json({ count });
}
