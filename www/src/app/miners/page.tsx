"use client";

import useSWR from "swr";
import Link from "next/link";
import { formatHashrate } from "@/lib/formatters";
import { API_BASE_URL } from "@/lib/api";
import TimeAgo from "@/components/TimeAgo";
import { useTranslation } from "@/components/I18nProvider";
import {
  UserGroupIcon,
  UserIcon,
  SignalIcon,
  SignalSlashIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Miner {
  hr: number;
  lastBeat: number;
  offline?: boolean;
}

export default function MinersPage() {
  const { t } = useTranslation();
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
              <h1 className="text-3xl font-bold text-gray-100">{t("miners.title")}</h1>
              <p className="text-gray-400 text-sm mt-1">{t("home.topMiners")}</p>
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
                <p className="text-gray-400 text-sm">{t("stats.activeMiners")}</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {sortedMiners.length.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <SignalIcon className="w-5 h-5 text-green-400" />
                <p className="text-gray-400 text-sm">{t("common.online")}</p>
              </div>
              <p className="text-2xl font-bold text-green-400">
                {onlineMiners.length.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <SignalSlashIcon className="w-5 h-5 text-red-400" />
                <p className="text-gray-400 text-sm">{t("common.offline")}</p>
              </div>
              <p className="text-2xl font-bold text-red-400">
                {offlineMiners.length.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <ChartBarIcon className="w-5 h-5 text-blue-400" />
                <p className="text-gray-400 text-sm">{t("stats.poolHashrate")}</p>
              </div>
              <p className="text-2xl font-bold text-blue-400">{formatHashrate(totalHashrate)}</p>
            </div>
          </div>
        </div>

        {/* Miners Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <UserGroupIcon className="w-5 h-5 text-green-400" />
              <h4 className="text-lg font-semibold text-gray-100">
                {t("miners.title")}
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({sortedMiners.length.toLocaleString()})
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
                      {t("miners.address")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {t("worker.status")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {t("worker.hashrate")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {t("worker.lastSeen")}
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
                            {t("common.offline")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-300 border border-green-700/50">
                            <SignalIcon className="w-3 h-3" />
                            {t("common.online")}
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
              <h3 className="text-xl font-semibold text-gray-300 mb-2">{t("common.noData")}</h3>
              <Link
                href="/help"
                className="inline-flex items-center justify-center mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                {t("account.getStarted")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
