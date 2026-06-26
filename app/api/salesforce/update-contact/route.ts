import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  SALESFORCE_ACCESS_TOKEN_COOKIE,
  SALESFORCE_INSTANCE_URL_COOKIE
} from "@/services/salesforceOAuth";
import { updateSalesforceContact } from "@/services/salesforceContacts";

type UpdateContactPayload = {
  email?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  phone?: unknown;
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
      { connected: false, message: "Sign in with Salesforce before updating a contact." },
      { status: 401 }
    );
  }

  const payload = (await request.json().catch(() => ({}))) as UpdateContactPayload;
  const email = getString(payload.email);
  const firstName = getString(payload.firstName);
  const lastName = getString(payload.lastName);
  const phone = getString(payload.phone);

  if (!email || (!firstName && !lastName && !phone)) {
    return NextResponse.json(
      { connected: true, message: "Customer email and at least one contact field are required." },
      { status: 400 }
    );
  }

  try {
    const result = await updateSalesforceContact(instanceUrl, accessToken, {
      email,
      firstName,
      lastName,
      phone
    });

    if (!result) {
      return NextResponse.json(
        { connected: true, message: `No Salesforce Contact found for ${email}.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ connected: true, data: result });
  } catch (error) {
    return NextResponse.json(
      {
        connected: true,
        error: error instanceof Error ? error.message : "Unable to update Salesforce contact."
      },
      { status: 502 }
    );
  }
}
