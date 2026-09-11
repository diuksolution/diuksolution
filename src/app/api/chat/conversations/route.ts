import { NextResponse } from "next/server";
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

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getLiveChatInbox(
    user.businessId,
    variantFromType(user.business.businessType),
  );

  return NextResponse.json(data);
}
