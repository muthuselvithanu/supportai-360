import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  SALESFORCE_ACCESS_TOKEN_COOKIE,
  SALESFORCE_INSTANCE_URL_COOKIE
} from "@/services/salesforceOAuth";
import { createSalesforceCase } from "@/services/salesforceCases";

type CallbackPayload = {
  contactEmail?: unknown;
  phone?: unknown;
  preferredTime?: unknown;
  reason?: unknown;
};

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(SALESFORCE_ACCESS_TOKEN_COOKIE)?.value;
  const instanceUrl = cookieStore.get(SALESFORCE_INSTANCE_URL_COOKIE)?.value;

  if (!accessToken || !instanceUrl) {
    return NextResponse.json(
      { connected: false, message: "Sign in with Salesforce before requesting a callback." },
      { status: 401 }
    );
  }

  const payload = (await request.json().catch(() => ({}))) as CallbackPayload;
  const contactEmail = getString(payload.contactEmail);
  const phone = getString(payload.phone);
  const preferredTime = getString(payload.preferredTime);
  const reason = getString(payload.reason);

  if (!contactEmail || !phone || !preferredTime || !reason) {
    return NextResponse.json(
      { connected: true, message: "Customer email, phone, preferred callback time, and reason are required." },
      { status: 400 }
    );
  }

  try {
    const result = await createSalesforceCase(instanceUrl, accessToken, {
      contactEmail,
      subject: "Callback request",
      description: `Callback phone: ${phone}\nPreferred time: ${preferredTime}\nReason: ${reason}`,
      priority: "Medium"
    });

    return NextResponse.json({ connected: true, contactEmail, data: result });
  } catch (error) {
    return NextResponse.json(
      {
        connected: true,
        error: error instanceof Error ? error.message : "Unable to create callback request."
      },
      { status: 502 }
    );
  }
}
