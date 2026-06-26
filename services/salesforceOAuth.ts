import { createHash, randomBytes } from "crypto";

export const SALESFORCE_ACCESS_TOKEN_COOKIE = "sf_access_token";
export const SALESFORCE_INSTANCE_URL_COOKIE = "sf_instance_url";
export const SALESFORCE_AUTH_STATE_COOKIE = "sf_oauth_state";
export const SALESFORCE_CODE_VERIFIER_COOKIE = "sf_code_verifier";

const DEFAULT_SALESFORCE_LOGIN_URL = "https://login.salesforce.com";

export type SalesforceTokenResponse = {
  access_token: string;
  instance_url: string;
  id?: string;
  issued_at?: string;
  signature?: string;
  token_type: string;
  scope?: string;
};

export function getSalesforceLoginUrl() {
  return process.env.SALESFORCE_LOGIN_URL ?? DEFAULT_SALESFORCE_LOGIN_URL;
}

export function getSalesforceRedirectUri(requestUrl: string) {
  if (process.env.SALESFORCE_REDIRECT_URI) {
    return process.env.SALESFORCE_REDIRECT_URI;
  }

  const url = new URL(requestUrl);
  return `${url.origin}/api/auth/callback`;
}

export function assertSalesforceOAuthConfig() {
  const clientId = process.env.SALESFORCE_CLIENT_ID;
  const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing Salesforce OAuth config. Set SALESFORCE_CLIENT_ID and SALESFORCE_CLIENT_SECRET."
    );
  }

  return { clientId, clientSecret };
}

function base64UrlEncode(value: Buffer) {
  return value
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function createPkceVerifier() {
  return base64UrlEncode(randomBytes(64));
}

export function createPkceChallenge(verifier: string) {
  return base64UrlEncode(createHash("sha256").update(verifier).digest());
}

export function buildSalesforceAuthorizeUrl(
  requestUrl: string,
  state: string,
  codeChallenge: string
) {
  const { clientId } = assertSalesforceOAuthConfig();
  const authorizeUrl = new URL("/services/oauth2/authorize", getSalesforceLoginUrl());

  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", getSalesforceRedirectUri(requestUrl));
  authorizeUrl.searchParams.set("scope", "api refresh_token");
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("code_challenge", codeChallenge);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");

  return authorizeUrl;
}

export async function exchangeSalesforceCodeForToken(
  code: string,
  requestUrl: string,
  codeVerifier: string
) {
  const { clientId, clientSecret } = assertSalesforceOAuthConfig();
  const tokenUrl = new URL("/services/oauth2/token", getSalesforceLoginUrl());
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: getSalesforceRedirectUri(requestUrl),
    code_verifier: codeVerifier
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Salesforce token exchange failed: ${response.status} ${errorText}`);
  }

  return (await response.json()) as SalesforceTokenResponse;
}
