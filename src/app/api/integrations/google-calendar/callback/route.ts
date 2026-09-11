import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import {
  doctorsPageForBusiness,
  exchangeCodeForTokens,
  fetchGoogleAccountEmail,
  parseOAuthState,
  resolvePrimaryCalendarId,
} from "@/lib/google-calendar/oauth";
import { prisma } from "@/lib/prisma";

function redirectWithStatus(
  request: Request,
  path: string,
  status: "connected" | "error",
  message?: string,
) {
  const url = new URL(path, request.url);
  url.searchParams.set("calendar", status);
  if (message) {
    url.searchParams.set("message", message);
  }
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  const fallbackPath = user
    ? doctorsPageForBusiness(user.business.businessType)
    : "/login";

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (error) {
    return redirectWithStatus(
      request,
      fallbackPath,
      "error",
      error === "access_denied" ? "Google access denied" : error,
    );
  }

  if (!code || !state) {
    return redirectWithStatus(
      request,
      fallbackPath,
      "error",
      "Missing OAuth code",
    );
  }

  const parsed = parseOAuthState(state);
  if (!parsed || parsed.businessId !== user.businessId) {
    return redirectWithStatus(
      request,
      fallbackPath,
      "error",
      "Invalid OAuth state",
    );
  }

  const practitioner = await prisma.practitioner.findFirst({
    where: {
      id: parsed.practitionerId,
      businessId: user.businessId,
    },
  });

  if (!practitioner) {
    return redirectWithStatus(
      request,
      fallbackPath,
      "error",
      "Doctor not found",
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const email = await fetchGoogleAccountEmail(tokens.access_token);
    const calendarId = await resolvePrimaryCalendarId(tokens.access_token);
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    if (!tokens.refresh_token && !practitioner.googleRefreshToken) {
      return redirectWithStatus(
        request,
        fallbackPath,
        "error",
        "No refresh token. Revoke app access in Google Account then connect again.",
      );
    }

    await prisma.practitioner.update({
      where: { id: practitioner.id },
      data: {
        googleAccountEmail: email,
        googleCalendarId: calendarId,
        googleAccessToken: tokens.access_token,
        googleRefreshToken:
          tokens.refresh_token ?? practitioner.googleRefreshToken,
        googleTokenExpiresAt: expiresAt,
        googleConnectedAt: new Date(),
        calendarSyncEnabled: true,
      },
    });

    return redirectWithStatus(request, fallbackPath, "connected");
  } catch (err) {
    console.error("[google-calendar callback]", err);
    return redirectWithStatus(
      request,
      fallbackPath,
      "error",
      "Failed to connect Google Calendar",
    );
  }
}
