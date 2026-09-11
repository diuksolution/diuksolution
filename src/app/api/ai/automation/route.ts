import { NextResponse } from "next/server";
import {
  getOrCreateAiAutomationSettings,
  updateAiAutomationSettings,
} from "@/lib/ai/settings";
import { getLlmConfig } from "@/lib/ai/llm";
import { getCurrentUser } from "@/lib/current-user";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getOrCreateAiAutomationSettings(user.businessId);
  const llm = getLlmConfig();

  return NextResponse.json({
    settings,
    llm: llm
      ? {
          provider: llm.provider,
          model: llm.model,
          configured: true,
        }
      : {
          provider: null,
          model: null,
          configured: false,
        },
  });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    enabled?: boolean;
    welcomeEnabled?: boolean;
    welcomePrompt?: string;
    bookingSystemPrompt?: string;
  };

  const settings = await updateAiAutomationSettings(user.businessId, {
    enabled: body.enabled,
    welcomeEnabled: body.welcomeEnabled,
    welcomePrompt: body.welcomePrompt,
    bookingSystemPrompt: body.bookingSystemPrompt,
  });

  return NextResponse.json({ settings });
}
