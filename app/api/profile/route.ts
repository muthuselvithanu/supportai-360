import { NextResponse } from "next/server";
import { currentUser } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({
    data: currentUser,
    source: "local-placeholder",
    salesforceConnected: false
  });
}

export async function PUT(request: Request) {
  const payload = await request.json().catch(() => ({}));

  return NextResponse.json({
    data: {
      ...currentUser,
      ...payload
    },
    message: "Profile update placeholder accepted. Salesforce profile sync is not connected yet."
  });
}
