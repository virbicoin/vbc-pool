// Pool configuration - loaded from config.json
// To customize, edit config.json in the www directory

// eslint-disable-next-line @typescript-eslint/no-require-imports
const configJson = require("@/../config.json");

// Pool server interface
export interface PoolServer {
  id: string;
  apiUrl: string;
  stratumUrl: string;
  location: string;
  flag: string;
  country: string;
  region: string;
  stratumPorts: number[];
  active: boolean;
}

// Config interface
interface PoolConfigType {
  coin: {
    name: string;
    symbol: string;
    shannonPerCoin: number;
    chainId: number;
    rpcUrl: string;
  };
  pool: {
    name: string;
    description: string;
    minPayout: number;
    fee: number;
    payoutInterval: string;
  };
  block: {
    reward: number;
    time: number;
  };
  branding: {
    logo: string;
    favicon: string;
    primaryColor: string;
  };
  links: {
    explorer: string;
    network: string;
    twitter: string;
    github: string;
    discord: string;
  };
  stratum: {
    host: string;
    port: number;
    ports: number[];
  };
  api: {
    baseUrl: string;
  };
  servers: PoolServer[];
  storage: {
    favorites: string;
    hashrateHistory: string;
    notificationsEnabled: string;
    lastBlockHeight: string;
  };
}

// Build config from JSON
const symbol = (configJson.coin?.symbol || "COIN").toLowerCase();

export const poolConfig: PoolConfigType = {
  coin: {
    name: configJson.coin?.name || "Coin",
    symbol: configJson.coin?.symbol || "COIN",
    shannonPerCoin: 1e9,
    chainId: configJson.coin?.chainId || 1,
    rpcUrl: configJson.coin?.rpcUrl || "",
  },
  pool: {
    name: configJson.pool?.name || "Mining Pool",
    description: configJson.pool?.description || "High performance mining pool",
    minPayout: configJson.pool?.minPayout || 0.1,
    fee: configJson.pool?.fee || 1,
    payoutInterval: configJson.pool?.payoutInterval || "2 Hours",
  },
  block: {
    reward: configJson.block?.reward || 2,
    time: configJson.block?.time || 15,
  },
  branding: {
    logo: configJson.branding?.logo || "/coin.svg",
    favicon: configJson.branding?.favicon || "/favicon.ico",
    primaryColor: configJson.branding?.primaryColor || "#22c55e",
  },
  links: {
    explorer: configJson.links?.explorer || "",
    network: configJson.links?.network || "",
    twitter: configJson.links?.twitter || "",
    github: configJson.links?.github || "",
    discord: configJson.links?.discord || "",
  },
  stratum: {
    host: configJson.stratum?.host || "stratum.example.com",
    port: configJson.stratum?.port || 8002,
    ports: configJson.stratum?.ports || [8002],
  },
  api: {
    baseUrl: configJson.api?.baseUrl || "",
  },
  servers: configJson.servers || [],
  storage: {
    favorites: `${symbol}-pool-favorites`,
    hashrateHistory: `${symbol}-hashrate-history`,
    notificationsEnabled: `${symbol}-pool-notifications-enabled`,
    lastBlockHeight: `${symbol}-pool-last-block-height`,
  },
};

// Helper function to get pool servers
export function getPoolServers(): PoolServer[] {
  return poolConfig.servers;
}

// Helper function to format coin amount from shannon
export function formatCoinAmount(shannon: number, decimals: number = 8): string {
  const amount = shannon / poolConfig.coin.shannonPerCoin;
  return `${amount.toFixed(decimals)} ${poolConfig.coin.symbol}`;
}

// Helper function to convert shannon to coin
export function shannonToCoin(shannon: number): number {
  return shannon / poolConfig.coin.shannonPerCoin;
}

export default poolConfig;
