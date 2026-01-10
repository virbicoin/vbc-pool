"use client";

import { useState, useEffect } from "react";
import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/solid";

interface NetworkStatusProps {
  className?: string;
}

interface NetworkInfo {
  blockNumber: number;
  difficulty: number;
  gasPrice: number;
  peerCount: number;
  syncStatus: "synced" | "syncing" | "behind";
  lastBlockTime: number;
}

export default function NetworkStatus({ className = "" }: NetworkStatusProps) {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  // Fetch network info
  useEffect(() => {
    const fetchNetworkInfo = async () => {
      try {
        // In real implementation, fetch from /api/stats or similar
        const response = await fetch("/api/stats");
        if (response.ok) {
          const data = await response.json();
          setNetworkInfo({
            blockNumber: data.nodes?.[0]?.height || 0,
            difficulty: data.nodes?.[0]?.difficulty || 0,
            gasPrice: 1000000000,
            peerCount: data.nodes?.length || 0,
            syncStatus: data.nodes?.length > 0 ? "synced" : "behind",
            lastBlockTime: Date.now(),
          });
        }
      } catch (error) {
        console.error("Failed to fetch network info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNetworkInfo();
    const interval = setInterval(fetchNetworkInfo, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 text-gray-500 ${className}`}>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  const statusColor =
    networkInfo?.syncStatus === "synced"
      ? "bg-green-500"
      : networkInfo?.syncStatus === "syncing"
        ? "bg-yellow-500"
        : "bg-red-500";

  const statusText =
    networkInfo?.syncStatus === "synced"
      ? "Connected"
      : networkInfo?.syncStatus === "syncing"
        ? "Syncing"
        : "Disconnected";

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-700/50 transition-colors"
      >
        <span className={`w-2 h-2 rounded-full ${statusColor} animate-pulse`} />
        <span className="text-sm text-gray-300">{statusText}</span>
        {networkInfo && (
          <span className="text-xs text-gray-500 font-mono">
            #{networkInfo.blockNumber.toLocaleString()}
          </span>
        )}
      </button>

      {expanded && networkInfo && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setExpanded(false)} />
          <div className="absolute left-0 top-full mt-2 w-64 bg-gray-800 rounded-lg border border-gray-700 shadow-xl z-50 p-4">
            <h4 className="font-medium text-gray-200 mb-3 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${statusColor}`} />
              Network Status
            </h4>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-400">Block Height</dt>
                <dd className="text-gray-200 font-mono">
                  {networkInfo.blockNumber.toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Difficulty</dt>
                <dd className="text-gray-200 font-mono">
                  {(networkInfo.difficulty / 1e9).toFixed(2)}G
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Peers</dt>
                <dd className="text-gray-200">{networkInfo.peerCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Last Block</dt>
                <dd className="text-gray-200">
                  {Math.floor((Date.now() - networkInfo.lastBlockTime) / 1000)}s ago
                </dd>
              </div>
            </dl>
          </div>
        </>
      )}
    </div>
  );
}

// Compact badge version
export function NetworkStatusBadge() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch("/api/health");
        setIsConnected(response.ok);
      } catch {
        setIsConnected(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs ${
        isConnected ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"
      }`}
    >
      {isConnected ? (
        <CheckCircleIcon className="w-3.5 h-3.5" />
      ) : (
        <ExclamationCircleIcon className="w-3.5 h-3.5" />
      )}
      <span>{isConnected ? "Online" : "Offline"}</span>
    </div>
  );
}
