"use client";

import { useState, useMemo } from "react";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import poolConfig, { shannonToCoin } from "@/lib/poolConfig";

interface EarningsProjectionProps {
  currentHashrate: number; // H/s
  networkDifficulty: number;
  blockReward: number; // in shannon
  blockTime: number; // in seconds
  coinPrice?: number; // USD per coin
  electricityCost?: number; // USD per kWh
  powerConsumption?: number; // watts
  className?: string;
}

interface Projection {
  period: string;
  coins: number;
  usd: number;
  revenue: number;
  electricityCost: number;
  profit: number;
}

export default function EarningsProjection({
  currentHashrate,
  networkDifficulty,
  blockReward,
  blockTime,
  coinPrice = 0,
  electricityCost = 0.1,
  powerConsumption = 100,
  className = "",
}: EarningsProjectionProps) {
  const [customPrice, setCustomPrice] = useState<string>(coinPrice.toString());
  const [customPower, setCustomPower] = useState<string>(powerConsumption.toString());
  const [customElectricity, setCustomElectricity] = useState<string>(electricityCost.toString());

  const projections = useMemo(() => {
    const price = parseFloat(customPrice) || 0;
    const power = parseFloat(customPower) || 0;
    const elecCost = parseFloat(customElectricity) || 0;

    // Calculate expected coins per second
    // Using simplified formula: (hashrate / networkDifficulty) * (blockReward / blockTime)
    const networkHashrate = networkDifficulty / blockTime;
    const shareOfNetwork = networkHashrate > 0 ? currentHashrate / networkHashrate : 0;
    const blocksPerSecond = 1 / blockTime;
    const coinsPerSecond = shareOfNetwork * blocksPerSecond * shannonToCoin(blockReward);

    const periods = [
      { name: "Hourly", seconds: 3600, kWh: power / 1000 },
      { name: "Daily", seconds: 86400, kWh: (power * 24) / 1000 },
      { name: "Weekly", seconds: 604800, kWh: (power * 24 * 7) / 1000 },
      { name: "Monthly", seconds: 2592000, kWh: (power * 24 * 30) / 1000 },
      { name: "Yearly", seconds: 31536000, kWh: (power * 24 * 365) / 1000 },
    ];

    return periods.map((period): Projection => {
      const coins = coinsPerSecond * period.seconds;
      const revenue = coins * price;
      const electricity = period.kWh * elecCost;
      return {
        period: period.name,
        coins,
        usd: coins * price,
        revenue,
        electricityCost: electricity,
        profit: revenue - electricity,
      };
    });
  }, [
    currentHashrate,
    networkDifficulty,
    blockReward,
    blockTime,
    customPrice,
    customPower,
    customElectricity,
  ]);

  const coinSymbol = poolConfig.coin.symbol;

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 ${className}`}>
      <div className="p-4 border-b border-gray-700">
        <h3 className="font-semibold text-gray-100 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-400" />
          Earnings Projection
        </h3>
      </div>

      {/* Inputs */}
      <div className="p-4 border-b border-gray-700 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-400 block mb-1">{coinSymbol} Price (USD)</label>
            <input
              type="number"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-white"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Power (W)</label>
            <input
              type="number"
              value={customPower}
              onChange={(e) => setCustomPower(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-white"
              placeholder="100"
              min="0"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Elec. ($/kWh)</label>
            <input
              type="number"
              value={customElectricity}
              onChange={(e) => setCustomElectricity(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-white"
              placeholder="0.10"
              step="0.01"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Projections Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 text-left">
              <th className="px-4 py-3 font-medium">Period</th>
              <th className="px-4 py-3 font-medium text-right">{coinSymbol}</th>
              {coinPrice > 0 && (
                <>
                  <th className="px-4 py-3 font-medium text-right">Revenue</th>
                  <th className="px-4 py-3 font-medium text-right">Elec. Cost</th>
                  <th className="px-4 py-3 font-medium text-right">Profit</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {projections.map((proj) => (
              <tr key={proj.period} className="hover:bg-gray-700/30">
                <td className="px-4 py-3 text-gray-300">{proj.period}</td>
                <td className="px-4 py-3 text-right text-green-400 tabular-nums">
                  {proj.coins < 0.001 ? proj.coins.toExponential(4) : proj.coins.toFixed(6)}
                </td>
                {coinPrice > 0 && (
                  <>
                    <td className="px-4 py-3 text-right text-blue-400 tabular-nums">
                      ${proj.revenue.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-red-400 tabular-nums">
                      ${proj.electricityCost.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <span
                        className={`flex items-center justify-end gap-1 ${
                          proj.profit >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {proj.profit >= 0 ? (
                          <ArrowTrendingUpIcon className="w-4 h-4" />
                        ) : (
                          <ArrowTrendingDownIcon className="w-4 h-4" />
                        )}
                        ${Math.abs(proj.profit).toFixed(2)}
                      </span>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Note */}
      <div className="p-3 bg-gray-900/50 text-xs text-gray-500 rounded-b-lg">
        * Projections are estimates based on current network conditions. Actual earnings may vary
        due to difficulty changes, luck variance, and market fluctuations.
      </div>
    </div>
  );
}
