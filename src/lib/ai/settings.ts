import { prisma } from "@/lib/prisma";
import {
  DEFAULT_BOOKING_SYSTEM_PROMPT,
  DEFAULT_WELCOME_PROMPT,
} from "@/lib/ai/prompt-defaults";

export {
  DEFAULT_BOOKING_SYSTEM_PROMPT,
  DEFAULT_WELCOME_PROMPT,
} from "@/lib/ai/prompt-defaults";

export type AiAutomationSettingsDto = {
  id: string;
  enabled: boolean;
  welcomeEnabled: boolean;
  welcomePrompt: string;
  bookingSystemPrompt: string;
  updatedAt: string;
};

function mapSettings(row: {
  id: string;
  enabled: boolean;
  welcomeEnabled: boolean;
  welcomeMessage: string;
  bookingSystemPrompt: string;
  updatedAt: Date;
}): AiAutomationSettingsDto {
  return {
    id: row.id,
    enabled: row.enabled,
    welcomeEnabled: row.welcomeEnabled,
    welcomePrompt: row.welcomeMessage,
    bookingSystemPrompt: row.bookingSystemPrompt,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getOrCreateAiAutomationSettings(businessId: string) {
  const existing = await prisma.aiAutomationSettings.findUnique({
    where: { businessId },
  });
  if (existing) {
    return mapSettings(existing);
  }

  const created = await prisma.aiAutomationSettings.create({
    data: {
      businessId,
      welcomeMessage: DEFAULT_WELCOME_PROMPT,
      bookingSystemPrompt: DEFAULT_BOOKING_SYSTEM_PROMPT,
    },
  });

  return mapSettings(created);
}

export async function updateAiAutomationSettings(
  businessId: string,
  input: {
    enabled?: boolean;
    welcomeEnabled?: boolean;
    welcomePrompt?: string;
    bookingSystemPrompt?: string;
  },
) {
  await getOrCreateAiAutomationSettings(businessId);

  const updated = await prisma.aiAutomationSettings.update({
    where: { businessId },
    data: {
      ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
      ...(input.welcomeEnabled !== undefined
        ? { welcomeEnabled: input.welcomeEnabled }
        : {}),
      ...(input.welcomePrompt !== undefined
        ? { welcomeMessage: input.welcomePrompt }
        : {}),
      ...(input.bookingSystemPrompt !== undefined
        ? { bookingSystemPrompt: input.bookingSystemPrompt }
        : {}),
    },
  });

  return mapSettings(updated);
}

export function renderPromptTemplate(
  template: string,
  vars: Record<string, string>,
) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    return vars[key] ?? "";
  });
}
