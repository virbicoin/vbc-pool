"use client";

import useSWR from "swr";
import { API_BASE_URL } from "@/lib/api";
import { CubeIcon, ClockIcon, CheckCircleIcon, SparklesIcon } from "@heroicons/react/24/outline";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function BlocksStats() {
  const { data: stats = {} } = useSWR(API_BASE_URL + "/api/stats", fetcher, {
    refreshInterval: 5000,
  });

  const maturedCount = stats?.maturedTotal ?? 0;
  const immatureCount = stats?.immatureTotal ?? 0;
  const pendingCount = stats?.candidatesTotal ?? 0;
  const totalBlocks = maturedCount + immatureCount + pendingCount;
  const luck = stats?.luck ?? 0;

  return (
    <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-700/30 p-6 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <CubeIcon className="w-5 h-5 text-gray-400" />
            <p className="text-gray-400 text-sm">Total Blocks</p>
          </div>
          <p className="text-2xl font-bold text-white">{totalBlocks.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <CheckCircleIcon className="w-5 h-5 text-blue-400" />
            <p className="text-gray-400 text-sm">Matured</p>
          </div>
          <p className="text-2xl font-bold text-blue-400">{maturedCount.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <ClockIcon className="w-5 h-5 text-green-400" />
            <p className="text-gray-400 text-sm">Immature</p>
          </div>
          <p className="text-2xl font-bold text-green-400">{immatureCount.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <SparklesIcon className="w-5 h-5 text-cyan-400" />
            <p className="text-gray-400 text-sm">Pending</p>
          </div>
          <p className="text-2xl font-bold text-cyan-400">{pendingCount.toLocaleString()}</p>
        </div>
      </div>
      {luck > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700/50 text-center">
          <p className="text-gray-400 text-sm mb-1">Pool Luck (Last 64 blocks)</p>
          <p className={`text-xl font-bold ${luck <= 100 ? "text-green-400" : "text-yellow-400"}`}>
            {luck.toFixed(1)}%
          </p>
        </div>
      )}
    </div>
  );
}
