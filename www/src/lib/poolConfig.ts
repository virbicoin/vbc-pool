// Pool configuration - loaded from config.json
// To customize, edit config.json in the www directory

// eslint-disable-next-line @typescript-eslint/no-require-imports
const configJson = require("@/../config.json");

// Supported locales
type Locale = "en" | "ja" | "zh";

// Localized string type - can be a string or an object with locale keys
type LocalizedString = string | Record<Locale, string>;

// Helper function to get localized value
export function getLocalizedValue(
  value: LocalizedString | undefined,
  locale: string,
  fallback: string = ""
): string {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  return value[locale as Locale] || value.en || fallback;
}

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

// Announcement interface (with localized strings)
export interface Announcement {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: LocalizedString;
  message: LocalizedString;
  enabled: boolean;
  link?: string;
}

// Miner download interface
export interface MinerDownload {
  name: string;
  url: string;
  os: string[];
  recommended: boolean;
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
    name: LocalizedString;
    description: LocalizedString;
    minPayout: number;
    fee: number;
    payoutInterval: string;
    address: string;
  };
  company: {
    name: string;
    startYear: number;
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
    telegram: string;
    bitcointalk: string;
  };
  announcements: Announcement[];
  miners: {
    downloads: MinerDownload[];
  };
  calculator: {
    defaultElectricityCost: number;
    defaultPowerConsumption: number;
    currencies: string[];
    priceApi: {
      url: string;
      tickerId: string;
      fallbackUrl: string;
    };
  };
  stratum: {
    host: string;
    port: number;
    ports: number[];
  };
  api: {
    baseUrl: string;
  };
  faucet: {
    enabled: boolean;
    amount: number;
    cooldownHours: number;
    maxDailyRequests: number;
    backendUrl: string;
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
    address: configJson.pool?.address || "",
  },
  company: {
    name: configJson.company?.name || "",
    startYear: configJson.company?.startYear || new Date().getFullYear(),
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
    telegram: configJson.links?.telegram || "",
    bitcointalk: configJson.links?.bitcointalk || "",
  },
  announcements: configJson.announcements || [],
  miners: {
    downloads: configJson.miners?.downloads || [],
  },
  calculator: {
    defaultElectricityCost: configJson.calculator?.defaultElectricityCost || 0.1,
    defaultPowerConsumption: configJson.calculator?.defaultPowerConsumption || 200,
    currencies: configJson.calculator?.currencies || ["USD"],
    priceApi: {
      url: configJson.calculator?.priceApi?.url || "",
      tickerId: configJson.calculator?.priceApi?.tickerId || "",
      fallbackUrl: configJson.calculator?.priceApi?.fallbackUrl || "",
    },
  },
  stratum: {
    host: configJson.stratum?.host || "stratum.example.com",
    port: configJson.stratum?.port || 8002,
    ports: configJson.stratum?.ports || [8002],
  },
  api: {
    baseUrl: configJson.api?.baseUrl || "",
  },
  faucet: {
    enabled: configJson.faucet?.enabled ?? false,
    amount: configJson.faucet?.amount || 0.1,
    cooldownHours: configJson.faucet?.cooldownHours || 24,
    maxDailyRequests: configJson.faucet?.maxDailyRequests || 100,
    backendUrl: configJson.faucet?.backendUrl || "",
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
