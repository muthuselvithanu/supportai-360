import type { AgentforceMessage } from "@/lib/types";

export async function sendAgentforceMessage(
  messages: AgentforceMessage[]
): Promise<AgentforceMessage> {
  void messages;
  return {
    role: "assistant",
    content:
      "Agentforce is not connected yet. This placeholder will call the headless Salesforce Agentforce API later."
  };
}

