"use client";

import { useMemo } from "react";
import { CheckCircleIcon, XCircleIcon, BoltIcon } from "@heroicons/react/24/outline";
import { formatHashrate } from "@/lib/formatters";
import TimeAgo from "@/components/TimeAgo";

interface Worker {
  name: string;
  hr: number;
  hr2?: number;
  lastBeat: number;
  offline?: boolean;
}

interface WorkerStatusGridProps {
  workers: Worker[];
  className?: string;
}

export default function WorkerStatusGrid({ workers, className = "" }: WorkerStatusGridProps) {
  const sortedWorkers = useMemo(() => {
    return [...workers].sort((a, b) => {
      // Online workers first, then by hashrate
      if (a.offline !== b.offline) {
        return a.offline ? 1 : -1;
      }
      return (b.hr || 0) - (a.hr || 0);
    });
  }, [workers]);

  const stats = useMemo(() => {
    const online = workers.filter((w) => !w.offline).length;
    const offline = workers.filter((w) => w.offline).length;
    const totalHashrate = workers.reduce((sum, w) => sum + (w.hr || 0), 0);
    return { online, offline, totalHashrate };
  }, [workers]);

  if (workers.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <BoltIcon className="w-12 h-12 text-gray-600 mx-auto mb-2" />
        <p className="text-gray-400">No workers found</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Summary Bar */}
      <div className="flex items-center gap-4 mb-4 p-3 bg-gray-900/50 rounded-lg">
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="w-5 h-5 text-green-400" />
          <span className="text-green-400 font-medium">{stats.online}</span>
          <span className="text-gray-400 text-sm">Online</span>
        </div>
        {stats.offline > 0 && (
          <div className="flex items-center gap-2">
            <XCircleIcon className="w-5 h-5 text-red-400" />
            <span className="text-red-400 font-medium">{stats.offline}</span>
            <span className="text-gray-400 text-sm">Offline</span>
          </div>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <BoltIcon className="w-5 h-5 text-blue-400" />
          <span className="text-blue-400 font-medium">{formatHashrate(stats.totalHashrate)}</span>
          <span className="text-gray-400 text-sm">Total</span>
        </div>
      </div>

      {/* Worker Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {sortedWorkers.map((worker) => (
          <WorkerCard key={worker.name} worker={worker} />
        ))}
      </div>
    </div>
  );
}

function WorkerCard({ worker }: { worker: Worker }) {
  const isOnline = !worker.offline;
  // Convert lastBeat to milliseconds timestamp
  const lastBeatMs = worker.lastBeat > 1e12 ? worker.lastBeat : worker.lastBeat * 1000;

  return (
    <div
      className={`p-3 rounded-lg border transition-colors ${
        isOnline
          ? "bg-gray-800 border-gray-700 hover:border-green-700/50"
          : "bg-red-900/20 border-red-700/50"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-400" : "bg-red-400"}`} />
        <span className="text-sm font-medium text-gray-200 truncate" title={worker.name}>
          {worker.name}
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Hashrate</span>
          <span className={isOnline ? "text-green-400" : "text-gray-500"}>
            {formatHashrate(worker.hr || 0)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Last seen</span>
          <span className={isOnline ? "text-gray-400" : "text-red-400"}>
            <TimeAgo timestamp={lastBeatMs} />
          </span>
        </div>
      </div>
    </div>
  );
}
