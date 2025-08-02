"use client";
import TimeAgo from "@/components/TimeAgo";
import { Payment } from "@/lib/api";

interface PaymentsTableProps {
  payments: Payment[]
}

export default function PaymentsTable({ payments }: PaymentsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700">
      <table className="w-full">
        <thead className="bg-gray-900">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Time</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Transaction</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {payments.map((payment) => (
            <tr key={payment.tx} className="hover:bg-gray-700 transition-colors">
              <td className="px-4 py-3 text-gray-300">
                <TimeAgo timestamp={payment.timestamp} />
              </td>
              <td className="px-4 py-3">
                <a
                  href={`https://explorer.digitalregion.jp/tx/${payment.tx}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {payment.tx}
                </a>
              </td>
              <td className="px-4 py-3 text-green-400">{(payment.amount / 1e9).toFixed(8)} VBC</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 