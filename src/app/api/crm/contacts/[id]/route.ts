import { NextResponse } from "next/server";
import type { ContactLifecycle } from "@prisma/client";
import { getCurrentUser } from "@/lib/current-user";
import { updateContactLifecycle } from "@/lib/crm/contacts";
import { LIFECYCLE_ORDER } from "@/lib/crm/labels";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as {
    lifecycle?: ContactLifecycle;
    email?: string | null;
    assignedStaff?: string | null;
    potentialValue?: number | null;
  };

  const contact = await prisma.contact.findFirst({
    where: { id, businessId: user.businessId },
    select: { id: true },
  });

  if (!contact) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.lifecycle) {
    if (!LIFECYCLE_ORDER.includes(body.lifecycle)) {
      return NextResponse.json({ error: "Invalid lifecycle" }, { status: 400 });
    }
    await updateContactLifecycle(user.businessId, id, body.lifecycle);
  }

  await prisma.contact.update({
    where: { id },
    data: {
      ...(body.email !== undefined
        ? { email: body.email?.trim() || null }
        : {}),
      ...(body.assignedStaff !== undefined
        ? { assignedStaff: body.assignedStaff?.trim() || null }
        : {}),
      ...(body.potentialValue !== undefined
        ? { potentialValue: body.potentialValue }
        : {}),
    },
  });

  return NextResponse.json({ ok: true });
}
