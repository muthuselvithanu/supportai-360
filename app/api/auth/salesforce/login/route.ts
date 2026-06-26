import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  buildSalesforceAuthorizeUrl,
  createPkceChallenge,
  createPkceVerifier,
  SALESFORCE_AUTH_STATE_COOKIE,
  SALESFORCE_CODE_VERIFIER_COOKIE
} from "@/services/salesforceOAuth";

export async function GET(request: Request) {
  try {
    const state = crypto.randomUUID();
    const codeVerifier = createPkceVerifier();
    const codeChallenge = createPkceChallenge(codeVerifier);
    const authorizeUrl = buildSalesforceAuthorizeUrl(request.url, state, codeChallenge);
    const cookieStore = await cookies();
    const cookieOptions = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 10 * 60
    };

    cookieStore.set(SALESFORCE_AUTH_STATE_COOKIE, state, cookieOptions);
    cookieStore.set(SALESFORCE_CODE_VERIFIER_COOKIE, codeVerifier, cookieOptions);

    return NextResponse.redirect(authorizeUrl);
  } catch (error) {
    return NextResponse.json(
      {
        connected: false,
        error: error instanceof Error ? error.message : "Unable to start Salesforce login."
      },
      { status: 500 }
    );
  }
}
