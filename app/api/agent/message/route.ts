import { NextResponse } from "next/server";
import { sendAgentforceMessage } from "@/lib/agentforce/agentforce-service";
import type { AgentforceMessage } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({ messages: [] }));
  const messages = Array.isArray(body.messages) ? (body.messages as AgentforceMessage[]) : [];
  const response = await sendAgentforceMessage(messages);

  return NextResponse.json({
    data: response,
    source: "agentforce-placeholder",
    salesforceConnected: false
  });
}
