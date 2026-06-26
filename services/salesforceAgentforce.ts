type AgentforceMessageResponse = {
  text: string;
  raw: unknown;
};

type AgentforceSessionResponse = {
  sessionId?: string;
  id?: string;
  sessionInfo?: {
    sessionId?: string;
  };
};

const DEFAULT_AGENT_MESSAGE =
  "Create a support case for muthuselvithanu@gmail.com. Subject is Billing issue. Description is customer was charged twice. Priority is High.";

function normalizeUrl(value: string) {
  const withProtocol = value.startsWith("http") ? value : `https://${value}`;
  return withProtocol.replace(/\/$/, "");
}

function getAgentforceConfig() {
  const agentId = process.env.SALESFORCE_AGENT_ID;
  const apiHost = process.env.SALESFORCE_AGENT_API_HOST;
  const myDomainUrl = process.env.SALESFORCE_MY_DOMAIN_URL;

  if (!agentId || !apiHost || !myDomainUrl) {
    throw new Error(
      "Missing Agentforce config. Set SALESFORCE_AGENT_ID, SALESFORCE_AGENT_API_HOST, and SALESFORCE_MY_DOMAIN_URL."
    );
  }

  return {
    agentId,
    apiHost: normalizeUrl(apiHost),
    myDomainUrl: normalizeUrl(myDomainUrl)
  };
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

        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          return contentToText(record.text) ?? contentToText(record.content) ?? contentToText(record.message);
        }

        return null;
      })
      .filter(Boolean);

    return parts.length ? parts.join("\n") : null;
  }

  return null;
}

function extractSessionId(payload: AgentforceSessionResponse) {
  return payload.sessionId ?? payload.id ?? payload.sessionInfo?.sessionId;
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
    contentToText(data.output) ??
    contentToText(data.messages);

  if (directText) {
    return directText;
  }

  if (Array.isArray(data.responses) && data.responses.length > 0) {
    const latestResponse = data.responses[data.responses.length - 1];

    if (latestResponse && typeof latestResponse === "object") {
      const latest = latestResponse as Record<string, unknown>;
      const latestText = contentToText(latest.message) ?? contentToText(latest.content) ?? contentToText(latest.text);

      if (latestText) {
        return latestText;
      }
    }
  }

  return JSON.stringify(payload);
}

async function parseResponse(response: Response) {
  const rawText = await response.text();

  if (!rawText) {
    return null;
  }

  try {
    return JSON.parse(rawText) as unknown;
  } catch {
    return rawText;
  }
}

async function agentforceRequest<T>(
  accessToken: string,
  url: string,
  init: RequestInit,
  context: string
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {})
    },
    cache: "no-store"
  });
  const payload = await parseResponse(response);

  if (!response.ok) {
    const detail = payload ? JSON.stringify(payload) : "empty response body";
    throw new Error(`${context} failed: ${response.status}. URL: ${url}. Response: ${detail}`);
  }

  return payload as T;
}

async function startAgentforceSession(
  accessToken: string,
  agentId: string,
  apiHost: string,
  myDomainUrl: string
) {
  const sessionKey = crypto.randomUUID();
  const url = `${apiHost}/einstein/ai-agent/v1/agents/${agentId}/sessions`;
  const payload = await agentforceRequest<AgentforceSessionResponse>(accessToken, url, {
    method: "POST",
    body: JSON.stringify({
      externalSessionKey: sessionKey,
      instanceConfig: {
        endpoint: myDomainUrl
      },
      streamingCapabilities: {
        chunkTypes: ["Text"]
      },
      bypassUser: true
    })
  }, "Agentforce start session");
  const sessionId = extractSessionId(payload);

  if (!sessionId) {
    throw new Error(`Agentforce start session did not return a session id: ${JSON.stringify(payload)}`);
  }

  return sessionId;
}

async function sendSynchronousAgentforceMessage(
  accessToken: string,
  apiHost: string,
  sessionId: string,
  message: string
) {
  const url = `${apiHost}/einstein/ai-agent/v1/sessions/${sessionId}/messages`;
  return agentforceRequest<unknown>(accessToken, url, {
    method: "POST",
    body: JSON.stringify({
      message: {
        sequenceId: 1,
        type: "Text",
        text: message
      }
    })
  }, "Agentforce send message");
}

async function endAgentforceSession(accessToken: string, apiHost: string, sessionId: string) {
  const url = `${apiHost}/einstein/ai-agent/v1/sessions/${sessionId}`;

  try {
    await agentforceRequest<unknown>(accessToken, url, { method: "DELETE" }, "Agentforce end session");
  } catch {
    // Ending the session is cleanup only. Preserve the main agent response if cleanup fails.
  }
}

export async function sendAgentforceMessage(
  accessToken: string,
  message = DEFAULT_AGENT_MESSAGE
): Promise<AgentforceMessageResponse> {
  const { agentId, apiHost, myDomainUrl } = getAgentforceConfig();
  const sessionId = await startAgentforceSession(accessToken, agentId, apiHost, myDomainUrl);

  try {
    const responsePayload = await sendSynchronousAgentforceMessage(
      accessToken,
      apiHost,
      sessionId,
      message
    );

    return {
      text: extractAgentResponseText(responsePayload),
      raw: responsePayload
    };
  } finally {
    await endAgentforceSession(accessToken, apiHost, sessionId);
  }
}

export { DEFAULT_AGENT_MESSAGE };

