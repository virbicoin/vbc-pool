"use client";

import useSWR from "swr";
import Link from "next/link";
import { formatHashrate } from "@/lib/formatters";
import TimeAgo from "@/components/TimeAgo";
import {
  UserGroupIcon,
  UserIcon,
  SignalIcon,
  SignalSlashIcon,
  ChartBarIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Miner {
  hr: number;
  lastBeat: number;
  offline?: boolean;
}

export default function MinersPage() {
  const { data = {}, isLoading } = useSWR(API_BASE_URL + "/api/miners", fetcher, {
    refreshInterval: 5000,
  });

  const minersObject: { [address: string]: Miner } = data.miners || {};
  const minersArray = Object.entries(minersObject).map(([address, miner]) => ({
    miner: address,
    ...miner,
  }));
  const sortedMiners = minersArray.sort((a, b) => (b.hr || 0) - (a.hr || 0));

  const onlineMiners = sortedMiners.filter((m) => !m.offline);
  const offlineMiners = sortedMiners.filter((m) => m.offline);
  const totalHashrate = sortedMiners.reduce((sum, m) => sum + (m.hr || 0), 0);

  return (
    <div>
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-600/20 rounded-lg">
              <UserGroupIcon className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-100">Pool Miners</h1>
              <p className="text-gray-400 text-sm mt-1">
                View all miners currently connected to the pool
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Banner */}
        <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-lg border border-green-700/30 p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <UserGroupIcon className="w-5 h-5 text-gray-400" />
                <p className="text-gray-400 text-sm">Total Miners</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {sortedMiners.length.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <SignalIcon className="w-5 h-5 text-green-400" />
                <p className="text-gray-400 text-sm">Online</p>
              </div>
              <p className="text-2xl font-bold text-green-400">
                {onlineMiners.length.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <SignalSlashIcon className="w-5 h-5 text-red-400" />
                <p className="text-gray-400 text-sm">Offline</p>
              </div>
              <p className="text-2xl font-bold text-red-400">
                {offlineMiners.length.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <ChartBarIcon className="w-5 h-5 text-blue-400" />
                <p className="text-gray-400 text-sm">Total Hashrate</p>
              </div>
              <p className="text-2xl font-bold text-blue-400">{formatHashrate(totalHashrate)}</p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
          <div className="flex items-start gap-3">
            <InformationCircleIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p>
                Click on any miner address to view detailed statistics including hashrate history,
                workers, and payment history.
              </p>
            </div>
          </div>
        </div>

        {/* Miners Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <UserGroupIcon className="w-5 h-5 text-green-400" />
              <h4 className="text-lg font-semibold text-gray-100">
                Active Miners
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({sortedMiners.length.toLocaleString()} miners)
                </span>
              </h4>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
            </div>
          ) : sortedMiners.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      <span className="flex items-center gap-2">
                        <span>#</span>
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Hashrate
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Last Seen
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {sortedMiners.map((miner, index) => (
                    <tr
                      key={miner.miner}
                      className={`hover:bg-gray-700/30 transition-colors ${index % 2 === 0 ? "bg-gray-800/30" : "bg-gray-800/10"} ${miner.offline ? "opacity-60" : ""}`}
                    >
                      <td className="px-4 py-3 text-gray-500 text-sm">{index + 1}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/account/${miner.miner}`}
                          className="inline-flex items-center gap-2 font-mono text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <UserIcon className="w-4 h-4" />
                          <span className="hidden lg:inline">{miner.miner}</span>
                          <span className="lg:hidden">
                            {miner.miner.slice(0, 10)}...{miner.miner.slice(-8)}
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {miner.offline ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-300 border border-red-700/50">
                            <SignalSlashIcon className="w-3 h-3" />
                            Offline
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-300 border border-green-700/50">
                            <SignalIcon className="w-3 h-3" />
                            Online
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-mono text-sm ${miner.hr > 0 ? "text-green-400" : "text-gray-500"}`}
                        >
                          {formatHashrate(miner.hr)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm">
                        <TimeAgo timestamp={miner.lastBeat} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <UserGroupIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Miners Found</h3>
              <p className="text-gray-500">Be the first to start mining!</p>
              <Link
                href="/help"
                className="inline-flex items-center justify-center mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
