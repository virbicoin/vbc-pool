"use client";
import { useState, useCallback } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatHashrate } from "@/lib/formatters";
import { poolConfig, formatCoinAmount } from "@/lib/poolConfig";
import { API_BASE_URL } from "@/lib/api";
import AccountTabs from "@/components/AccountTabs";
import Countdown from "@/components/Countdown";
import TimeAgo from "@/components/TimeAgo";
import WalletQRCode from "@/components/WalletQRCode";
import { FavoriteButton } from "@/components/FavoritesPanel";
import ShareEstimator from "@/components/ShareEstimator";
import HashrateAlert from "@/components/HashrateAlert";
import WorkerStatusGrid from "@/components/WorkerStatusGrid";
import AutoRefreshSettings from "@/components/AutoRefreshSettings";
import { AccountWorker } from "@/lib/api";
import { useTranslation } from "@/components/I18nProvider";
import {
  UserIcon,
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
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
  InformationCircleIcon,
  SignalIcon,
  SignalSlashIcon,
} from "@heroicons/react/24/outline";
import { isValidEthereumAddress, sanitizeAddress } from "@/lib/formatters";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type StatCardProps = {
  title: string;
  value: string | number | React.ReactNode;
  subtext?: string;
  className?: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
};

function StatCard({ title, value, subtext, className, icon, iconBgColor }: StatCardProps) {
  return (
    <div className={`col-span-1 ${className || ""}`}>
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-5 h-full">
        <div className="flex items-start gap-4">
          {icon && (
            <div className={`p-2.5 rounded-lg ${iconBgColor || "bg-blue-600/20"}`}>{icon}</div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-400 mb-1">{title}</h3>
            <p className="text-xl font-bold text-gray-100 truncate">{value}</p>
            {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const params = useParams();
  const rawAddress = params["address"] as string;
  const { t } = useTranslation();

  // SECURITY: Validate and sanitize address from URL
  const address = sanitizeAddress(rawAddress);
  const isAddressValid = isValidEthereumAddress(address);

  const {
    data: accountData,
    isLoading,
    mutate: mutateAccount,
  } = useSWR(
    address && isAddressValid ? API_BASE_URL + `/api/accounts/${address}` : null,
    fetcher,
    {
      refreshInterval: 5000,
    }
  );
  const { data: statsData, mutate: mutateStats } = useSWR(API_BASE_URL + "/api/stats", fetcher, {
    refreshInterval: 5000,
  });

  const handleRefresh = useCallback(() => {
    mutateAccount();
    mutateStats();
  }, [mutateAccount, mutateStats]);

  // Hooks must be called at top level, before any conditional returns
  // Get pool stats from API response - pools object has coin name as key
  const poolsData = statsData?.pools || {};
  const firstPoolKey = Object.keys(poolsData)[0];
  const poolStats = firstPoolKey ? poolsData[firstPoolKey] : null;
  const currentHeight = poolStats?.poolStats?.poolHeight || statsData?.stats?.height || 0;
  const blockTime = poolStats?.config?.blockTime || poolConfig.block.time;
  const epochBlocks = 30000;
  const blocksUntilEpoch = epochBlocks - (currentHeight % epochBlocks);
  const [epochSwitchTimestamp] = useState(() => Date.now() + blocksUntilEpoch * blockTime * 1000);

  // Loading state
  if (isLoading) {
    return (
      <div>
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <UserIcon className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-100">{t("account.title")}</h1>
                <p className="text-gray-400 text-sm mt-1">{t("account.loadingInfo")}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          </div>
        </div>
      </div>
    );
  }

  // SECURITY: Invalid address format
  if (!isAddressValid) {
    return (
      <div>
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-600/20 rounded-lg">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-100">{t("account.invalidAddress")}</h1>
                <p className="text-gray-400 text-sm mt-1">{t("account.invalidAddressDesc")}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
            <p className="text-red-400">{t("account.validAddressFormat")}</p>
            <Link
              href="/"
              className="inline-block mt-4 text-blue-400 hover:text-blue-300 hover:underline"
            >
              ← {t("account.returnToHome")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Account not found
  if (!accountData || !accountData.stats) {
    return (
      <div>
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-600/20 rounded-lg">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-100">{t("account.notFound")}</h1>
                <p className="text-gray-400 text-sm mt-1">
                  {t("account.notFoundDesc").split(".")[0]}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-300 mb-2">{t("account.notFound")}</h2>
            <p className="text-gray-500 mb-4 font-mono text-sm break-all">{address}</p>
            <p className="text-gray-400 mb-6">{t("account.notFoundDesc")}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/help"
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {t("account.getStarted")}
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
              >
                {t("account.backToDashboard")}
              </Link>
            </div>
          </div>
        </div>
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

  const isOnline = workersOnline > 0;

  return (
    <div>
      {/* Header Section */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <UserIcon className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-100">{t("account.title")}</h1>
              <p className="text-gray-400 text-sm mt-1">{t("account.subtitle")}</p>
            </div>
            {/* Auto Refresh & Hashrate Alert */}
            <div className="flex items-center gap-2 ml-auto">
              <AutoRefreshSettings onRefresh={handleRefresh} />
              <HashrateAlert currentHashrate={accountData?.currentHashrate || 0} />
            </div>
          </div>

          {/* Address Bar */}
          <div className="bg-gray-900/50 rounded-lg border border-gray-700/50 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <WalletIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span className="font-mono text-sm text-gray-300 break-all">{address}</span>
              </div>
              <div className="flex items-center gap-3">
                {isOnline ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-300 border border-green-700/50">
                    <SignalIcon className="w-3 h-3" />
                    {t("common.online")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-300 border border-red-700/50">
                    <SignalSlashIcon className="w-3 h-3" />
                    {t("common.offline")}
                  </span>
                )}
                {poolConfig.links.explorer && (
                  <a
                    href={`${poolConfig.links.explorer}/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
                  >
                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                    {t("account.explorer")}
                  </a>
                )}
                <WalletQRCode address={address} />
                <FavoriteButton address={address} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Balance Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <CurrencyDollarIcon className="w-5 h-5 text-green-400" />
            {t("account.balance")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              icon={<GiftIcon className="w-6 h-6 text-pink-400" />}
              iconBgColor="bg-pink-600/20"
              title={t("account.immatureBalance")}
              value={formatCoinAmount(stats.immature)}
              subtext={t("account.immatureBalanceDesc")}
            />
            <StatCard
              icon={<CurrencyDollarIcon className="w-6 h-6 text-green-400" />}
              iconBgColor="bg-green-600/20"
              title={t("account.pendingBalance")}
              value={formatCoinAmount(stats.balance)}
              subtext={t("account.pendingBalanceDesc")}
            />
            <StatCard
              icon={<BanknotesIcon className="w-6 h-6 text-cyan-400" />}
              iconBgColor="bg-cyan-600/20"
              title={t("account.totalPaid")}
              value={formatCoinAmount(stats.paid)}
              subtext={t("account.totalPaidDesc").replace("{count}", String(paymentsTotal || 0))}
            />
          </div>
        </div>

        {/* Hashrate Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <CpuChipIcon className="w-5 h-5 text-blue-400" />
            {t("account.hashrate")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              icon={<Cog6ToothIcon className="w-6 h-6 text-blue-400" />}
              iconBgColor="bg-blue-600/20"
              title={t("account.workersOnline")}
              value={`${workersOnline || 0}`}
              subtext={t("account.workersOnlineDesc").replace("{count}", String(workerList.length))}
            />
            <StatCard
              icon={<CpuChipIcon className="w-6 h-6 text-green-400" />}
              iconBgColor="bg-green-600/20"
              title={t("account.hashrate30m")}
              value={formatHashrate(accountData.currentHashrate || 0)}
              subtext={t("account.hashrate30mDesc")}
            />
            <StatCard
              icon={<CpuChipIcon className="w-6 h-6 text-yellow-400" />}
              iconBgColor="bg-yellow-600/20"
              title={t("account.hashrate3h")}
              value={formatHashrate(accountData.hashrate || 0)}
              subtext={t("account.hashrate3hDesc")}
            />
          </div>
        </div>

        {/* Mining Stats Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <ArrowTrendingUpIcon className="w-5 h-5 text-purple-400" />
            {t("account.miningStats")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<ClockIcon className="w-6 h-6 text-cyan-400" />}
              iconBgColor="bg-cyan-600/20"
              title={t("account.lastShare")}
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
              icon={<CubeIcon className="w-6 h-6 text-pink-400" />}
              iconBgColor="bg-pink-600/20"
              title={t("account.blocksFoundByAccount")}
              value={stats.blocksFound}
              subtext={t("account.blocksFoundDesc")}
            />
            <StatCard
              icon={<ArrowTrendingUpIcon className="w-6 h-6 text-orange-400" />}
              iconBgColor="bg-orange-600/20"
              title={t("account.roundShare")}
              value={`${yourRoundSharePercent.toFixed(2)}%`}
              subtext={t("account.roundShareDesc")}
            />
            <StatCard
              icon={<AdjustmentsHorizontalIcon className="w-6 h-6 text-purple-400" />}
              iconBgColor="bg-purple-600/20"
              title={t("account.epochSwitch")}
              value={<Countdown to={epochSwitchTimestamp} />}
              subtext={t("account.epochSwitchDesc").replace(
                "{count}",
                blocksUntilEpoch.toLocaleString()
              )}
            />
          </div>
        </div>

        {/* Share Estimator */}
        {accountRoundShares > 0 && (
          <ShareEstimator
            accountRoundShares={accountRoundShares}
            poolRoundShares={poolRoundShares}
            className="mb-6"
          />
        )}

        {/* Worker Status Grid */}
        {workerList.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <CpuChipIcon className="w-5 h-5 text-green-400" />
              {t("account.workerStatus")}
            </h2>
            <WorkerStatusGrid workers={workerList} />
          </div>
        )}

        {/* Info Banner */}
        <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
          <div className="flex items-start gap-3">
            <InformationCircleIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p className="mb-1">
                <strong className="text-blue-400">
                  {t("account.payoutInfo")
                    .replace("{interval}", "2 hours")
                    .replace(
                      "{minPayout}",
                      `${poolConfig.pool.minPayout} ${poolConfig.coin.symbol}`
                    )}
                </strong>
              </p>
              <p className="text-gray-400">
                {t("account.immatureInfo").replace("{confirmations}", "120")}
              </p>
            </div>
          </div>
        </div>

        {/* Workers & Payments Tabs */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <ArrowPathIcon className="w-5 h-5 text-blue-400" />
              <h4 className="text-lg font-semibold text-gray-100">
                {t("account.workersPayments")}
              </h4>
            </div>
          </div>
          <div className="p-4">
            <AccountTabs workers={workerList} payments={payments || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
