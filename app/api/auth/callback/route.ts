import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  exchangeSalesforceCodeForToken,
  SALESFORCE_ACCESS_TOKEN_COOKIE,
  SALESFORCE_AUTH_STATE_COOKIE,
  SALESFORCE_CODE_VERIFIER_COOKIE,
  SALESFORCE_INSTANCE_URL_COOKIE
} from "@/services/salesforceOAuth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(SALESFORCE_AUTH_STATE_COOKIE)?.value;
  const codeVerifier = cookieStore.get(SALESFORCE_CODE_VERIFIER_COOKIE)?.value;

  if (!code) {
    return NextResponse.redirect(new URL("/assistant?salesforce=missing-code", request.url));
  }

  if (!state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/assistant?salesforce=invalid-state", request.url));
  }

  if (!codeVerifier) {
    return NextResponse.redirect(new URL("/assistant?salesforce=missing-verifier", request.url));
  }

  try {
    const token = await exchangeSalesforceCodeForToken(code, request.url, codeVerifier);
    const response = NextResponse.redirect(new URL("/assistant?salesforce=connected", request.url));
    const secure = process.env.NODE_ENV === "production";

    response.cookies.set(SALESFORCE_ACCESS_TOKEN_COOKIE, token.access_token, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 60 * 60
    });
    response.cookies.set(SALESFORCE_INSTANCE_URL_COOKIE, token.instance_url, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 60 * 60
    });
    response.cookies.delete(SALESFORCE_AUTH_STATE_COOKIE);
    response.cookies.delete(SALESFORCE_CODE_VERIFIER_COOKIE);

    return response;
  } catch (error) {
    const redirectUrl = new URL("/assistant", request.url);
    redirectUrl.searchParams.set("salesforce", "error");
    redirectUrl.searchParams.set(
      "message",
      error instanceof Error ? error.message : "Salesforce authentication failed."
    );

    return NextResponse.redirect(redirectUrl);
  }
}
