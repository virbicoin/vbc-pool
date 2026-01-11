"use client";
import useSWR from "swr";
import PaymentsTable from "@/components/PaymentsTable";
import CSVExportButton from "@/components/CSVExportButton";
import { poolConfig, shannonToCoin } from "@/lib/poolConfig";
import { API_BASE_URL } from "@/lib/api";
import { useTranslation } from "@/components/I18nProvider";
import {
  BanknotesIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PaymentsPage() {
  const { t } = useTranslation();
  const { data = {}, isLoading } = useSWR(API_BASE_URL + "/api/payments", fetcher, {
    refreshInterval: 5000,
  });
  const payments = data.payments || [];

  // Calculate total paid from payments
  const totalPaidFromPayments = payments.reduce(
    (sum: number, p: { amount: number }) => sum + (p.amount || 0),
    0
  );
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
              <h1 className="text-3xl font-bold text-gray-100">{t("payments.title")}</h1>
              <p className="text-gray-400 text-sm mt-1">{t("payments.recent")}</p>
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
                <p className="text-gray-400 text-sm">{t("payments.recent")}</p>
              </div>
              <p className="text-2xl font-bold text-white">{paymentsCount.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <ArrowTrendingUpIcon className="w-5 h-5 text-green-400" />
                <p className="text-gray-400 text-sm">{t("account.totalPaid")}</p>
              </div>
              <p className="text-2xl font-bold text-green-400">
                {shannonToCoin(totalPaidFromPayments).toFixed(4)} {poolConfig.coin.symbol}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <ClockIcon className="w-5 h-5 text-yellow-400" />
                <p className="text-gray-400 text-sm">{t("stats.payoutInterval")}</p>
              </div>
              <p className="text-2xl font-bold text-yellow-400">2 Hours</p>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BanknotesIcon className="w-5 h-5 text-yellow-400" />
                <h4 className="text-lg font-semibold text-gray-100">{t("payments.recent")}</h4>
              </div>
              <CSVExportButton payments={payments} filename="pool_payments" />
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
              <h3 className="text-xl font-semibold text-gray-300 mb-2">{t("common.noData")}</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
