import { prisma } from "@/lib/prisma";
import { getGoogleOAuthClient } from "@/lib/google-calendar/oauth";

type PractitionerTokens = {
  id: string;
  googleCalendarId: string | null;
  googleAccessToken: string | null;
  googleRefreshToken: string | null;
  googleTokenExpiresAt: Date | null;
};

async function refreshAccessToken(refreshToken: string) {
  const { clientId, clientSecret } = getGoogleOAuthClient();
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to refresh Google token: ${text}`);
  }

  return (await response.json()) as {
    access_token: string;
    expires_in: number;
  };
}

export async function getValidAccessToken(practitioner: PractitionerTokens) {
  if (!practitioner.googleRefreshToken) {
    throw new Error("Doctor calendar is not connected.");
  }

  const stillValid =
    practitioner.googleAccessToken &&
    practitioner.googleTokenExpiresAt &&
    practitioner.googleTokenExpiresAt.getTime() > Date.now() + 60_000;

  if (stillValid && practitioner.googleAccessToken) {
    return {
      accessToken: practitioner.googleAccessToken,
      calendarId: practitioner.googleCalendarId || "primary",
    };
  }

  const refreshed = await refreshAccessToken(practitioner.googleRefreshToken);
  const expiresAt = new Date(Date.now() + refreshed.expires_in * 1000);

  await prisma.practitioner.update({
    where: { id: practitioner.id },
    data: {
      googleAccessToken: refreshed.access_token,
      googleTokenExpiresAt: expiresAt,
    },
  });

  return {
    accessToken: refreshed.access_token,
    calendarId: practitioner.googleCalendarId || "primary",
  };
}

export type BusyPeriod = {
  start: Date;
  end: Date;
};

export async function queryFreeBusy(input: {
  practitioner: PractitionerTokens;
  timeMin: Date;
  timeMax: Date;
}): Promise<BusyPeriod[]> {
  const { accessToken, calendarId } = await getValidAccessToken(
    input.practitioner,
  );

  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/freeBusy",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timeMin: input.timeMin.toISOString(),
        timeMax: input.timeMax.toISOString(),
        timeZone: "Asia/Jakarta",
        items: [{ id: calendarId }],
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`freeBusy failed: ${text}`);
  }

  const data = (await response.json()) as {
    calendars?: Record<
      string,
      { busy?: Array<{ start?: string; end?: string }> }
    >;
  };

  const busy = data.calendars?.[calendarId]?.busy ?? [];
  return busy
    .filter((item) => item.start && item.end)
    .map((item) => ({
      start: new Date(item.start as string),
      end: new Date(item.end as string),
    }));
}

export async function createCalendarEvent(input: {
  practitioner: PractitionerTokens;
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  timeZone?: string;
}) {
  const { accessToken, calendarId } = await getValidAccessToken(
    input.practitioner,
  );
  const timeZone = input.timeZone || "Asia/Jakarta";

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: input.summary,
        description: input.description,
        start: {
          dateTime: input.start.toISOString(),
          timeZone,
        },
        end: {
          dateTime: input.end.toISOString(),
          timeZone,
        },
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`create event failed: ${text}`);
  }

  const data = (await response.json()) as { id?: string; htmlLink?: string };
  if (!data.id) {
    throw new Error("Google Calendar did not return an event id.");
  }

  return {
    eventId: data.id,
    htmlLink: data.htmlLink ?? null,
  };
}
