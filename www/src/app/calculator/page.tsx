"use client";

import { useState, useMemo, useEffect } from "react";
import useSWR from "swr";
import {
  CalculatorIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CubeIcon,
  BoltIcon,
  ChartBarIcon,
  FireIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { formatHashrate } from "@/lib/formatters";
import poolConfig from "@/lib/poolConfig";
import { API_BASE_URL } from "@/lib/api";
import { useTranslation } from "@/components/I18nProvider";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Fetch coin price with fallback order (configured in config.json):
// 1. Primary price API (client-side direct, must be allowed in CSP)
// 2. /api/price server route (fallback, fetches server-side)
async function fetchVBCPrice(): Promise<{ priceUSD: number; source: string } | null> {
  const { url, tickerId } = poolConfig.calculator.priceApi;

  // 1. Try primary price API directly (if configured)
  if (url && tickerId) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const tickers = await res.json();
        const ticker = tickers.find(
          (t: { ticker_id: string }) => t.ticker_id === tickerId
        );
        if (ticker?.last_price) {
          const price = parseFloat(ticker.last_price);
          if (price > 0) {
            const source = new URL(url).hostname.replace("www.", "");
            return { priceUSD: price, source };
          }
        }
      }
    } catch {
      // Primary API failed, try fallback
    }
  }

  // 2. Fallback: /api/price server route (fetches externally server-side)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const res = await fetch("/api/price", { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data?.priceUSD > 0) {
        return { priceUSD: data.data.priceUSD, source: data.data.source };
      }
    }
  } catch {
    // Both failed
  }

  return null;
}

// GPU Database with Ethash hashrates and power consumption
interface GPUData {
  name: string;
  hashrate: number;
  unit: "MH/s" | "GH/s" | "TH/s";
  power: number;
}

interface GPUCategory {
  name: string;
  color: string;
  gpus: GPUData[];
}

