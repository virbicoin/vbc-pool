import poolConfig from "./poolConfig";

// Get API base URL from config
export const API_BASE_URL = poolConfig.api.baseUrl || "";

const getBaseUrl = () => {
  return API_BASE_URL;
};

export interface Block {
  uncle?: string;
  height: number;
  hash: string;
  timestamp: number;
  value: number;
  immature: boolean;
  pending: boolean;
  orphan: boolean;
  difficulty: number;
  reward?: string | number;
  shares?: number;
}

export interface BlocksData {
  matured?: Block[];
  immature?: Block[];
  candidates?: Block[];
}

export async function getBlocks(): Promise<BlocksData> {
  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/blocks`, {
      next: { revalidate: 10 }, // Revalidate every 10 seconds
    });

    if (!res.ok) {
      console.error("Failed to fetch blocks", res.status, res.statusText);
      return {};
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching blocks data:", error);
    return {};
  }
}

export interface Payment {
  timestamp: number;
  amount: number;
  address: string;
  tx: string;
}

export interface PaymentsData {
  payments?: Payment[];
}

export async function getPayments(): Promise<PaymentsData> {
  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/payments`, {
      next: { revalidate: 10 }, // Revalidate every 10 seconds
    });

    if (!res.ok) {
      console.error("Failed to fetch payments", res.status, res.statusText);
      return {};
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching payments data:", error);
    return {};
  }
}

export interface Node {
  name: string;
  blockHeight: number;
  lastBeat: number;
  difficulty: string;
  height: string;
}

// THIS IS THE NEW INTERFACE FOR THE DASHBOARD
export interface StatsData {
  time: number;
  hashrate: number;
  networkHashrate: number;
  minersTotal: number;
  nodes: { difficulty: string; height: string }[];
  stats: {
    lastBlockFound: number;
    roundShares: number;
    networkHashrate: number;
    networkDifficulty: number;
    height: number;
    roundVariance: number;
  };
  maturedTotal?: number;
  immatureTotal?: number;
  candidatesTotal?: number;
}

export async function getStats(): Promise<StatsData> {
  const baseUrl = getBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/stats`, {
      next: { revalidate: 10 }, // Revalidate every 10 seconds
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch stats: ${res.statusText}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching stats data:", error);
    // Return a default/empty state to avoid breaking the page
    return {
      time: Date.now(),
      hashrate: 0,
      networkHashrate: 0,
      minersTotal: 0,
      nodes: [],
      stats: {
        lastBlockFound: 0,
        roundShares: 0,
        networkHashrate: 0,
        networkDifficulty: 0,
        height: 0,
        roundVariance: 0,
      },
      maturedTotal: 0,
      immatureTotal: 0,
      candidatesTotal: 0,
    };
  }
}

export interface AccountStats {
  balance: number;
  blocksFound: number;
  immature: number;
  lastShare: number;
  paid: number;
  pending: number;
}

export interface AccountWorker {
  name: string;
  hr: number;
  hr2: number;
  lastBeat: number;
  offline: boolean;
  tx: string;
}

export interface AccountPayment {
  amount: number;
  timestamp: number;
  tx: string;
}

export interface AccountData {
  stats: AccountStats;
  workers: { [key: string]: AccountWorker };
  payments: AccountPayment[];
  currentHashrate: number; // For Hashrate (30m)
  hashrate: number; // For Hashrate (3h)
  roundShares: number;
  paymentsTotal: number;
  workersOnline: number;
}

export async function getAccount(address: string): Promise<Partial<AccountData>> {
  if (!address) return {};
  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/accounts/${address}`);
    if (!res.ok) {
      console.error(`Failed to fetch account ${address}`, res.status, res.statusText);
      return {};
    }
    return res.json();
  } catch (error) {
    console.error(`Error fetching account data for ${address}:`, error);
    return {};
  }
}

export interface Miner {
  miner: string;
  hr: number;
  lastBeat: number;
  offline: boolean;
}

export interface MinersData {
  now: number;
  miners: { [key: string]: Omit<Miner, "login"> };
  total: number;
}

export async function getMiners(): Promise<{ [key: string]: Omit<Miner, "miner"> }> {
  const res = await fetch(`${getBaseUrl()}/api/miners`);
  if (!res.ok) {
    throw new Error("Failed to fetch miners");
  }
  const data = await res.json();
  return data.miners || {};
}

export interface Config {
  blockTime: number;
  poolFee: number;
  minPayment: number;
}

export interface PoolStats {
  poolHeight: number;
  networkHeight: number;
  networkDifficulty: number;
  poolHashrate: number;
  miners: number;
}

export interface Pool {
  poolStats: PoolStats;
  config: Config;
  blocks: Block[];
  payments: Payment[];
  totalPayments: number;
}

export interface PoolData {
  pools: {
    [key: string]: Pool;
  };
  roundShares: number;
  miners: number;
  hashrate: number;
}
