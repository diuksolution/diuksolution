import type { NextRequest } from "next/server";
import {
  isValidWebhookSignature,
  isValidWebhookVerifyToken,
} from "@/lib/whatsapp/credentials";
import { ingestWhatsAppWebhook } from "@/lib/whatsapp/ingest";
import { parseWhatsAppWebhook } from "@/lib/whatsapp/parse-webhook";

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token && challenge) {
    const ok = await isValidWebhookVerifyToken(token);
    if (ok) {
      return new Response(challenge, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }
  }

  if (!mode && !token && !challenge) {
    return Response.json({
      ok: true,
      service: "whatsapp-webhook",
    });
  }

  return new Response("Forbidden", { status: 403 });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!(await isValidWebhookSignature(rawBody, signature))) {
    return new Response("Invalid signature", { status: 401 });
  }

  try {
    const parsed = parseWhatsAppWebhook(JSON.parse(rawBody) as unknown);
    await ingestWhatsAppWebhook(parsed);
    console.info("[whatsapp webhook]", {
      messages: parsed.messages.length,
      statuses: parsed.statuses.length,
    });
  } catch (error) {
    console.error("[whatsapp webhook] failed", error);
  }

  return new Response("EVENT_RECEIVED", { status: 200 });
}
