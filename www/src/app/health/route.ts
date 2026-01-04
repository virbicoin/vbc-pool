import { NextResponse } from "next/server";
import os from "os";

// Use the Node.js runtime so we can call os.hostname()
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    hostname: os.hostname(), // add hostname for debugging
    time: new Date().toISOString(),
  });
}
