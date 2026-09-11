import {
  getWhatsAppAccessToken,
  getWhatsAppPhoneNumberId,
} from "@/lib/whatsapp/signature";

const GRAPH_URL = "https://graph.facebook.com/v21.0";

export async function sendWhatsAppText(input: {
  to: string;
  text: string;
  phoneNumberId?: string;
}) {
  const token = getWhatsAppAccessToken();
  const phoneNumberId = input.phoneNumberId || getWhatsAppPhoneNumberId();

  if (!token || !phoneNumberId) {
    throw new Error("WhatsApp is not configured.");
  }

  const response = await fetch(`${GRAPH_URL}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: input.to,
      type: "text",
      text: { body: input.text, preview_url: false },
    }),
  });

  const payload = (await response.json()) as {
    messages?: Array<{ id?: string }>;
    error?: { message?: string };
  };

  if (!response.ok || !payload.messages?.[0]?.id) {
    throw new Error(payload.error?.message ?? "Failed to send WhatsApp message.");
  }

  return payload.messages[0].id;
}
