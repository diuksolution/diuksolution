import { NextResponse } from "next/server";
import type { CrmBookingStatus } from "@prisma/client";
import { getCurrentUser } from "@/lib/current-user";
import { MANUAL_BOOKING_STATUSES } from "@/lib/crm/labels";
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
  const body = (await request.json()) as { status?: CrmBookingStatus };

  if (!body.status) {
    return NextResponse.json({ error: "Missing status" }, { status: 400 });
  }

  if (!MANUAL_BOOKING_STATUSES.includes(body.status)) {
    return NextResponse.json(
      {
        error:
          "Only Done can be set manually. Other statuses are set by the system.",
      },
      { status: 400 },
    );
  }

  const booking = await prisma.crmBooking.findFirst({
    where: { id, businessId: user.businessId },
    select: { id: true, status: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (booking.status === "CANCELLED") {
    return NextResponse.json(
      { error: "Cancelled appointments cannot be marked as Done." },
      { status: 400 },
    );
  }

  const updated = await prisma.crmBooking.update({
    where: { id },
    data: {
      status: body.status,
      completedAt: body.status === "DONE" ? new Date() : undefined,
    },
  });

  return NextResponse.json({
    ok: true,
    id: updated.id,
    status: updated.status,
  });
}
