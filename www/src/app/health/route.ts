import { NextResponse } from "next/server";

// Use the Node.js runtime
export const runtime = "nodejs";

export async function GET() {
  // SECURITY: Do not expose hostname in production
  return NextResponse.json({
    status: "healthy",
    time: new Date().toISOString(),
  });
}