const GPU_DATABASE: GPUCategory[] = [
  {
    name: "NVIDIA RTX 5000 Series",
    color: "bg-green-600",
    gpus: [
      { name: "RTX 5090", hashrate: 180, unit: "MH/s", power: 450 },
      { name: "RTX 5080", hashrate: 130, unit: "MH/s", power: 320 },
      { name: "RTX 5070 Ti", hashrate: 95, unit: "MH/s", power: 285 },
      { name: "RTX 5070", hashrate: 75, unit: "MH/s", power: 220 },
      { name: "RTX 5060 Ti", hashrate: 55, unit: "MH/s", power: 180 },
      { name: "RTX 5060", hashrate: 42, unit: "MH/s", power: 150 },
      { name: "RTX 5090 Laptop", hashrate: 120, unit: "MH/s", power: 150 },
      { name: "RTX 5080 Laptop", hashrate: 85, unit: "MH/s", power: 120 },
      { name: "RTX 5070 Laptop", hashrate: 52, unit: "MH/s", power: 100 },
    ],
  },
  {
    name: "NVIDIA RTX 4000 Series",
    color: "bg-green-500",
    gpus: [
      { name: "RTX 4090", hashrate: 135, unit: "MH/s", power: 350 },
      { name: "RTX 4080 Super", hashrate: 105, unit: "MH/s", power: 320 },
      { name: "RTX 4080", hashrate: 98, unit: "MH/s", power: 300 },
      { name: "RTX 4070 Ti Super", hashrate: 82, unit: "MH/s", power: 285 },
      { name: "RTX 4070 Ti", hashrate: 75, unit: "MH/s", power: 270 },
      { name: "RTX 4070 Super", hashrate: 68, unit: "MH/s", power: 220 },
      { name: "RTX 4070", hashrate: 58, unit: "MH/s", power: 200 },
      { name: "RTX 4060 Ti 16GB", hashrate: 42, unit: "MH/s", power: 165 },
      { name: "RTX 4060 Ti 8GB", hashrate: 38, unit: "MH/s", power: 160 },
      { name: "RTX 4060", hashrate: 32, unit: "MH/s", power: 115 },
      { name: "RTX 4090 Laptop", hashrate: 90, unit: "MH/s", power: 150 },
      { name: "RTX 4080 Laptop", hashrate: 72, unit: "MH/s", power: 120 },
      { name: "RTX 4070 Laptop", hashrate: 48, unit: "MH/s", power: 100 },
      { name: "RTX 4060 Laptop", hashrate: 28, unit: "MH/s", power: 65 },
    ],
  },
  {
    name: "NVIDIA RTX 3000 Series",
    color: "bg-green-400",
    gpus: [
      { name: "RTX 3090 Ti", hashrate: 130, unit: "MH/s", power: 350 },
      { name: "RTX 3090", hashrate: 120, unit: "MH/s", power: 300 },
      { name: "RTX 3080 Ti", hashrate: 95, unit: "MH/s", power: 290 },
      { name: "RTX 3080 12GB", hashrate: 102, unit: "MH/s", power: 280 },
      { name: "RTX 3080 10GB", hashrate: 95, unit: "MH/s", power: 270 },
      { name: "RTX 3070 Ti", hashrate: 62, unit: "MH/s", power: 220 },
      { name: "RTX 3070", hashrate: 60, unit: "MH/s", power: 200 },
      { name: "RTX 3060 Ti", hashrate: 60, unit: "MH/s", power: 180 },
      { name: "RTX 3060 12GB", hashrate: 48, unit: "MH/s", power: 140 },
      { name: "RTX 3050", hashrate: 25, unit: "MH/s", power: 115 },
    ],
  },
  {
    name: "NVIDIA RTX Pro / Quadro",
    color: "bg-teal-500",
    gpus: [
      { name: "RTX PRO 6000 Blackwell", hashrate: 200, unit: "MH/s", power: 350 },
      { name: "RTX 6000 Ada Generation", hashrate: 140, unit: "MH/s", power: 300 },
      { name: "RTX 5000 Ada Generation", hashrate: 95, unit: "MH/s", power: 250 },
      { name: "RTX 4500 Ada Generation", hashrate: 75, unit: "MH/s", power: 210 },
      { name: "RTX 4000 Ada Generation", hashrate: 55, unit: "MH/s", power: 130 },
      { name: "RTX 4000 SFF Ada", hashrate: 50, unit: "MH/s", power: 70 },
      { name: "RTX A6000 48GB", hashrate: 98, unit: "MH/s", power: 300 },
      { name: "RTX A5500 24GB", hashrate: 82, unit: "MH/s", power: 230 },
      { name: "RTX A5000 24GB", hashrate: 78, unit: "MH/s", power: 230 },
      { name: "RTX A4500 20GB", hashrate: 70, unit: "MH/s", power: 200 },
      { name: "RTX A4000 16GB", hashrate: 58, unit: "MH/s", power: 140 },
      { name: "RTX A2000 12GB", hashrate: 28, unit: "MH/s", power: 70 },
    ],
  },
  {
    name: "NVIDIA Data Center / HPC",
    color: "bg-indigo-600",
    gpus: [
      { name: "H100 SXM 80GB", hashrate: 420, unit: "MH/s", power: 700 },
      { name: "H100 PCIe 80GB", hashrate: 360, unit: "MH/s", power: 350 },
      { name: "H200 SXM 141GB", hashrate: 480, unit: "MH/s", power: 700 },
      { name: "A100 SXM 80GB", hashrate: 210, unit: "MH/s", power: 400 },
      { name: "A100 PCIe 80GB", hashrate: 185, unit: "MH/s", power: 300 },
      { name: "A100 PCIe 40GB", hashrate: 165, unit: "MH/s", power: 250 },
      { name: "L40S", hashrate: 180, unit: "MH/s", power: 350 },
      { name: "L40", hashrate: 160, unit: "MH/s", power: 300 },
      { name: "L4", hashrate: 55, unit: "MH/s", power: 72 },
      { name: "A40", hashrate: 105, unit: "MH/s", power: 300 },
      { name: "A30", hashrate: 78, unit: "MH/s", power: 165 },
      { name: "A10", hashrate: 62, unit: "MH/s", power: 150 },
      { name: "T4", hashrate: 28, unit: "MH/s", power: 70 },
      { name: "V100 32GB", hashrate: 95, unit: "MH/s", power: 300 },
      { name: "V100 16GB", hashrate: 88, unit: "MH/s", power: 250 },
    ],
  },
  {
    name: "AMD Radeon RX 7000 Series",
    color: "bg-red-500",
    gpus: [
      { name: "RX 7900 XTX", hashrate: 85, unit: "MH/s", power: 320 },
      { name: "RX 7900 XT", hashrate: 75, unit: "MH/s", power: 285 },
      { name: "RX 7900 GRE", hashrate: 65, unit: "MH/s", power: 245 },
      { name: "RX 7800 XT", hashrate: 52, unit: "MH/s", power: 200 },
      { name: "RX 7700 XT", hashrate: 45, unit: "MH/s", power: 180 },
      { name: "RX 7600 XT", hashrate: 32, unit: "MH/s", power: 150 },
      { name: "RX 7600", hashrate: 28, unit: "MH/s", power: 130 },
    ],
  },
  {
    name: "AMD Radeon RX 6000 Series",
    color: "bg-red-400",
    gpus: [
      { name: "RX 6950 XT", hashrate: 60, unit: "MH/s", power: 280 },
      { name: "RX 6900 XT", hashrate: 58, unit: "MH/s", power: 260 },
      { name: "RX 6800 XT", hashrate: 55, unit: "MH/s", power: 250 },
      { name: "RX 6800", hashrate: 50, unit: "MH/s", power: 220 },
      { name: "RX 6750 XT", hashrate: 40, unit: "MH/s", power: 180 },
      { name: "RX 6700 XT", hashrate: 38, unit: "MH/s", power: 170 },
      { name: "RX 6650 XT", hashrate: 30, unit: "MH/s", power: 130 },
      { name: "RX 6600 XT", hashrate: 28, unit: "MH/s", power: 120 },
      { name: "RX 6600", hashrate: 25, unit: "MH/s", power: 110 },
      { name: "RX 6500 XT", hashrate: 15, unit: "MH/s", power: 80 },
    ],
  },
  {
    name: "AMD Radeon Pro",
    color: "bg-orange-500",
    gpus: [
      { name: "Radeon Pro W7900", hashrate: 80, unit: "MH/s", power: 295 },
      { name: "Radeon Pro W7800", hashrate: 65, unit: "MH/s", power: 260 },
      { name: "Radeon Pro W7700", hashrate: 48, unit: "MH/s", power: 190 },
      { name: "Radeon Pro W7600", hashrate: 35, unit: "MH/s", power: 150 },
      { name: "Radeon Pro W6800", hashrate: 52, unit: "MH/s", power: 250 },
      { name: "Radeon Pro W6600", hashrate: 28, unit: "MH/s", power: 100 },
    ],
  },
  {
    name: "Intel Arc",
    color: "bg-blue-500",
    gpus: [
      { name: "Arc A770 16GB", hashrate: 42, unit: "MH/s", power: 225 },
      { name: "Arc A770 8GB", hashrate: 38, unit: "MH/s", power: 225 },
      { name: "Arc A750", hashrate: 35, unit: "MH/s", power: 200 },
      { name: "Arc A580", hashrate: 25, unit: "MH/s", power: 150 },
      { name: "Arc A380", hashrate: 12, unit: "MH/s", power: 75 },
    ],
  },
  {
    name: "Mining Rigs (Multi-GPU)",
    color: "bg-purple-500",
    gpus: [
      { name: "6x RTX 4090 Rig", hashrate: 810, unit: "MH/s", power: 2400 },
      { name: "8x RTX 4070 Rig", hashrate: 464, unit: "MH/s", power: 1800 },
      { name: "6x RTX 3080 Rig", hashrate: 570, unit: "MH/s", power: 1800 },
      { name: "8x RTX 3070 Rig", hashrate: 480, unit: "MH/s", power: 1700 },
      { name: "6x RX 7900 XTX Rig", hashrate: 510, unit: "MH/s", power: 2100 },
      { name: "Small Farm (1 GH/s)", hashrate: 1, unit: "GH/s", power: 4000 },
      { name: "Medium Farm (5 GH/s)", hashrate: 5, unit: "GH/s", power: 18000 },
      { name: "Large Farm (10 GH/s)", hashrate: 10, unit: "GH/s", power: 35000 },
    ],
  },
];

