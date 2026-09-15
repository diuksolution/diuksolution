import { resolveSendCredentials } from "@/lib/whatsapp/credentials";

const GRAPH_URL = "https://graph.facebook.com/v21.0";

async function sendWhatsAppPayload(input: {
  phoneNumberId?: string;
  businessId?: string;
  body: Record<string, unknown>;
}) {
  const credentials = await resolveSendCredentials({
    phoneNumberId: input.phoneNumberId,
    businessId: input.businessId,
  });

  if (!credentials) {
    throw new Error("WhatsApp is not configured.");
  }

  const response = await fetch(
    `${GRAPH_URL}/${credentials.phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${credentials.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        ...input.body,
      }),
    },
  );

  const payload = (await response.json()) as {
    messages?: Array<{ id?: string }>;
    error?: { message?: string };
  };

  if (!response.ok || !payload.messages?.[0]?.id) {
    throw new Error(payload.error?.message ?? "Failed to send WhatsApp message.");
  }

  return payload.messages[0].id as string;
}

export async function sendWhatsAppText(input: {
  to: string;
  text: string;
  phoneNumberId?: string;
  businessId?: string;
}) {
  return sendWhatsAppPayload({
    phoneNumberId: input.phoneNumberId,
    businessId: input.businessId,
    body: {
      to: input.to,
      type: "text",
      text: { body: input.text, preview_url: true },
    },
  });
}

export async function sendWhatsAppImage(input: {
  to: string;
  imageUrl: string;
  caption?: string;
  phoneNumberId?: string;
  businessId?: string;
}) {
  return sendWhatsAppPayload({
    phoneNumberId: input.phoneNumberId,
    businessId: input.businessId,
    body: {
      to: input.to,
      type: "image",
      image: {
        link: input.imageUrl,
        ...(input.caption ? { caption: input.caption } : {}),
      },
    },
  });
}

export async function sendWhatsAppReplyButtons(input: {
  to: string;
  bodyText: string;
  buttons: Array<{ id: string; title: string }>;
  phoneNumberId?: string;
  businessId?: string;
}) {
  const buttons = input.buttons.slice(0, 3).map((button) => ({
    type: "reply" as const,
    reply: {
      id: button.id.slice(0, 256),
      title: button.title.slice(0, 20),
    },
  }));

  return sendWhatsAppPayload({
    phoneNumberId: input.phoneNumberId,
    businessId: input.businessId,
    body: {
      to: input.to,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: input.bodyText.slice(0, 1024) },
        action: { buttons },
      },
    },
  });
}
