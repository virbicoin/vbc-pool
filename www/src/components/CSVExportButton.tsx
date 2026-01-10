"use client";

import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { Payment } from "@/lib/api";
import { poolConfig, shannonToCoin } from "@/lib/poolConfig";

interface CSVExportButtonProps {
  payments: Payment[];
  filename?: string;
}

export default function CSVExportButton({ payments, filename = "payments" }: CSVExportButtonProps) {
  const handleExport = () => {
    if (payments.length === 0) return;

    // CSV headers
    const headers = ["Date", "Time", "Transaction Hash", `Amount (${poolConfig.coin.symbol})`];

    // Convert payments to CSV rows
    const rows = payments.map((payment) => {
      const date = new Date(payment.timestamp * 1000);
      const dateStr = date.toLocaleDateString();
      const timeStr = date.toLocaleTimeString();
      const amount = shannonToCoin(payment.amount).toFixed(8);
      return [dateStr, timeStr, payment.tx, amount];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      disabled={payments.length === 0}
      className="inline-flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 text-sm rounded-lg transition-colors"
      title="Export to CSV"
    >
      <ArrowDownTrayIcon className="w-4 h-4" />
      <span className="hidden sm:inline">Export CSV</span>
    </button>
  );
}
