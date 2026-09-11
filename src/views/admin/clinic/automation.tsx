import { AiAutomationWorkspace } from "@/components/admin/ai-automation/ai-automation-workspace";
import { getLlmConfig } from "@/lib/ai/llm";
import { getOrCreateAiAutomationSettings } from "@/lib/ai/settings";
import { requireUser } from "@/lib/current-user";

export async function ClinicAutomationView() {
  const user = await requireUser();
  const settings = await getOrCreateAiAutomationSettings(user.businessId);
  const llm = getLlmConfig();

  return (
    <AiAutomationWorkspace
      settings={settings}
      llm={
        llm
          ? {
              provider: llm.provider,
              model: llm.model,
              configured: true,
            }
          : {
              provider: null,
              model: null,
              configured: false,
            }
      }
    />
  );
}
