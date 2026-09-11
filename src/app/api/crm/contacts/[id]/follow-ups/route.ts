import { NextResponse } from "next/server";
import type { FollowUpType } from "@prisma/client";
import {
  completeContactFollowUp,
  createContactFollowUp,
} from "@/lib/crm/contacts";
import { getCurrentUser } from "@/lib/current-user";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const FOLLOW_UP_TYPES: FollowUpType[] = [
  "BOOKING",
  "REMINDER",
  "POST_SERVICE",
  "PROMO",
  "UNREPLIED",
  "NO_BOOKING",
  "CUSTOM",
];

export async function POST(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as {
    type?: FollowUpType;
    dueAt?: string;
    note?: string;
    completeId?: string;
  };

  if (body.completeId) {
    const done = await completeContactFollowUp({
      businessId: user.businessId,
      contactId: id,
      followUpId: body.completeId,
    });
    if (!done) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ followUp: done });
  }

  if (!body.dueAt || !body.type || !FOLLOW_UP_TYPES.includes(body.type)) {
    return NextResponse.json(
      { error: "type and dueAt are required" },
      { status: 400 },
    );
  }

  const dueAt = new Date(body.dueAt);
  if (Number.isNaN(dueAt.getTime())) {
    return NextResponse.json({ error: "Invalid dueAt" }, { status: 400 });
  }

  const followUp = await createContactFollowUp({
    businessId: user.businessId,
    contactId: id,
    type: body.type,
    dueAt,
    note: body.note,
  });

  if (!followUp) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ followUp });
}
