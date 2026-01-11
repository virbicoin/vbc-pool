"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import useSWR from "swr";
import DashboardStats from "@/components/DashboardStats";
import AccountLookupForm from "@/components/AccountLookupForm";
import Announcements from "@/components/Announcements";
import MinerLeaderboard from "@/components/MinerLeaderboard";
import poolConfig from "@/lib/poolConfig";
import { API_BASE_URL } from "@/lib/api";
import { useTranslation } from "@/components/I18nProvider";
import {
  HomeIcon,
  CubeIcon,
  UserGroupIcon,
  BanknotesIcon,
  QuestionMarkCircleIcon,
  CalculatorIcon,
} from "@heroicons/react/24/outline";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Dynamic import for HashrateChart to avoid SSR issues with Chart.js
const HashrateChart = dynamic(() => import("@/components/HashrateChart"), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 h-[350px] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
    </div>
  ),
});

interface HomePageClientProps {
  dashboardStats: {
    hashrate: number;
    miners: number;
    workers: number;
    lastBlockFound: number;
    networkHashrate: number;
    networkDifficulty: number;
    blockHeight: number;
    roundVariance: number;
  };
}

const HomePageClient: React.FC<HomePageClientProps> = ({ dashboardStats }) => {
  const { t } = useTranslation();
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600/20 rounded-lg">
              <HomeIcon className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-100">{poolConfig.pool.name}</h1>
              <p className="text-gray-400 text-sm mt-1">{poolConfig.pool.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Announcements */}
        <Announcements />

        {/* Dashboard Stats */}
        <DashboardStats stats={dashboardStats} />

        {/* Hashrate Chart */}
        <div className="mt-8">
          <HashrateChart title={t("home.hashrateHistory")} color="#22c55e" height={250} />
        </div>

        {/* Quick Links Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-4">
          <Link
            href="/miners"
            className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:bg-gray-700/50 hover:border-gray-600 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600/20 rounded-lg group-hover:bg-green-600/30 transition-colors">
                <UserGroupIcon className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-100">{t("nav.miners")}</h3>
                <p className="text-sm text-gray-400">{t("home.topMiners")}</p>
              </div>
            </div>
          </Link>

          <Link
            href="/blocks"
            className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:bg-gray-700/50 hover:border-gray-600 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/20 rounded-lg group-hover:bg-blue-600/30 transition-colors">
                <CubeIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-100">{t("nav.blocks")}</h3>
                <p className="text-sm text-gray-400">{t("home.recentBlocks")}</p>
              </div>
            </div>
          </Link>

          <Link
            href="/payments"
            className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:bg-gray-700/50 hover:border-gray-600 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-600/20 rounded-lg group-hover:bg-yellow-600/30 transition-colors">
                <BanknotesIcon className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-100">{t("nav.payments")}</h3>
                <p className="text-sm text-gray-400">{t("payments.recent")}</p>
              </div>
            </div>
          </Link>

          <Link
            href="/calculator"
            className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:bg-gray-700/50 hover:border-gray-600 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600/20 rounded-lg group-hover:bg-purple-600/30 transition-colors">
                <CalculatorIcon className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-100">{t("nav.calculator")}</h3>
                <p className="text-sm text-gray-400">{t("calculator.description")}</p>
              </div>
            </div>
          </Link>

          <Link
            href="/help"
            className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:bg-gray-700/50 hover:border-gray-600 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-600/20 rounded-lg group-hover:bg-cyan-600/30 transition-colors">
                <QuestionMarkCircleIcon className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-100">{t("nav.help")}</h3>
                <p className="text-sm text-gray-400">{t("help.description")}</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Two Column Layout: Leaderboard + Account Lookup */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Miner Leaderboard */}
          <MinerLeaderboardSection />

          {/* Account Lookup Section */}
          <AccountLookupForm />
        </div>
      </div>
    </div>
  );
};

// Separate component for miner leaderboard to handle data fetching
interface MinerData {
  hr: number;
  offline: boolean;
  lastBeat: number;
}

function MinerLeaderboardSection() {
  const { data } = useSWR(API_BASE_URL + "/api/miners", fetcher, {
    refreshInterval: 10000,
  });

  const minersObject: Record<string, MinerData> = data?.miners || {};
  const minersArray = Object.entries(minersObject).map(([address, miner]) => ({
    address,
    hr: miner.hr || 0,
    offline: miner.offline || false,
    lastBeat: miner.lastBeat || 0,
  }));

  return <MinerLeaderboard miners={minersArray} limit={10} />;
}

export default HomePageClient;
