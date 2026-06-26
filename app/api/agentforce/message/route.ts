import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SALESFORCE_ACCESS_TOKEN_COOKIE } from "@/services/salesforceOAuth";
import { DEFAULT_AGENT_MESSAGE, sendAgentforceMessage } from "@/services/salesforceAgentforce";

type AgentforcePayload = {
  message?: unknown;
};

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(SALESFORCE_ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return NextResponse.json(
      {
        connected: false,
        message: "Sign in with Salesforce before using Agentforce."
      },
      { status: 401 }
    );
  }

  const payload = (await request.json().catch(() => ({}))) as AgentforcePayload;
  const message = typeof payload.message === "string" && payload.message.trim()
    ? payload.message.trim()
    : DEFAULT_AGENT_MESSAGE;

  try {
    const agentResponse = await sendAgentforceMessage(accessToken, message);

    return NextResponse.json({
      connected: true,
      message,
      responseText: agentResponse.text,
      data: agentResponse.raw
    });
  } catch (error) {
    return NextResponse.json(
      {
        connected: true,
        error: error instanceof Error ? error.message : "Unable to send message to Agentforce."
      },
      { status: 502 }
    );
  }
}
