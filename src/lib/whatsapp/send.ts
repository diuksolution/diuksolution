import { resolveSendCredentials } from "@/lib/whatsapp/credentials";
import { normalizeWaId } from "@/lib/whatsapp/session-window";

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
    error?: {
      message?: string;
      code?: number;
      error_data?: { details?: string };
    };
  };

  if (!response.ok || !payload.messages?.[0]?.id) {
    const code = payload.error?.code;
    const details = payload.error?.error_data?.details;
    const message = payload.error?.message ?? "Failed to send WhatsApp message.";
    throw new Error(
      [code ? `(#${code})` : null, message, details].filter(Boolean).join(" "),
    );
  }

  return payload.messages[0].id as string;
}

export async function sendWhatsAppTyping(input: {
  messageId: string;
  phoneNumberId?: string;
  businessId?: string;
}) {
  const credentials = await resolveSendCredentials({
    phoneNumberId: input.phoneNumberId,
    businessId: input.businessId,
  });
  if (!credentials || !input.messageId) {
    return;
  }

  try {
    await fetch(`${GRAPH_URL}/${credentials.phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${credentials.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        status: "read",
        message_id: input.messageId,
        typing_indicator: { type: "text" },
      }),
    });
  } catch {
    // Typing is best-effort; never block the reply path.
  }
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
      to: normalizeWaId(input.to),
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
      to: normalizeWaId(input.to),
      type: "image",
      image: {
        link: input.imageUrl,
        ...(input.caption ? { caption: input.caption } : {}),
      },
    },
  });
}

export type WhatsAppTemplateComponent = {
  type: "header" | "body" | "button";
  sub_type?: "url" | "quick_reply";
  index?: string;
  parameters: Array<Record<string, unknown>>;
};

/** Approved Meta templates — works outside the 24h session window. */
export async function sendWhatsAppTemplate(input: {
  to: string;
  name: string;
  language?: string;
  components?: WhatsAppTemplateComponent[];
  phoneNumberId?: string;
  businessId?: string;
}) {
  return sendWhatsAppPayload({
    phoneNumberId: input.phoneNumberId,
    businessId: input.businessId,
    body: {
      to: normalizeWaId(input.to),
      type: "template",
      template: {
        name: input.name,
        language: { code: input.language ?? "id" },
        ...(input.components?.length ? { components: input.components } : {}),
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
      to: normalizeWaId(input.to),
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: input.bodyText.slice(0, 1024) },
        action: { buttons },
      },
    },
  });
}
