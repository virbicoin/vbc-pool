"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { BoltIcon, UserGroupIcon, CubeIcon, ClockIcon } from "@heroicons/react/24/outline";
import { formatHashrate } from "@/lib/formatters";
import poolConfig from "@/lib/poolConfig";
import { API_BASE_URL } from "@/lib/api";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface PoolStatsWidgetProps {
  compact?: boolean;
  className?: string;
}

export default function PoolStatsWidget({ compact = false, className = "" }: PoolStatsWidgetProps) {
  const { data: statsData } = useSWR(API_BASE_URL + "/api/stats", fetcher, {
    refreshInterval: 10000,
  });

  const hashrate = statsData?.hashrate || 0;
  const miners = statsData?.minersTotal || 0;
  const lastBlockFound = statsData?.stats?.lastBlockFound || 0;
  const blocksFound = statsData?.maturedTotal || 0;

  // Track time since last block with state to avoid impure render
  const [timeSinceLastBlock, setTimeSinceLastBlock] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      if (lastBlockFound) {
        setTimeSinceLastBlock(Math.floor((Date.now() / 1000 - lastBlockFound) / 60));
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [lastBlockFound]);

  if (compact) {
    return (
      <div className={`flex items-center gap-4 text-sm ${className}`}>
        <div className="flex items-center gap-1.5">
          <BoltIcon className="w-4 h-4 text-green-400" />
          <span className="text-gray-300">{formatHashrate(hashrate)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <UserGroupIcon className="w-4 h-4 text-blue-400" />
          <span className="text-gray-300">{miners}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CubeIcon className="w-4 h-4 text-purple-400" />
          <span className="text-gray-300">{blocksFound}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-200">Pool Statistics</h4>
        <span className="flex items-center gap-1 text-xs text-green-400">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Live
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-900/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <BoltIcon className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">Hashrate</span>
          </div>
          <p className="text-lg font-bold text-green-400">{formatHashrate(hashrate)}</p>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <UserGroupIcon className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Miners</span>
          </div>
          <p className="text-lg font-bold text-blue-400">{miners}</p>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <CubeIcon className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">Blocks Found</span>
          </div>
          <p className="text-lg font-bold text-purple-400">{blocksFound}</p>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <ClockIcon className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-400">Last Block</span>
          </div>
          <p className="text-lg font-bold text-yellow-400">
            {timeSinceLastBlock > 0 ? `${timeSinceLastBlock}m ago` : "N/A"}
          </p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Block Reward</span>
          <span className="text-gray-200 font-medium">
            {poolConfig.block.reward} {poolConfig.coin.symbol}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs mt-1">
          <span className="text-gray-400">Pool Fee</span>
          <span className="text-gray-200 font-medium">{poolConfig.pool.fee}%</span>
        </div>
      </div>
    </div>
  );
}
