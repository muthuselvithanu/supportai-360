import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  SALESFORCE_ACCESS_TOKEN_COOKIE,
  SALESFORCE_INSTANCE_URL_COOKIE
} from "@/services/salesforceOAuth";
import { createSalesforceCase, type SalesforceCasePriority } from "@/services/salesforceCases";

const priorities: SalesforceCasePriority[] = ["Low", "Medium", "High"];

type CreateCasePayload = {
  contactEmail?: unknown;
  subject?: unknown;
  description?: unknown;
  priority?: unknown;
};

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parsePayload(payload: CreateCasePayload) {
  const contactEmail = getString(payload.contactEmail);
  const subject = getString(payload.subject);
  const description = getString(payload.description);
  const priority = getString(payload.priority) as SalesforceCasePriority;

  if (!contactEmail || !subject || !description || !priorities.includes(priority)) {
    return null;
  }

  return {
    contactEmail,
    subject,
    description,
    priority
  };
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(SALESFORCE_ACCESS_TOKEN_COOKIE)?.value;
  const instanceUrl = cookieStore.get(SALESFORCE_INSTANCE_URL_COOKIE)?.value;

  if (!accessToken || !instanceUrl) {
    return NextResponse.json(
      {
        connected: false,
        message: "Sign in with Salesforce before creating a Salesforce case."
      },
      { status: 401 }
    );
  }

  const payload = parsePayload((await request.json().catch(() => ({}))) as CreateCasePayload);

  if (!payload) {
    return NextResponse.json(
      {
        connected: true,
        message: "Customer email, case subject, case description, and priority are required."
      },
      { status: 400 }
    );
  }

  try {
    const result = await createSalesforceCase(instanceUrl, accessToken, payload);

    return NextResponse.json({
      connected: true,
      contactEmail: payload.contactEmail,
      data: result
    });
  } catch (error) {
    return NextResponse.json(
      {
        connected: true,
        error: error instanceof Error ? error.message : "Unable to create Salesforce case."
      },
      { status: 502 }
    );
  }
}
