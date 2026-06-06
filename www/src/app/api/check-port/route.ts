import { NextRequest, NextResponse } from "next/server";
import net from "net";
import { getPoolServers } from "@/lib/poolConfig";
import poolConfig from "@/lib/poolConfig";

// Force this route to run in the Node.js runtime (required for net.Socket)
export const runtime = "nodejs";

// Build allowed hosts dynamically from config
function getAllowedHosts(): Set<string> {
  const hosts = new Set<string>();
  const servers = getPoolServers();
  servers.forEach((server) => {
    if (server.stratumUrl) {
      hosts.add(server.stratumUrl);
    }
  });
  // Also add the main stratum host from config
  if (poolConfig.stratum.host) {
    hosts.add(poolConfig.stratum.host);
  }
  return hosts;
}

// Build allowed ports dynamically from config
function getAllowedPorts(): Set<number> {
  const ports = new Set<number>();
  const servers = getPoolServers();
  servers.forEach((server) => {
    if (server.stratumPorts) {
      server.stratumPorts.forEach((port) => ports.add(port));
    }
  });
  // Also add main stratum ports from config
  if (poolConfig.stratum.ports) {
    poolConfig.stratum.ports.forEach((port) => ports.add(port));
  }
  return ports;
}

// TCP health check endpoint.
// Example usage: /api/check-port?host=stratum1.example.com&port=8002
// Returns JSON: { healthy: boolean }
// SECURITY: Only whitelisted hosts and ports are allowed to prevent SSRF attacks
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const host = searchParams.get("host");
  const portParam = searchParams.get("port");

  if (!host || !portParam) {
    return NextResponse.json({ error: "Missing host or port query parameter" }, { status: 400 });
  }

  const port = parseInt(portParam, 10);
  if (Number.isNaN(port) || port <= 0 || port >= 65536) {
    return NextResponse.json({ error: "Invalid port number" }, { status: 400 });
  }

  // SECURITY: ホワイトリストチェック - 許可されていないホスト/ポートは拒否
  const allowedHosts = getAllowedHosts();
  const allowedPorts = getAllowedPorts();

  if (!allowedHosts.has(host)) {
    console.warn(`[Security] Blocked request to unauthorized host: ${host}`);
    return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
  }

  if (!allowedPorts.has(port)) {
    console.warn(`[Security] Blocked request to unauthorized port: ${port}`);
    return NextResponse.json({ error: "Port not allowed" }, { status: 403 });
  }

  // Attempt to establish a TCP connection with a 3-second timeout and measure RTT.
  const timeoutMs = 3000;

  return new Promise<NextResponse>((resolve) => {
    const t0 = Date.now();
    const socket = new net.Socket();
    let resolved = false;

    const finish = (healthy: boolean) => {
      if (resolved) return;
      resolved = true;
      const latency = Date.now() - t0;
      socket.destroy();
      resolve(
        NextResponse.json(
          { healthy, latency },
          {
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type",
            },
          }
        )
      );
    };

    socket.setTimeout(timeoutMs);

    socket
      .connect(port, host, () => finish(true))
      .on("error", () => finish(false))
      .on("timeout", () => finish(false));
  });
}

export async function OPTIONS() {
  return NextResponse.json(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
