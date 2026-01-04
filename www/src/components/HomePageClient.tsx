"use client";

import Link from "next/link";
import DashboardStats from "@/components/DashboardStats";
import AccountLookupForm from "@/components/AccountLookupForm";
import {
  HomeIcon,
  CubeIcon,
  UserGroupIcon,
  BanknotesIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

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
              <h1 className="text-3xl font-bold text-gray-100">VirBiCoin Mining Pool</h1>
              <p className="text-gray-400 text-sm mt-1">
                High-performance PROPS mining pool with automatic payouts
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Stats */}
        <DashboardStats stats={dashboardStats} />

        {/* Quick Links Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            href="/miners"
            className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:bg-gray-700/50 hover:border-gray-600 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600/20 rounded-lg group-hover:bg-green-600/30 transition-colors">
                <UserGroupIcon className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-100">View Miners</h3>
                <p className="text-sm text-gray-400">See all active miners</p>
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
                <h3 className="text-lg font-semibold text-gray-100">Pool Blocks</h3>
                <p className="text-sm text-gray-400">View found blocks</p>
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
                <h3 className="text-lg font-semibold text-gray-100">Payments</h3>
                <p className="text-sm text-gray-400">Recent payouts</p>
              </div>
            </div>
          </Link>

          <Link
            href="/help"
            className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:bg-gray-700/50 hover:border-gray-600 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600/20 rounded-lg group-hover:bg-purple-600/30 transition-colors">
                <QuestionMarkCircleIcon className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-100">Getting Started</h3>
                <p className="text-sm text-gray-400">How to mine</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Account Lookup Section */}
        <div className="mt-8">
          <AccountLookupForm />
        </div>
      </div>
    </div>
  );
};

export default HomePageClient;
