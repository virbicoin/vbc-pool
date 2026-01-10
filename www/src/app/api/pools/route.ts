import { NextResponse } from "next/server";
import { getPoolServers } from "@/lib/poolConfig";

export async function GET() {
  try {
    const pools = getPoolServers();
    return NextResponse.json(pools);
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to load pool servers from config", details: String(e) },
      { status: 500 }
    );
  }
}
