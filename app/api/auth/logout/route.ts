import { NextResponse } from "next/server";
import {
  SALESFORCE_ACCESS_TOKEN_COOKIE,
  SALESFORCE_AUTH_STATE_COOKIE,
  SALESFORCE_CODE_VERIFIER_COOKIE,
  SALESFORCE_INSTANCE_URL_COOKIE
} from "@/services/salesforceOAuth";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));

  response.cookies.delete(SALESFORCE_ACCESS_TOKEN_COOKIE);
  response.cookies.delete(SALESFORCE_INSTANCE_URL_COOKIE);
  response.cookies.delete(SALESFORCE_AUTH_STATE_COOKIE);
  response.cookies.delete(SALESFORCE_CODE_VERIFIER_COOKIE);

  return response;
}