// GPU Selector Component
interface GPUSelectorProps {
  onSelect: (gpu: GPUData) => void;
  t: (key: string) => string;
}

function GPUSelector({ onSelect, t }: GPUSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-4">
      <label className="block text-sm text-gray-400 mb-2">{t("calculator.selectGpu")}</label>

      {/* Category Buttons */}
      <div className="flex flex-wrap gap-2 mb-3">
        {GPU_DATABASE.map((category) => (
          <button
            key={category.name}
            onClick={() => {
              setSelectedCategory(selectedCategory === category.name ? null : category.name);
              setIsOpen(true);
            }}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 ${
              selectedCategory === category.name
                ? `${category.color} text-white`
                : "bg-gray-700 hover:bg-gray-600 text-gray-300"
            }`}
          >
            {category.name.replace("NVIDIA ", "").replace("AMD ", "").replace("Series", "").trim()}
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform ${selectedCategory === category.name ? "rotate-180" : ""}`}
            />
          </button>
        ))}
      </div>

      {/* GPU List for Selected Category */}
      {isOpen && selectedCategory && (
        <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 max-h-64 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {GPU_DATABASE.find((c) => c.name === selectedCategory)?.gpus.map((gpu) => (
              <button
                key={gpu.name}
                onClick={() => {
                  onSelect(gpu);
                  setIsOpen(false);
                  setSelectedCategory(null);
                }}
                className="flex items-center justify-between p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left"
              >
                <div>
                  <p className="text-sm font-medium text-white">{gpu.name}</p>
                  <p className="text-xs text-gray-400">
                    {gpu.hashrate} {gpu.unit} • {gpu.power}W
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-green-400">
                    {(gpu.hashrate / (gpu.power / 1000)).toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500">MH/W</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Popular GPUs */}
      {!isOpen && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500">{t("calculator.popular")}:</span>
          {[
            GPU_DATABASE[1].gpus[0], // RTX 4090
            GPU_DATABASE[1].gpus[6], // RTX 4070
            GPU_DATABASE[2].gpus[1], // RTX 3090
            GPU_DATABASE[4].gpus[0], // RX 7900 XTX
            GPU_DATABASE[0].gpus[0], // RTX 5090
          ].map((gpu) => (
            <button
              key={gpu.name}
              onClick={() => onSelect(gpu)}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
            >
              {gpu.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface CalculatorResult {
  hourly: number;
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  blocksPerDay: number;
}

interface ProfitResult {
  dailyRevenue: number;
  dailyCost: number;
  dailyProfit: number;
  monthlyProfit: number;
}

export default function CalculatorPage() {
  const { t } = useTranslation();
  const [hashrate, setHashrate] = useState<string>("100");
  const [unit, setUnit] = useState<"MH/s" | "GH/s" | "TH/s">("MH/s");
  const [powerConsumption, setPowerConsumption] = useState<string>(
    poolConfig.calculator.defaultPowerConsumption.toString()
  );
  const [electricityCost, setElectricityCost] = useState<string>(
    poolConfig.calculator.defaultElectricityCost.toString()
  );
  const [coinPrice, setCoinPrice] = useState<string>("0.01");
  const [priceSource, setPriceSource] = useState<string>("");
  const [priceLoading, setPriceLoading] = useState<boolean>(true);
  const [currency, setCurrency] = useState<string>("USD");
  const [coinPriceUSD, setCoinPriceUSD] = useState<number>(0);

  // Currency conversion rates (fetched live, with fallback defaults)
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    USD: 1, JPY: 155, EUR: 0.92,
  });

  const { data: statsData } = useSWR(API_BASE_URL + "/api/stats", fetcher, {
    refreshInterval: 30000,
  });

  // Auto-fetch VBC price directly from external APIs (client-side)
  // Uses fallback order: WikaEx → Explorer (same as vbc-explorer)
  useEffect(() => {
    let cancelled = false;

    async function loadPrice() {
      const result = await fetchVBCPrice();
      if (cancelled) return;
      if (result) {
        setCoinPriceUSD(result.priceUSD);
        // coinPrice will be updated by the currency conversion effect
        setPriceSource(result.source);
      }
      setPriceLoading(false);
    }

    loadPrice();

    // Refresh every 60 seconds
    const interval = setInterval(loadPrice, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // When currency or USD price changes, convert the price display
  useEffect(() => {
    if (coinPriceUSD > 0) {
      const rate = exchangeRates[currency] || 1;
      setCoinPrice((coinPriceUSD * rate).toString());
    }
  }, [currency, exchangeRates, coinPriceUSD]);

  // Convert input hashrate to H/s
  const hashrateInHs = useMemo(() => {
    const value = parseFloat(hashrate) || 0;
    switch (unit) {
      case "MH/s":
        return value * 1e6;
      case "GH/s":
        return value * 1e9;
      case "TH/s":
        return value * 1e12;
      default:
        return value * 1e6;
    }
  }, [hashrate, unit]);

  // Get network stats - calculate from nodes difficulty
  const networkHashrate = useMemo(() => {
    // Try direct networkHashrate first
    if (statsData?.stats?.networkHashrate) return statsData.stats.networkHashrate;
    if (statsData?.networkHashrate) return statsData.networkHashrate;

    // Calculate from nodes difficulty
    if (statsData?.nodes && statsData.nodes.length > 0) {
      // Get max difficulty from nodes
      let maxDifficulty = 0;
      for (const node of statsData.nodes) {
        const diff = parseFloat(node.difficulty);
        if (!isNaN(diff) && diff > maxDifficulty) {
          maxDifficulty = diff;
        }
      }
      // Network Hashrate = Difficulty / Block Time
      if (maxDifficulty > 0) {
        return maxDifficulty / poolConfig.block.time;
      }
    }
    return 0;
  }, [statsData]);

  const poolHashrate = statsData?.hashrate || 0;

  // Calculate mining rewards
  const results: CalculatorResult = useMemo(() => {
    if (hashrateInHs <= 0 || networkHashrate <= 0) {
      return {
        hourly: 0,
        daily: 0,
        weekly: 0,
        monthly: 0,
        yearly: 0,
        blocksPerDay: 0,
      };
    }

    // Blocks per day on the network
    const blocksPerDay = (24 * 60 * 60) / poolConfig.block.time;

    // Your share of the network hashrate
    const shareOfNetwork = hashrateInHs / networkHashrate;

    // Expected blocks you would find per day (solo mining equivalent)
    const expectedBlocksPerDay = blocksPerDay * shareOfNetwork;

    // Daily reward
    const dailyReward = expectedBlocksPerDay * poolConfig.block.reward;

    return {
      hourly: dailyReward / 24,
      daily: dailyReward,
      weekly: dailyReward * 7,
      monthly: dailyReward * 30,
      yearly: dailyReward * 365,
      blocksPerDay: expectedBlocksPerDay,
    };
  }, [hashrateInHs, networkHashrate]);

  // Fetch live exchange rates
  useEffect(() => {
    async function loadRates() {
      try {
        // Use exchangerate.host (free, no API key required)
        const res = await fetch("https://open.er-api.com/v6/latest/USD", {
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.rates) {
            setExchangeRates((prev) => ({
              ...prev,
              JPY: data.rates["JPY"] || prev["JPY"],
              EUR: data.rates["EUR"] || prev["EUR"],
            }));
          }
        }
      } catch {
        // Keep fallback rates
      }
    }
    loadRates();
  }, []);

  const currencySymbols: Record<string, string> = { USD: "$", JPY: "¥", EUR: "€" };

  const currentCurrency = {
    rate: exchangeRates[currency] || 1,
    symbol: currencySymbols[currency] || "$",
  };

  // Profitability calculation
  const profitResults: ProfitResult = useMemo(() => {
    const price = parseFloat(coinPrice) || 0;
    const power = parseFloat(powerConsumption) || 0;
    const elecCost = parseFloat(electricityCost) || 0;

    const dailyRevenue = results.daily * price;
    const dailyCost = (power / 1000) * 24 * elecCost; // kWh * hours * cost
    const dailyProfit = dailyRevenue - dailyCost;

    return {
      dailyRevenue,
      dailyCost,
      dailyProfit,
      monthlyProfit: dailyProfit * 30,
    };
  }, [results.daily, coinPrice, powerConsumption, electricityCost]);

  // Format currency value (input values are already in selected currency)
  const formatCurrency = (value: number) => {
    if (currency === "JPY") {
      return `${currentCurrency.symbol}${Math.round(value).toLocaleString()}`;
    }
    return `${currentCurrency.symbol}${value.toFixed(2)}`;
  };

  // Pool share calculation
  const poolShare = useMemo(() => {
    if (hashrateInHs <= 0 || poolHashrate <= 0) return 0;
    return (hashrateInHs / poolHashrate) * 100;
  }, [hashrateInHs, poolHashrate]);

  const coinSymbol = poolConfig.coin.symbol;

  return (
    <div>
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <CalculatorIcon className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-100">{t("calculator.title")}</h1>
              <p className="text-gray-400 text-sm mt-1">{t("calculator.estimateRewards")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Input Section */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <BoltIcon className="w-5 h-5 text-yellow-400" />
            {t("calculator.yourHashrate")}
          </h2>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-2">{t("calculator.hashrate")}</label>
              <input
                type="number"
                value={hashrate}
                onChange={(e) => setHashrate(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder={t("calculator.enterHashrate")}
                min="0"
                step="0.1"
              />
            </div>
            <div className="sm:w-32">
              <label className="block text-sm text-gray-400 mb-2">{t("calculator.unit")}</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as "MH/s" | "GH/s" | "TH/s")}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="MH/s">MH/s</option>
                <option value="GH/s">GH/s</option>
                <option value="TH/s">TH/s</option>
              </select>
            </div>
          </div>

          {/* GPU Selector */}
          <GPUSelector
            t={t}
            onSelect={(gpu) => {
              setHashrate(gpu.hashrate.toString());
              setUnit(gpu.unit);
              setPowerConsumption(gpu.power.toString());
            }}
          />
        </div>

        {/* Electricity Cost Section */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <FireIcon className="w-5 h-5 text-orange-400" />
            {t("calculator.profitabilityCalculator")}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                {t("calculator.powerConsumptionW")}
              </label>
              <input
                type="number"
                value={powerConsumption}
                onChange={(e) => setPowerConsumption(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="200"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                {t("calculator.electricityCostKwh").replace("($/kWh)", "").replace("（$/kWh）", "").trim()} ({currentCurrency.symbol}/kWh)
              </label>
              <input
                type="number"
                value={electricityCost}
                onChange={(e) => setElectricityCost(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="0.10"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                {coinSymbol} Price ({currency})
                {priceSource && (
                  <span className="inline-flex items-center gap-1 text-xs text-green-400">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    Live
                  </span>
                )}
                {priceLoading && (
                  <span className="text-xs text-gray-500">Loading...</span>
                )}
              </label>
              <input
                type="number"
                value={coinPrice}
                onChange={(e) => setCoinPrice(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="0.01"
                min="0"
                step="0.001"
              />
              {priceSource && (
                <p className="mt-1 text-xs text-gray-500">
                  Source: {priceSource === "wikaex" ? "WikaEx" : priceSource === "explorer" ? "Explorer" : priceSource}
                </p>
              )}
            </div>
          </div>

          {/* Currency Selector & Profitability Results */}
          <div className="mt-6">
            <div className="flex items-center justify-end gap-2 mb-3">
              <span className="text-xs text-gray-500">{t("calculator.currency") || "Currency"}:</span>
              <div className="flex gap-1">
                {poolConfig.calculator.currencies.map((cur) => (
                  <button
                    key={cur}
                    onClick={() => setCurrency(cur)}
                    className={`px-2.5 py-1 text-xs rounded transition-colors ${
                      currency === cur
                        ? "bg-orange-600 text-white"
                        : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    }`}
                  >
                    {cur}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400">{t("calculator.dailyRevenue")}</p>
                <p className="text-lg font-bold text-green-400">
                  {formatCurrency(profitResults.dailyRevenue)}
                </p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400">{t("calculator.dailyElectricity")}</p>
                <p className="text-lg font-bold text-red-400">
                  -{formatCurrency(profitResults.dailyCost)}
                </p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400">{t("calculator.dailyProfit")}</p>
                <p
                  className={`text-lg font-bold ${profitResults.dailyProfit >= 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {profitResults.dailyProfit < 0 ? "-" : ""}{formatCurrency(Math.abs(profitResults.dailyProfit))}
                </p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400">{t("calculator.monthlyProfit")}</p>
                <p
                  className={`text-lg font-bold ${profitResults.monthlyProfit >= 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {profitResults.monthlyProfit < 0 ? "-" : ""}{formatCurrency(Math.abs(profitResults.monthlyProfit))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <ResultCard
            icon={<ClockIcon className="w-6 h-6 text-blue-400" />}
            iconBg="bg-blue-600/20"
            title={t("calculator.hourly")}
            value={results.hourly.toFixed(6)}
            unit={coinSymbol}
          />
          <ResultCard
            icon={<CurrencyDollarIcon className="w-6 h-6 text-green-400" />}
            iconBg="bg-green-600/20"
            title={t("calculator.daily")}
            value={results.daily.toFixed(4)}
            unit={coinSymbol}
            highlight
          />
          <ResultCard
            icon={<ChartBarIcon className="w-6 h-6 text-purple-400" />}
            iconBg="bg-purple-600/20"
            title={t("calculator.weekly")}
            value={results.weekly.toFixed(4)}
            unit={coinSymbol}
          />
          <ResultCard
            icon={<CubeIcon className="w-6 h-6 text-orange-400" />}
            iconBg="bg-orange-600/20"
            title={t("calculator.monthly")}
            value={results.monthly.toFixed(2)}
            unit={coinSymbol}
          />
          <ResultCard
            icon={<CurrencyDollarIcon className="w-6 h-6 text-yellow-400" />}
            iconBg="bg-yellow-600/20"
            title={t("calculator.yearly")}
            value={results.yearly.toFixed(2)}
            unit={coinSymbol}
          />
          <ResultCard
            icon={<CubeIcon className="w-6 h-6 text-cyan-400" />}
            iconBg="bg-cyan-600/20"
            title={t("calculator.blocksPerDay")}
            value={results.blocksPerDay.toFixed(6)}
            unit={t("calculator.blocks")}
          />
        </div>

        {/* Network Stats */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">
            {t("calculator.networkStats")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-400">{t("stats.networkHashrate")}</p>
              <p className="text-lg font-semibold text-white">{formatHashrate(networkHashrate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">{t("stats.poolHashrate")}</p>
              <p className="text-lg font-semibold text-white">{formatHashrate(poolHashrate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">{t("calculator.yourPoolShare")}</p>
              <p className="text-lg font-semibold text-green-400">{poolShare.toFixed(4)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">{t("calculator.blockReward")}</p>
              <p className="text-lg font-semibold text-yellow-400">
                {poolConfig.block.reward} {coinSymbol}
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4">
          <p className="text-sm text-yellow-200">
            <strong>{t("calculator.disclaimerTitle")}:</strong> {t("calculator.disclaimerText")}
          </p>
        </div>
      </div>
    </div>
  );
}

interface ResultCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  value: string;
  unit: string;
  highlight?: boolean;
}

function ResultCard({ icon, iconBg, title, value, unit, highlight }: ResultCardProps) {
  return (
    <div
      className={`bg-gray-800 rounded-lg border p-5 ${highlight ? "border-green-500/50 ring-1 ring-green-500/20" : "border-gray-700"}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${iconBg}`}>{icon}</div>
        <span className="text-gray-400 font-medium">{title}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold ${highlight ? "text-green-400" : "text-white"}`}>
          {value}
        </span>
        <span className="text-gray-400 text-sm">{unit}</span>
      </div>
    </div>
  );
}
