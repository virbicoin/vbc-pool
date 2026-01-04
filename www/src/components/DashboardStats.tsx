"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { formatHashrate } from "@/lib/formatters";
import TimeAgo from "@/components/TimeAgo";
import PoolHealthStatus from "@/components/PoolHealthStatus";
import {
  UserGroupIcon,
  CpuChipIcon,
  GlobeAltIcon,
  ChartBarIcon,
  CubeIcon,
  ClockIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  GiftIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

interface Stats {
  hashrate: number;
  miners: number;
  workers: number;
  lastBlockFound: number;
  networkHashrate?: number;
  networkDifficulty?: number;
  blockHeight?: number;
  roundVariance?: number;
}

interface DashboardStatsProps {
  stats: Stats;
}

interface StatCardProps {
  icon: React.ReactNode;
  iconBgColor: string;
  title: string;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  valueColor?: string;
}

function StatCard({
  icon,
  iconBgColor,
  title,
  value,
  subtitle,
  valueColor = "text-white",
}: StatCardProps) {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 transition-all duration-300 hover:shadow-lg hover:bg-gray-700/50 hover:border-gray-600 group">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${iconBgColor} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${valueColor} truncate`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function DashboardStatsLoading() {
  return (
    <div>
      <div className="mb-6">
        <PoolHealthStatus />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(12)].map((_, index) => (
          <div key={index} className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded animate-pulse mb-2 w-24"></div>
                <div className="h-7 bg-gray-700 rounded animate-pulse w-32"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function DashboardStats({ stats: _ }: DashboardStatsProps) {
  const isDevelopment = process.env.NODE_ENV === "development";

  const [mockTime] = useState(() => Date.now());
  const mockData = useMemo(
    () => ({
      time: mockTime,
      hashrate: 8.93e9,
      networkHashrate: 1.919e10,
      minersTotal: 810,
      nodes: [
        {
          difficulty: 1.919e10,
          height: "114514",
        },
      ],
      stats: {
        lastBlockFound: Math.floor((mockTime - 12000) / 1000),
        roundShares: 1.8e10,
        networkHashrate: 1.919e10,
        networkDifficulty: 3.64364e12,
        height: 114514,
        roundVariance: 85.2,
      },
    }),
    [mockTime]
  );

  const fetcher = async () => {
    if (isDevelopment) {
      return Promise.resolve(mockData);
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://pool.digitalregion.jp";
    const response = await fetch(`${apiUrl}/api/stats`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  };

  const swrResult = useSWR(isDevelopment ? "/api/stats" : "api-stats", fetcher, {
    refreshInterval: isDevelopment ? 0 : 5000,
    revalidateOnFocus: false,
    revalidateOnReconnect: !isDevelopment,
    dedupingInterval: 2000,
    errorRetryInterval: 1000,
    errorRetryCount: isDevelopment ? 0 : 3,
  });

  const swr = isDevelopment ? { data: mockData, isLoading: false, error: null } : swrResult;

  const { data, isLoading, error } = swr;

  if (isLoading || error || !data) {
    return <DashboardStatsLoading />;
  }

  if (!isDevelopment && (!data || typeof data.hashrate !== "number")) {
    return <DashboardStatsLoading />;
  }

  let networkHashrate = 0;
  let networkDifficulty = 0;
  let blockHeight = 0;
  let roundVariance = 0;

  if (data?.nodes && Array.isArray(data.nodes)) {
    data.nodes.forEach((node: { difficulty: string | number; height: string | number }) => {
      const difficulty =
        typeof node.difficulty === "string" ? parseFloat(node.difficulty) : node.difficulty;
      const height = typeof node.height === "string" ? parseInt(node.height) : node.height;

      if (!isNaN(difficulty) && difficulty > networkDifficulty) {
        networkDifficulty = difficulty;
      }
      if (!isNaN(height) && height > blockHeight) {
        blockHeight = height;
      }
    });
  }

  if (networkDifficulty > 0) {
    const blockTime = 10;
    networkHashrate = networkDifficulty / blockTime;
  }

  if (data?.stats?.roundShares && networkDifficulty > 0) {
    roundVariance = (data.stats.roundShares / networkDifficulty) * 100;
  }

  const stats = {
    hashrate: data?.hashrate || 0,
    miners: data?.minersTotal || 0,
    workers: data?.minersTotal || 0,
    lastBlockFound: data?.stats?.lastBlockFound || 0,
    networkHashrate: data?.stats?.networkHashrate || networkHashrate,
    networkDifficulty: data?.stats?.networkDifficulty || networkDifficulty,
    blockHeight: data?.stats?.height || blockHeight,
    roundVariance: data?.stats?.roundVariance || roundVariance,
  };

  return (
    <div>
      <div className="mb-6">
        <PoolHealthStatus />
      </div>

      {/* Pool Stats Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <CpuChipIcon className="w-5 h-5 text-green-400" />
          Pool Statistics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<UserGroupIcon className="w-6 h-6 text-blue-400" />}
            iconBgColor="bg-blue-600/20"
            title="Miners Online"
            value={`${stats.miners.toLocaleString()}`}
            valueColor="text-blue-400"
          />
          <StatCard
            icon={<CpuChipIcon className="w-6 h-6 text-green-400" />}
            iconBgColor="bg-green-600/20"
            title="Pool Hashrate"
            value={formatHashrate(stats.hashrate)}
            valueColor="text-green-400"
          />
          <StatCard
            icon={<ClockIcon className="w-6 h-6 text-cyan-400" />}
            iconBgColor="bg-cyan-600/20"
            title="Last Block Found"
            value={
              stats.lastBlockFound ? (
                <TimeAgo timestamp={stats.lastBlockFound} agoOnly={true} />
              ) : (
                "Never"
              )
            }
            subtitle={
              stats.lastBlockFound
                ? new Date(stats.lastBlockFound * 1000).toLocaleString(undefined, {
                    timeZoneName: "short",
                  })
                : undefined
            }
            valueColor="text-cyan-400"
          />
          <StatCard
            icon={<AdjustmentsHorizontalIcon className="w-6 h-6 text-purple-400" />}
            iconBgColor="bg-purple-600/20"
            title="Round Variance"
            value={stats.roundVariance ? `${stats.roundVariance.toFixed(1)}%` : "0%"}
            subtitle="Lower is better"
            valueColor={stats.roundVariance <= 100 ? "text-green-400" : "text-yellow-400"}
          />
        </div>
      </div>

      {/* Network Stats Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <GlobeAltIcon className="w-5 h-5 text-yellow-400" />
          Network Statistics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<GlobeAltIcon className="w-6 h-6 text-yellow-400" />}
            iconBgColor="bg-yellow-600/20"
            title="Network Hashrate"
            value={stats.networkHashrate > 0 ? formatHashrate(stats.networkHashrate) : "Loading..."}
            valueColor="text-yellow-400"
          />
          <StatCard
            icon={<ChartBarIcon className="w-6 h-6 text-pink-400" />}
            iconBgColor="bg-pink-600/20"
            title="Network Difficulty"
            value={
              stats.networkDifficulty > 0
                ? `${(stats.networkDifficulty / 1e9).toFixed(2)} GH`
                : "Loading..."
            }
            valueColor="text-pink-400"
          />
          <StatCard
            icon={<CubeIcon className="w-6 h-6 text-orange-400" />}
            iconBgColor="bg-orange-600/20"
            title="Block Height"
            value={stats.blockHeight > 0 ? stats.blockHeight.toLocaleString() : "0"}
            subtitle={
              <a
                href={`https://explorer.digitalregion.jp/block/${stats.blockHeight}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                View in explorer →
              </a>
            }
            valueColor="text-orange-400"
          />
          <StatCard
            icon={<GiftIcon className="w-6 h-6 text-red-400" />}
            iconBgColor="bg-red-600/20"
            title="Block Reward"
            value="8 VBC"
            subtitle="Unlimited supply"
            valueColor="text-red-400"
          />
        </div>
      </div>

      {/* Pool Info Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <BanknotesIcon className="w-5 h-5 text-green-400" />
          Pool Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<CurrencyDollarIcon className="w-6 h-6 text-green-400" />}
            iconBgColor="bg-green-600/20"
            title="Pool Fee"
            value="1.0%"
            subtitle="Low fee"
            valueColor="text-green-400"
          />
          <StatCard
            icon={<CreditCardIcon className="w-6 h-6 text-yellow-400" />}
            iconBgColor="bg-yellow-600/20"
            title="Minimum Payout"
            value="0.1 VBC"
            subtitle="Low threshold"
            valueColor="text-yellow-400"
          />
          <StatCard
            icon={<ArrowPathIcon className="w-6 h-6 text-blue-400" />}
            iconBgColor="bg-blue-600/20"
            title="Payout Interval"
            value="2 Hours"
            subtitle="Automatic payouts"
            valueColor="text-blue-400"
          />
          <StatCard
            icon={<BanknotesIcon className="w-6 h-6 text-purple-400" />}
            iconBgColor="bg-purple-600/20"
            title="Payment Method"
            value="PROP"
            subtitle="Proportional rewards"
            valueColor="text-purple-400"
          />
        </div>
      </div>
    </div>
  );
}
