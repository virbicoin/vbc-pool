"use client";

import { useState } from "react";
import { AccountWorker, AccountPayment } from "@/lib/api";
import { formatHashrate } from "@/lib/formatters";
import { poolConfig, shannonToCoin } from "@/lib/poolConfig";
import TimeAgo from "./TimeAgo";

type AccountTabsProps = {
  workers: AccountWorker[];
  payments: AccountPayment[];
};

const AccountTabs = ({ workers, payments }: AccountTabsProps) => {
  const [activeTab, setActiveTab] = useState("workers");

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="flex space-x-4 border-b border-gray-700 mb-4">
        <button
          className={`px-4 py-2 -mb-px text-sm font-medium border-b-2 focus:outline-none transition-colors duration-150 ${
            activeTab === "workers"
              ? "text-gray-200 hover:text-gray-100 border-green-400"
              : "text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-600"
          }`}
          onClick={() => setActiveTab("workers")}
        >
          Workers{" "}
          <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-green-900 text-green-200 border border-green-700">
            {workers.length}
          </span>
        </button>
        <button
          className={`px-4 py-2 -mb-px text-sm font-medium border-b-2 focus:outline-none transition-colors duration-150 ${
            activeTab === "payouts"
              ? "text-gray-200 hover:text-gray-100 border-blue-400"
              : "text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-600"
          }`}
          onClick={() => setActiveTab("payouts")}
        >
          Payouts{" "}
          <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-900 text-blue-200 border border-blue-700">
            {payments.length}
          </span>
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "workers" && (
          <div className="tab-pane active">
            <div className="overflow-x-auto rounded-lg border border-gray-700">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                      Hashrate
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                      Avg Hashrate (1h)
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                      Last Share
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700 bg-gray-800">
                  {workers.map((worker) => (
                    <tr
                      key={worker.name}
                      className={
                        worker.offline
                          ? "bg-red-900/50"
                          : "hover:bg-gray-800 transition-colors duration-150"
                      }
                    >
                      <td className="px-4 py-3 text-gray-200">{worker.name}</td>
                      <td className="px-4 py-3 text-gray-300">{formatHashrate(worker.hr)}</td>
                      <td className="px-4 py-3 text-gray-300">{formatHashrate(worker.hr2)}</td>
                      <td className="px-4 py-3 text-gray-300">
                        <TimeAgo timestamp={worker.lastBeat} />
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {worker.offline ? (
                          <span className="text-red-400">Offline</span>
                        ) : (
                          <span className="text-green-400">Online</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "payouts" && (
          <div className="tab-pane active">
            <div className="overflow-x-auto rounded-lg border border-gray-700">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Time</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Tx ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700 bg-gray-800">
                  {payments.map((payout) => (
                    <tr
                      key={payout.tx}
                      className="hover:bg-gray-800 transition-colors duration-150"
                    >
                      <td className="px-4 py-3 text-gray-300">
                        {new Date(payout.timestamp * 1000).toLocaleString(undefined, {
                          timeZoneName: "short",
                        })}
                      </td>
                      <td className="px-4 py-3 text-green-400">
                        {shannonToCoin(payout.amount).toFixed(4)} {poolConfig.coin.symbol}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-gray-400">
                        {poolConfig.links.explorer ? (
                          <a
                            href={`${poolConfig.links.explorer}/tx/${payout.tx}`}
                            className="text-blue-400 hover:text-blue-300 transition-colors break-all"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {payout.tx.substring(0, 10)}...
                            {payout.tx.substring(payout.tx.length - 8)}
                          </a>
                        ) : (
                          <span className="break-all">
                            {payout.tx.substring(0, 10)}...
                            {payout.tx.substring(payout.tx.length - 8)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountTabs;
