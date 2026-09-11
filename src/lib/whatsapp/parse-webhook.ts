export type WhatsAppInboundMessage = {
  wabaId?: string;
  phoneNumberId?: string;
  displayPhoneNumber?: string;
  from: string;
  timestamp: string;
  messageId: string;
  type: string;
  text?: string;
  contactName?: string;
};

export type WhatsAppMessageStatus = {
  messageId: string;
  status: string;
  timestamp: string;
  recipientId: string;
};

export type ParsedWhatsAppWebhook = {
  messages: WhatsAppInboundMessage[];
  statuses: WhatsAppMessageStatus[];
};

type WhatsAppChangeValue = {
  metadata?: {
    display_phone_number?: string;
    phone_number_id?: string;
  };
  contacts?: Array<{
    profile?: { name?: string };
    wa_id?: string;
  }>;
  messages?: Array<{
    from?: string;
    id?: string;
    timestamp?: string;
    type?: string;
    text?: { body?: string };
  }>;
  statuses?: Array<{
    id?: string;
    status?: string;
    timestamp?: string;
    recipient_id?: string;
  }>;
};

type WhatsAppWebhookBody = {
  entry?: Array<{
    id?: string;
    changes?: Array<{
      value?: WhatsAppChangeValue;
    }>;
  }>;
};

export function parseWhatsAppWebhook(body: unknown): ParsedWhatsAppWebhook {
  const payload = body as WhatsAppWebhookBody;
  const messages: WhatsAppInboundMessage[] = [];
  const statuses: WhatsAppMessageStatus[] = [];

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      if (!value) {
        continue;
      }

      const contactNames = new Map<string, string>();
      for (const contact of value.contacts ?? []) {
        if (contact.wa_id && contact.profile?.name) {
          contactNames.set(contact.wa_id, contact.profile.name);
        }
      }

      for (const message of value.messages ?? []) {
        if (!message.from || !message.id) {
          continue;
        }

        messages.push({
          wabaId: entry.id,
          phoneNumberId: value.metadata?.phone_number_id,
          displayPhoneNumber: value.metadata?.display_phone_number,
          from: message.from,
          timestamp: message.timestamp ?? "",
          messageId: message.id,
          type: message.type ?? "unknown",
          text: message.text?.body,
          contactName: contactNames.get(message.from),
        });
      }

      for (const status of value.statuses ?? []) {
        if (!status.id || !status.status || !status.recipient_id) {
          continue;
        }

        statuses.push({
          messageId: status.id,
          status: status.status,
          timestamp: status.timestamp ?? "",
          recipientId: status.recipient_id,
        });
      }
    }
  }

  return { messages, statuses };
}
