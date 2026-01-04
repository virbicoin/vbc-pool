"use client";
import useSWR from "swr";
import PaymentsTable from "@/components/PaymentsTable";
import {
  BanknotesIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PaymentsPage() {
  const { data = {}, isLoading } = useSWR(API_BASE_URL + "/api/payments", fetcher, {
    refreshInterval: 5000,
  });
  const payments = data.payments || [];

  // Calculate total paid from payments
  const totalPaidFromPayments =
    payments.reduce((sum: number, p: { amount: number }) => sum + (p.amount || 0), 0) / 1e9;
  const paymentsCount = payments.length;

  return (
    <div>
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-600/20 rounded-lg">
              <BanknotesIcon className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-100">Pool Payments</h1>
              <p className="text-gray-400 text-sm mt-1">View recent payouts made by the pool</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Banner */}
        <div className="bg-gradient-to-r from-yellow-900/30 to-green-900/30 rounded-lg border border-yellow-700/30 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                <p className="text-gray-400 text-sm">Recent Payments</p>
              </div>
              <p className="text-2xl font-bold text-white">{paymentsCount.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <ArrowTrendingUpIcon className="w-5 h-5 text-green-400" />
                <p className="text-gray-400 text-sm">Total Paid (Recent)</p>
              </div>
              <p className="text-2xl font-bold text-green-400">
                {totalPaidFromPayments.toFixed(4)} VBC
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <ClockIcon className="w-5 h-5 text-yellow-400" />
                <p className="text-gray-400 text-sm">Payout Interval</p>
              </div>
              <p className="text-2xl font-bold text-yellow-400">2 Hours</p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
          <div className="flex items-start gap-3">
            <InformationCircleIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p className="mb-1">
                <strong className="text-yellow-400">Automatic payouts</strong> are processed every 2
                hours for balances above <strong className="text-yellow-400">0.1 VBC</strong>.
              </p>
              <p className="text-gray-400">
                Click on any transaction hash to view it on the blockchain explorer.
              </p>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <BanknotesIcon className="w-5 h-5 text-yellow-400" />
              <h4 className="text-lg font-semibold text-gray-100">
                Latest Payouts
                <span className="ml-2 text-sm font-normal text-gray-400">(Last 100 payments)</span>
              </h4>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
            </div>
          ) : payments.length > 0 ? (
            <div className="p-4">
              <PaymentsTable payments={payments} />
            </div>
          ) : (
            <div className="text-center py-12">
              <BanknotesIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Payments Yet</h3>
              <p className="text-gray-500">
                Payments will appear here once miners reach the minimum payout threshold.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
