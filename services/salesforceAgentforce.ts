type AgentforceMessageResponse = {
  text: string;
  raw: unknown;
};

const DEFAULT_AGENT_MESSAGE =
  "Create a support case for muthuselvithanu@gmail.com. Subject is Billing issue. Description is customer was charged twice. Priority is High.";

function getAgentforceConfig() {
  const agentId = process.env.SALESFORCE_AGENT_ID;
  const apiUrl = process.env.SALESFORCE_AGENT_API_URL;

  if (!agentId || !apiUrl) {
    throw new Error("Missing Agentforce config. Set SALESFORCE_AGENT_ID and SALESFORCE_AGENT_API_URL.");
  }

  return { agentId, apiUrl };
}

function contentToText(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    const parts = value
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (item && typeof item === "object" && "text" in item) {
          return contentToText((item as { text: unknown }).text);
        }

        return null;
      })
      .filter(Boolean);

    return parts.length ? parts.join("\n") : null;
  }

  return null;
}

function extractAgentResponseText(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return typeof payload === "string" ? payload : "Agentforce returned an empty response.";
  }

  const data = payload as Record<string, unknown>;
  const directText =
    contentToText(data.text) ??
    contentToText(data.message) ??
    contentToText(data.response) ??
    contentToText(data.output);

  if (directText) {
    return directText;
  }

  if (Array.isArray(data.messages) && data.messages.length > 0) {
    const latestMessage = data.messages[data.messages.length - 1];

    if (latestMessage && typeof latestMessage === "object") {
      const latest = latestMessage as Record<string, unknown>;
      const latestText = contentToText(latest.content) ?? contentToText(latest.text) ?? contentToText(latest.message);

      if (latestText) {
        return latestText;
      }
    }
  }

  return JSON.stringify(payload);
}

export async function sendAgentforceMessage(
  accessToken: string,
  message = DEFAULT_AGENT_MESSAGE
): Promise<AgentforceMessageResponse> {
  const { agentId, apiUrl } = getAgentforceConfig();
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      agentId,
      message,
      messages: [
        {
          role: "user",
          content: message
        }
      ]
    }),
    cache: "no-store"
  });

  const rawText = await response.text();
  let payload: unknown = rawText;

  if (rawText) {
    try {
      payload = JSON.parse(rawText);
    } catch {
      payload = rawText;
    }
  } else {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(`Agentforce request failed: ${response.status} ${rawText}`);
  }

  return {
    text: extractAgentResponseText(payload),
    raw: payload
  };
}

export { DEFAULT_AGENT_MESSAGE };

