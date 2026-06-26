import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  SALESFORCE_ACCESS_TOKEN_COOKIE,
  SALESFORCE_INSTANCE_URL_COOKIE
} from "@/services/salesforceOAuth";
import { getSalesforceCaseById, listSalesforceCases } from "@/services/salesforceCases";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(SALESFORCE_ACCESS_TOKEN_COOKIE)?.value;
  const instanceUrl = cookieStore.get(SALESFORCE_INSTANCE_URL_COOKIE)?.value;

  if (!accessToken || !instanceUrl) {
    return NextResponse.json(
      {
        data: [],
        salesforceConnected: false,
        message: "Sign in with Salesforce to load cases."
      },
      { status: 401 }
    );
  }

  try {
    const url = new URL(request.url);
    const caseId = url.searchParams.get("caseId");

    if (caseId) {
      const supportCase = await getSalesforceCaseById(instanceUrl, accessToken, caseId);

      if (!supportCase) {
        return NextResponse.json(
          {
            data: null,
            salesforceConnected: true,
            message: "Case not found."
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        data: supportCase,
        salesforceConnected: true
      });
    }

    const cases = await listSalesforceCases(instanceUrl, accessToken);

    return NextResponse.json({
      data: cases,
      salesforceConnected: true
    });
  } catch (error) {
    return NextResponse.json(
      {
        data: [],
        salesforceConnected: true,
        error: error instanceof Error ? error.message : "Unable to load Salesforce cases."
      },
      { status: 502 }
    );
  }
}
