import { NextResponse } from 'next/server';

// Use Node.js runtime so that AbortSignal.timeout is available and we can parallel fetch
export const runtime = 'nodejs';

// Build pool endpoints dynamically from env (NEXT_PUBLIC_POOL*_URL)
function getPoolEndpoints(): Record<string, string> {
    const endpoints: Record<string, string> = {};
    if (process.env['NEXT_PUBLIC_POOL_BASE_URL']) endpoints['pool'] = process.env['NEXT_PUBLIC_POOL_BASE_URL'];
    // Check all env vars, add those that match NEXT_PUBLIC_POOL{N}_URL
    Object.keys(process.env).forEach((key) => {
        const match = key.match(/^NEXT_PUBLIC_POOL(\d+)_URL$/);
        if (match && process.env[key]) {
            const poolId = `pool${match[1]}`;
            endpoints[poolId] = process.env[key] as string;
        }
    });
    return endpoints;
}

// Use dynamic endpoints
const POOL_ENDPOINTS = getPoolEndpoints();

export async function GET() {
  const checks = Object.entries(POOL_ENDPOINTS).map(async ([poolId, baseUrl]) => {
    const url = `${baseUrl}/health`;
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Virbicoin-Pool-Frontend/1.0',
        },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) {
        return { pool: poolId, status: 'unhealthy', error: `HTTP ${res.status}` };
      }
      const json = await res.json();
      return { pool: poolId, status: 'healthy', ...json };
    } catch (err) {
      return { pool: poolId, status: 'unhealthy', error: err instanceof Error ? err.message : 'unknown error' };
    }
  });
  const pools = await Promise.all(checks);
  const healthyExists = pools.some((p) => p.status === 'healthy');
  const statusCode = healthyExists ? 200 : 503;
  return NextResponse.json({ pools }, { status: statusCode });
}

export async function OPTIONS() {
  return NextResponse.json(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 