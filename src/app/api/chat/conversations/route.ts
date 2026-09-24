import { NextResponse } from "next/server";
import { getChatRevision } from "@/lib/chat/cache";
import { getLiveChatInbox } from "@/lib/chat/live-workspace";
import { getCurrentUser } from "@/lib/current-user";

function variantFromType(type: string): "clinic" | "salon" | "fnb" {
  if (type === "BARBERSHOP") {
    return "salon";
  }
  if (type === "CLINIC") {
    return "clinic";
  }
  return "fnb";
}

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

  const data = await getLiveChatInbox(
    user.businessId,
    variantFromType(user.business.businessType),
  );

  return NextResponse.json(data);
}
