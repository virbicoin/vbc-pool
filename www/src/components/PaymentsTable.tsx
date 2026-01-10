"use client";
import TimeAgo from "@/components/TimeAgo";
import { Payment } from "@/lib/api";
import { poolConfig, shannonToCoin } from "@/lib/poolConfig";
import { ArrowTopRightOnSquareIcon, BanknotesIcon, ClockIcon } from "@heroicons/react/24/outline";

interface PaymentsTableProps {
  payments: Payment[];
}

export default function PaymentsTable({ payments }: PaymentsTableProps) {
  if (payments.length === 0) {
    return (
      <div className="text-center py-12">
        <BanknotesIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No payments found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4" />
                Time
              </span>
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Transaction Hash
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <BanknotesIcon className="w-4 h-4" />
                Amount
              </span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700/50">
          {payments.map((payment, index) => {
            const amount = shannonToCoin(payment.amount);
            return (
              <tr
                key={payment.tx}
                className={`hover:bg-gray-700/30 transition-colors ${index % 2 === 0 ? "bg-gray-800/30" : "bg-gray-800/10"}`}
              >
                <td className="px-4 py-3 text-gray-300 text-sm">
                  <TimeAgo timestamp={payment.timestamp} />
                </td>
                <td className="px-4 py-3">
                  {poolConfig.links.explorer ? (
                    <a
                      href={`${poolConfig.links.explorer}/tx/${payment.tx}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-mono text-sm text-blue-400 hover:text-blue-300 transition-colors group"
                    >
                      <span className="hidden lg:inline">{payment.tx}</span>
                      <span className="lg:hidden">
                        {payment.tx.slice(0, 16)}...{payment.tx.slice(-8)}
                      </span>
                      <ArrowTopRightOnSquareIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ) : (
                    <span className="font-mono text-sm text-gray-400">
                      <span className="hidden lg:inline">{payment.tx}</span>
                      <span className="lg:hidden">
                        {payment.tx.slice(0, 16)}...{payment.tx.slice(-8)}
                      </span>
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium border ${
                      amount >= 1
                        ? "bg-green-900/30 text-green-300 border-green-700/50"
                        : amount >= 0.1
                          ? "bg-blue-900/30 text-blue-300 border-blue-700/50"
                          : "bg-gray-700/50 text-gray-300 border-gray-600/50"
                    }`}
                  >
                    {amount.toFixed(8)} {poolConfig.coin.symbol}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
