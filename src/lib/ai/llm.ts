export type LlmChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_call_id?: string;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }>;
};

export type LlmToolDefinition = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

function trimEnv(name: string) {
  return process.env[name]?.trim() || null;
}

/** Prefer OpenAI when OPENAI_API_KEY is set; otherwise Moonshot/Kimi. */
export function getLlmConfig(options?: { fast?: boolean }) {
  const openAiKey = trimEnv("OPENAI_API_KEY");
  if (openAiKey) {
    return {
      provider: "openai" as const,
      apiKey: openAiKey,
      baseUrl: (trimEnv("OPENAI_BASE_URL") || "https://api.openai.com/v1").replace(
        /\/$/,
        "",
      ),
      model: trimEnv("OPENAI_MODEL") || "gpt-4o-mini",
    };
  }

  const moonshotKey = trimEnv("MOONSHOT_API_KEY");
  if (moonshotKey) {
    const configured = trimEnv("MOONSHOT_MODEL") || "kimi-k2-turbo-preview";
    const fastModel =
      trimEnv("MOONSHOT_FAST_MODEL") || "kimi-k2-turbo-preview";
    return {
      provider: "moonshot" as const,
      apiKey: moonshotKey,
      baseUrl: (
        trimEnv("MOONSHOT_BASE_URL") || "https://api.moonshot.ai/v1"
      ).replace(/\/$/, ""),
      model:
        options?.fast && !configured.toLowerCase().includes("turbo")
          ? fastModel
          : configured,
    };
  }

  return null;
}

export async function createChatCompletion(input: {
  messages: LlmChatMessage[];
  tools?: LlmToolDefinition[];
  temperature?: number;
  fast?: boolean;
  timeoutMs?: number;
  maxTokens?: number;
}) {
  const config = getLlmConfig({ fast: input.fast });
  if (!config) {
    return null;
  }

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(input.timeoutMs ?? 12_000),
    body: JSON.stringify({
      model: config.model,
      messages: input.messages,
      tools: input.tools,
      tool_choice: input.tools?.length ? "auto" : undefined,
      // kimi-k2.x models only accept temperature = 1
      temperature:
        config.provider === "moonshot" ? 1 : (input.temperature ?? 0.3),
      max_tokens: input.maxTokens ?? 220,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${config.provider} LLM error: ${text}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: LlmChatMessage }>;
  };

  return {
    provider: config.provider,
    model: config.model,
    message: payload.choices?.[0]?.message ?? null,
  };
}
