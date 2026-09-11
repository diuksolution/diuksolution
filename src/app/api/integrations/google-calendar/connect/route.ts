import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import {
  buildGoogleAuthUrl,
  createOAuthState,
} from "@/lib/google-calendar/oauth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const practitionerId = new URL(request.url).searchParams.get("practitionerId");
  if (!practitionerId) {
    return NextResponse.json(
      { error: "practitionerId is required" },
      { status: 400 },
    );
  }

  const practitioner = await prisma.practitioner.findFirst({
    where: {
      id: practitionerId,
      businessId: user.businessId,
    },
    select: { id: true },
  });

  if (!practitioner) {
    return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
  }

  try {
    const state = createOAuthState({
      practitionerId: practitioner.id,
      businessId: user.businessId,
    });
    const authUrl = buildGoogleAuthUrl(state);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("[google-calendar connect]", error);
    return NextResponse.json(
      { error: "Google OAuth is not configured" },
      { status: 500 },
    );
  }
}
