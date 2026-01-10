"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import {
  CalculatorIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CubeIcon,
  BoltIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { formatHashrate } from "@/lib/formatters";
import poolConfig from "@/lib/poolConfig";
import { API_BASE_URL } from "@/lib/api";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface CalculatorResult {
  hourly: number;
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  blocksPerDay: number;
}

export default function CalculatorPage() {
  const [hashrate, setHashrate] = useState<string>("100");
  const [unit, setUnit] = useState<"MH/s" | "GH/s" | "TH/s">("MH/s");

  const { data: statsData } = useSWR(API_BASE_URL + "/api/stats", fetcher, {
    refreshInterval: 30000,
  });

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
              <h1 className="text-3xl font-bold text-gray-100">Mining Calculator</h1>
              <p className="text-gray-400 text-sm mt-1">
                Estimate your mining rewards based on your hashrate
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Input Section */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <BoltIcon className="w-5 h-5 text-yellow-400" />
            Your Hashrate
          </h2>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-2">Hashrate</label>
              <input
                type="number"
                value={hashrate}
                onChange={(e) => setHashrate(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your hashrate"
                min="0"
                step="0.1"
              />
            </div>
            <div className="sm:w-32">
              <label className="block text-sm text-gray-400 mb-2">Unit</label>
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

          {/* Quick presets */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-400">Quick select:</span>
            {[
              { value: "30", unit: "MH/s" as const, label: "30 MH/s (RTX 3060)" },
              { value: "60", unit: "MH/s" as const, label: "60 MH/s (RTX 3080)" },
              { value: "120", unit: "MH/s" as const, label: "120 MH/s (RTX 3090)" },
              { value: "500", unit: "MH/s" as const, label: "500 MH/s (Small Rig)" },
              { value: "1", unit: "GH/s" as const, label: "1 GH/s" },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  setHashrate(preset.value);
                  setUnit(preset.unit);
                }}
                className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <ResultCard
            icon={<ClockIcon className="w-6 h-6 text-blue-400" />}
            iconBg="bg-blue-600/20"
            title="Hourly"
            value={results.hourly.toFixed(6)}
            unit={coinSymbol}
          />
          <ResultCard
            icon={<CurrencyDollarIcon className="w-6 h-6 text-green-400" />}
            iconBg="bg-green-600/20"
            title="Daily"
            value={results.daily.toFixed(4)}
            unit={coinSymbol}
            highlight
          />
          <ResultCard
            icon={<ChartBarIcon className="w-6 h-6 text-purple-400" />}
            iconBg="bg-purple-600/20"
            title="Weekly"
            value={results.weekly.toFixed(4)}
            unit={coinSymbol}
          />
          <ResultCard
            icon={<CubeIcon className="w-6 h-6 text-orange-400" />}
            iconBg="bg-orange-600/20"
            title="Monthly"
            value={results.monthly.toFixed(2)}
            unit={coinSymbol}
          />
          <ResultCard
            icon={<CurrencyDollarIcon className="w-6 h-6 text-yellow-400" />}
            iconBg="bg-yellow-600/20"
            title="Yearly"
            value={results.yearly.toFixed(2)}
            unit={coinSymbol}
          />
          <ResultCard
            icon={<CubeIcon className="w-6 h-6 text-cyan-400" />}
            iconBg="bg-cyan-600/20"
            title="Blocks/Day"
            value={results.blocksPerDay.toFixed(6)}
            unit="blocks"
          />
        </div>

        {/* Network Stats */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Network Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-400">Network Hashrate</p>
              <p className="text-lg font-semibold text-white">{formatHashrate(networkHashrate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Pool Hashrate</p>
              <p className="text-lg font-semibold text-white">{formatHashrate(poolHashrate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Your Pool Share</p>
              <p className="text-lg font-semibold text-green-400">{poolShare.toFixed(4)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Block Reward</p>
              <p className="text-lg font-semibold text-yellow-400">
                {poolConfig.block.reward} {coinSymbol}
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4">
          <p className="text-sm text-yellow-200">
            <strong>Disclaimer:</strong> These calculations are estimates based on current network
            conditions. Actual mining rewards may vary due to luck, network difficulty changes, pool
            fees, and other factors. This calculator assumes solo mining equivalent rewards.
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
