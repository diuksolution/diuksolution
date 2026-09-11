import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { updatePractitioner } from "@/lib/practitioners";
import type { PractitionerInput } from "@/lib/practitioners/types";
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
  const body = (await request.json()) as Partial<PractitionerInput>;

  if (body.name !== undefined && !body.name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const practitioner = await updatePractitioner(user.businessId, id, body);
  if (!practitioner) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ practitioner });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await prisma.practitioner.findFirst({
    where: { id, businessId: user.businessId },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.practitioner.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
