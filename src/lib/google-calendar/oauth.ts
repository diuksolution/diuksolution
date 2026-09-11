import { createHmac, timingSafeEqual } from "crypto";
import { getAdminHome } from "@/lib/admin-workspace";
import type { BusinessType } from "@prisma/client";

export const GOOGLE_CALENDAR_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
].join(" ");

const STATE_TTL_MS = 15 * 60 * 1000;

type OAuthStatePayload = {
  practitionerId: string;
  businessId: string;
  exp: number;
  nonce: string;
};

function requireEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing env ${name}`);
  }
  return value;
}

export function getGoogleOAuthClient() {
  return {
    clientId: requireEnv("CLIENT_ID"),
    clientSecret: requireEnv("CLIENT_SECRET"),
    redirectUri: `${requireEnv("AUTH_URL").replace(/\/$/, "")}/api/integrations/google-calendar/callback`,
  };
}

function getStateSecret() {
  return requireEnv("AUTH_SECRET");
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payloadB64: string) {
  return createHmac("sha256", getStateSecret())
    .update(payloadB64)
    .digest("base64url");
}

export function createOAuthState(input: {
  practitionerId: string;
  businessId: string;
}) {
  const payload: OAuthStatePayload = {
    practitionerId: input.practitionerId,
    businessId: input.businessId,
    exp: Date.now() + STATE_TTL_MS,
    nonce: crypto.randomUUID(),
  };
  const payloadB64 = toBase64Url(JSON.stringify(payload));
  return `${payloadB64}.${sign(payloadB64)}`;
}

export function parseOAuthState(state: string): OAuthStatePayload | null {
  const [payloadB64, signature] = state.split(".");
  if (!payloadB64 || !signature) {
    return null;
  }

  const expected = sign(payloadB64);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(payloadB64)) as OAuthStatePayload;
    if (!payload.practitionerId || !payload.businessId || !payload.exp) {
      return null;
    }
    if (Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function buildGoogleAuthUrl(state: string) {
  const { clientId, redirectUri } = getGoogleOAuthClient();
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", GOOGLE_CALENDAR_SCOPES);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent select_account");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("state", state);
  return url.toString();
}

type TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  token_type: string;
  id_token?: string;
};

export async function exchangeCodeForTokens(code: string) {
  const { clientId, clientSecret, redirectUri } = getGoogleOAuthClient();

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token exchange failed: ${text}`);
  }

  return (await response.json()) as TokenResponse;
}

export async function fetchGoogleAccountEmail(accessToken: string) {
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { email?: string };
  return data.email ?? null;
}

export async function resolvePrimaryCalendarId(accessToken: string) {
  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/users/me/calendarList?minAccessRole=writer",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!response.ok) {
    return "primary";
  }

  const data = (await response.json()) as {
    items?: Array<{ id?: string; primary?: boolean }>;
  };

  const primary = data.items?.find((item) => item.primary && item.id);
  if (primary?.id) {
    return primary.id;
  }

  return data.items?.[0]?.id || "primary";
}

export function doctorsPageForBusiness(type: BusinessType) {
  const home = getAdminHome(type);
  if (home === "/admin/salon") {
    return "/admin/salon/stylists";
  }
  if (home === "/admin/clinic") {
    return "/admin/clinic/doctors";
  }
  return `${home}`;
}
