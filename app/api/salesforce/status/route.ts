import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  SALESFORCE_ACCESS_TOKEN_COOKIE,
  SALESFORCE_INSTANCE_URL_COOKIE
} from "@/services/salesforceOAuth";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(SALESFORCE_ACCESS_TOKEN_COOKIE)?.value;
  const instanceUrl = cookieStore.get(SALESFORCE_INSTANCE_URL_COOKIE)?.value;
  const connected = Boolean(accessToken && instanceUrl);

  return NextResponse.json({
    connected,
    provider: "salesforce",
    agentforceReady: connected,
    instanceUrl: connected ? instanceUrl : null,
    message: connected
      ? "Salesforce is connected."
      : "Salesforce integration has not been authorized yet."
  });
}
