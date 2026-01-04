"use client";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { formatHashrate } from "@/lib/formatters";
import AccountTabs from "@/components/AccountTabs";
import Countdown from "@/components/Countdown";
import TimeAgo from "@/components/TimeAgo";
import { AccountWorker } from "@/lib/api";
import {
  CpuChipIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  GiftIcon,
  ArrowPathIcon,
  BanknotesIcon,
  WalletIcon,
  Cog6ToothIcon,
  CubeIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const fetcher = (url: string) => fetch(url).then((res) => res.json());

type StatCardProps = {
  title: string;
  value: string | number | React.ReactNode;
  subtext?: string;
  className?: string;
  icon?: React.ReactNode;
};

function StatCard({ title, value, subtext, className, icon }: StatCardProps) {
  return (
    <div className={`col-span-1 ${className || ""}`}>
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 min-h-[140px] h-full flex items-center gap-4">
        {icon}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
          <p className="text-2xl font-bold text-blue-400">{value}</p>
          {subtext && <p className="text-sm text-gray-400">{subtext}</p>}
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const params = useParams();
  const address = params["address"] as string;

  const { data: accountData } = useSWR(
    address ? API_BASE_URL + `/api/accounts/${address}` : null,
    fetcher,
    { refreshInterval: 5000 }
  );
  const { data: statsData } = useSWR(API_BASE_URL + "/api/stats", fetcher, {
    refreshInterval: 5000,
  });

  // Hooks must be called at top level, before any conditional returns
  const currentHeight = statsData?.pools?.virbicoin?.poolStats?.poolHeight || 0;
  const blockTime = statsData?.pools?.virbicoin?.config?.blockTime || 10;
  const epochBlocks = 30000;
  const blocksUntilEpoch = epochBlocks - (currentHeight % epochBlocks);
  const [epochSwitchTimestamp, setEpochSwitchTimestamp] = useState(0);
  useEffect(() => {
    setEpochSwitchTimestamp(Date.now() + blocksUntilEpoch * blockTime * 1000);
  }, [blocksUntilEpoch, blockTime]);

  if (!accountData || !accountData.stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Account not found</h1>
        <p>The account with address {address} was not found on this pool.</p>
      </div>
    );
  }

  const { stats, workers = {}, payments = [], workersOnline, paymentsTotal } = accountData;
  const accountRoundShares = accountData.roundShares || 0;
  const poolRoundShares = statsData?.stats?.roundShares || 0;
  const yourRoundSharePercent =
    poolRoundShares > 0 ? (accountRoundShares / poolRoundShares) * 100 : 0;
  const workerList = Object.entries(workers).map(([name, worker]) => ({
    ...(worker as AccountWorker),
    name,
  }));

  return (
    <div>
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-100">Account Details</h1>
          <h4 className="text-lg text-gray-400 flex items-center gap-2">
            <WalletIcon className="w-6 h-6 text-blue-400" />
            <a
              href={`https://explorer.digitalregion.jp/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400"
            >
              {address}
            </a>
          </h4>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={<GiftIcon className="w-8 h-8 text-pink-400" />}
            title="Immature Balance"
            value={`${(stats.immature / 1e9).toFixed(8)} VBC`}
            subtext="Awaiting blocks to mature."
          />
          <StatCard
            icon={<CurrencyDollarIcon className="w-8 h-8 text-green-400" />}
            title="Pending Balance"
            value={`${(stats.balance / 1e9).toFixed(8)} VBC`}
            subtext="Credited coins awaiting payout."
          />
          <StatCard
            icon={<BanknotesIcon className="w-8 h-8 text-cyan-400" />}
            title="Total Paid"
            value={`${(stats.paid / 1e9).toFixed(8)} VBC`}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <StatCard
            icon={<Cog6ToothIcon className="w-8 h-8 text-blue-400" />}
            title="Workers Online"
            value={`${workersOnline || 0} Workers`}
          />
          <StatCard
            icon={<CpuChipIcon className="w-8 h-8 text-green-400" />}
            title="Hashrate (30m)"
            value={formatHashrate(accountData.currentHashrate || 0)}
          />
          <StatCard
            icon={<CpuChipIcon className="w-8 h-8 text-yellow-400" />}
            title="Hashrate (3h)"
            value={formatHashrate(accountData.hashrate || 0)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <StatCard
            icon={<ClockIcon className="w-8 h-8 text-cyan-400" />}
            title="Last Share Submitted"
            value={<TimeAgo timestamp={stats.lastShare} agoOnly={true} />}
            subtext={
              stats.lastShare
                ? new Date(stats.lastShare * 1000).toLocaleString(undefined, {
                    timeZoneName: "short",
                  })
                : "N/A"
            }
          />
          <StatCard
            icon={<CubeIcon className="w-8 h-8 text-pink-400" />}
            title="Blocks Found"
            value={`${stats.blocksFound} Blocks`}
          />
          <StatCard
            icon={<ArrowPathIcon className="w-8 h-8 text-blue-400" />}
            title="Total Payments"
            value={`${paymentsTotal || 0} Payouts`}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <StatCard
            icon={<ArrowTrendingUpIcon className="w-8 h-8 text-orange-400" />}
            title="Your Round Share"
            value={`${yourRoundSharePercent.toFixed(2)}%`}
            subtext="Contribution to current round."
          />
          <StatCard
            icon={<AdjustmentsHorizontalIcon className="w-8 h-8 text-purple-400" />}
            title="Epoch Switch"
            value={<Countdown to={epochSwitchTimestamp} />}
            subtext={`In ${blocksUntilEpoch} blocks`}
          />
        </div>

        <div className="mt-8">
          <AccountTabs workers={workerList} payments={payments || []} />
        </div>
      </div>
    </div>
  );
}
