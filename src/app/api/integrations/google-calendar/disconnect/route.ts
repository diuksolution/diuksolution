import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { practitionerId?: string };
  if (!body.practitionerId) {
    return NextResponse.json(
      { error: "practitionerId is required" },
      { status: 400 },
    );
  }

  const result = await prisma.practitioner.updateMany({
    where: {
      id: body.practitionerId,
      businessId: user.businessId,
    },
    data: {
      googleAccountEmail: null,
      googleCalendarId: null,
      googleAccessToken: null,
      googleRefreshToken: null,
      googleTokenExpiresAt: null,
      googleConnectedAt: null,
      calendarSyncEnabled: false,
    },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
