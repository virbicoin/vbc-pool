"use client";

import { useMemo } from "react";
import { TrophyIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { formatHashrate } from "@/lib/formatters";
import { useTranslation } from "@/components/I18nProvider";

interface Miner {
  address: string;
  hr: number;
  offline: boolean;
  lastBeat: number;
}

interface MinerLeaderboardProps {
  miners: Miner[];
  currentAddress?: string;
  limit?: number;
  className?: string;
}

const rankColors = [
  "text-yellow-400", // 1st - Gold
  "text-gray-300", // 2nd - Silver
  "text-amber-600", // 3rd - Bronze
];

const rankBgColors = [
  "bg-yellow-400/10 border-yellow-400/30",
  "bg-gray-300/10 border-gray-300/30",
  "bg-amber-600/10 border-amber-600/30",
];

export default function MinerLeaderboard({
  miners,
  currentAddress,
  limit = 10,
  className = "",
}: MinerLeaderboardProps) {
  const { t } = useTranslation();
  const rankedMiners = useMemo(() => {
    return [...miners]
      .filter((m) => !m.offline && m.hr > 0)
      .sort((a, b) => b.hr - a.hr)
      .slice(0, limit)
      .map((miner, index) => ({
        ...miner,
        rank: index + 1,
      }));
  }, [miners, limit]);

  const currentMinerRank = useMemo(() => {
    if (!currentAddress) return null;
    const allRanked = [...miners].filter((m) => !m.offline && m.hr > 0).sort((a, b) => b.hr - a.hr);
    const index = allRanked.findIndex(
      (m) => m.address.toLowerCase() === currentAddress.toLowerCase()
    );
    return index >= 0 ? index + 1 : null;
  }, [miners, currentAddress]);

  const totalHashrate = useMemo(() => {
    return miners.reduce((sum, m) => sum + (m.hr || 0), 0);
  }, [miners]);

  if (rankedMiners.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <TrophyIcon className="w-12 h-12 text-gray-600 mx-auto mb-2" />
        <p className="text-gray-400">{t("common.noData")}</p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 ${className}`}>
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-100 flex items-center gap-2">
            <TrophyIcon className="w-5 h-5 text-yellow-400" />
            {t("home.topMiners")}
          </h3>
          {currentMinerRank && (
            <span className="text-sm text-gray-400">
              {t("miners.rank")}:{" "}
              <span className="text-blue-400 font-medium">#{currentMinerRank}</span>
            </span>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-700/50">
        {rankedMiners.map((miner) => {
          const isCurrentUser =
            currentAddress && miner.address.toLowerCase() === currentAddress.toLowerCase();
          const sharePercent = totalHashrate > 0 ? (miner.hr / totalHashrate) * 100 : 0;

          return (
            <div
              key={miner.address}
              className={`p-3 flex items-center gap-3 ${
                isCurrentUser ? "bg-blue-900/20" : "hover:bg-gray-700/30"
              } transition-colors`}
            >
              {/* Rank Badge */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border ${
                  miner.rank <= 3
                    ? rankBgColors[miner.rank - 1]
                    : "bg-gray-700 border-gray-600 text-gray-400"
                }`}
              >
                <span className={miner.rank <= 3 ? rankColors[miner.rank - 1] : ""}>
                  {miner.rank}
                </span>
              </div>

              {/* Address */}
              <div className="flex-1 min-w-0">
                <a
                  href={`/account/${miner.address}`}
                  className={`font-mono text-sm truncate block ${
                    isCurrentUser ? "text-blue-400" : "text-gray-300 hover:text-white"
                  }`}
                >
                  {miner.address.slice(0, 10)}...{miner.address.slice(-8)}
                  {isCurrentUser && <span className="ml-2 text-xs">(You)</span>}
                </a>
              </div>

              {/* Stats */}
              <div className="text-right">
                <p className="text-sm font-medium text-green-400">{formatHashrate(miner.hr)}</p>
                <p className="text-xs text-gray-500">{sharePercent.toFixed(2)}%</p>
              </div>
            </div>
          );
        })}
      </div>

      {miners.length > limit && (
        <div className="p-3 border-t border-gray-700 text-center">
          <a
            href="/miners"
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1"
          >
            <ChartBarIcon className="w-4 h-4" />
            {t("common.viewAll")} ({miners.length})
          </a>
        </div>
      )}
    </div>
  );
}
