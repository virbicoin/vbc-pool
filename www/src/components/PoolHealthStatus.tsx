"use client";

import useSWR from "swr";
import Image from "next/image";
import { ServerIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useTranslation } from "@/components/I18nProvider";

interface PoolNode {
  apiUrl: string;
  stratumUrl: string;
  location: string;
  flag: string;
  country: string;
  stratumPorts: number[];
  region: string;
  active: boolean;
}

interface PoolHealthData {
  isHealthy: boolean;
  latency?: number;
  portStatuses?: Record<number, boolean | string> | undefined;
  lastChecked?: number;
}

interface PoolHealthStatusProps {
  className?: string;
}

// 国旗表示コンポーネント
function FlagIcon({ country }: { country: string }) {
  if (country === "GLOBAL") {
    return (
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-500/20 border-blue-400/30 border-2">
        <GlobeAltIcon className="w-8 h-8 text-blue-400" />
      </div>
    );
  }

  // CDN国旗画像のみ表示
  const iso = country.toLowerCase();
  return (
    <div className="w-12 h-12 rounded-full overflow-hidden">
      <Image
        src={`https://flagcdn.com/w80/${iso}.png`}
        alt={country}
        width={48}
        height={48}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

// Fetch pools.json from /api/pools endpoint
function usePools() {
  const { data, error } = useSWR(
    "/api/pools",
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch pools.json");
      return res.json();
    },
    { suspense: false }
  );
  return {
    pools: data as PoolNode[] | undefined,
    isLoading: !error && !data,
    isError: !!error,
  };
}

// プールのヘルス状態をチェックする関数
async function checkPoolHealth(apiUrl: string): Promise<PoolHealthData> {
  const startTime = Date.now();
  try {
    const response = await fetch(`${apiUrl}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(10000),
      mode: "cors",
      credentials: "omit",
    });
    const endTime = Date.now();
    const latency = endTime - startTime;
    if (response.ok) {
      const data = await response.json();
      if (data && typeof data === "object" && !data.error) {
        return { isHealthy: true, latency, lastChecked: Date.now() };
      } else {
        return { isHealthy: false, lastChecked: Date.now() };
      }
    }
    return { isHealthy: false, lastChecked: Date.now() };
  } catch {
    return { isHealthy: false, lastChecked: Date.now() };
  }
}

// HealthCheck型を定義
interface HealthCheck extends PoolNode {
  healthData: PoolHealthData;
  isLoading: boolean;
}

export default function PoolHealthStatus({ className = "" }: PoolHealthStatusProps) {
  const { t } = useTranslation();
  const { pools } = usePools();
  const activePools = useMemo(() => pools?.filter((p) => p.active) || [], [pools]);
  const inactivePools = useMemo(() => pools?.filter((p) => !p.active) || [], [pools]);
  const POOL_NODES = useMemo(
    () => [...activePools, ...inactivePools],
    [activePools, inactivePools]
  );

  // まずpools.jsonの内容をそのまま表示（healthDataは空）
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>(() =>
    POOL_NODES.map((pool) => ({
      ...pool,
      healthData: { isHealthy: false, lastChecked: 0 },
      isLoading: true,
    }))
  );

  // stratumポートのヘルスチェック関数
  const checkStratumPortHealth = useCallback(
    async (stratumUrl: string, ports: number[]): Promise<Record<number, boolean | string>> => {
      const results: Record<number, boolean | string> = {};
      await Promise.all(
        ports.map(async (port: number) => {
          try {
            const res = await fetch(`/api/check-port?host=${stratumUrl}&port=${port}`, {
              method: "GET",
              signal: AbortSignal.timeout(10000), // タイムアウトを10秒に延長
            });
            if (res.ok) {
              const data = await res.json();
              results[port] = !!data.healthy;
            } else {
              results[port] = `HTTP ${res.status}`;
            }
          } catch (e: unknown) {
            let errorName = "";
            let errorMessage = "";
            if (typeof e === "object" && e !== null) {
              if ("name" in e && typeof (e as { name: unknown }).name === "string") {
                errorName = (e as { name: string }).name;
              }
              if ("message" in e && typeof (e as { message: unknown }).message === "string") {
                errorMessage = (e as { message: string }).message;
              }
            }
            results[port] = errorName === "TimeoutError" ? "Timeout" : errorMessage || "Error";
          }
        })
      );
      return results;
    },
    []
  );

  // 非同期でヘルスチェックを取得し、上書き反映
  useEffect(() => {
    if (!POOL_NODES.length) return;
    let cancelled = false;

    // Defer initial state setup to avoid synchronous setState in effect
    const initializeAndFetch = async () => {
      const now = Date.now();
      const initialState = POOL_NODES.map((pool) => ({
        ...pool,
        healthData: { isHealthy: false, lastChecked: now },
        isLoading: true,
      }));

      if (cancelled) return;
      setHealthChecks(initialState);

      const results = await Promise.all(
        POOL_NODES.map(async (pool) => {
          const checkTime = Date.now();
          if (!pool.active) {
            return {
              ...pool,
              healthData: { isHealthy: false, lastChecked: checkTime },
              isLoading: false,
            };
          }
          const healthData = await checkPoolHealth(pool.apiUrl);
          let portStatuses: Record<number, boolean | string> | undefined = undefined;
          try {
            portStatuses = await checkStratumPortHealth(pool.stratumUrl, pool.stratumPorts);
          } catch {}
          return {
            ...pool,
            healthData: { ...healthData, portStatuses },
            isLoading: false,
          };
        })
      );
      if (!cancelled) setHealthChecks(results);
    };

    initializeAndFetch();
    return () => {
      cancelled = true;
    };
  }, [POOL_NODES, checkStratumPortHealth]);

  // アクティブプールのみをカウント
  const activeHealthChecks = healthChecks.filter((check) =>
    activePools.some((node) => node.apiUrl === check.apiUrl)
  );
  // Pool-level health counts (API endpoint)
  const healthyPoolCount = activeHealthChecks.filter((check) => check.healthData.isHealthy).length;
  const totalPoolCount = activeHealthChecks.length;

  // Port-level health counts
  const totalPortCount = activeHealthChecks.reduce(
    (sum, pool) => sum + pool.stratumPorts.length,
    0
  );
  const healthyPortCount = activeHealthChecks.reduce((sum, pool) => {
    const statuses = pool.healthData.portStatuses;
    if (!statuses) return sum;
    return sum + pool.stratumPorts.filter((port: number) => statuses[port]).length;
  }, 0);

  // Global health includes both API (pool) と 各 stratum port
  const globalHealthy = healthyPoolCount + healthyPortCount;
  const globalTotal = totalPoolCount + totalPortCount;
  const healthPercentage = globalTotal > 0 ? (globalHealthy / globalTotal) * 100 : 0;

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <ServerIcon className="w-8 h-8 text-green-400" />
            {globalHealthy === globalTotal && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-300">{t("poolHealth.title")}</h3>
            <p className="text-sm text-gray-400">
              {t("poolHealth.poolsOnline", { healthy: healthyPoolCount, total: totalPoolCount })} •{" "}
              {t("poolHealth.uptime", { percent: healthPercentage.toFixed(0) })}
            </p>
          </div>
        </div>

        {/* 全体ステータスインジケーター */}
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            globalHealthy === globalTotal
              ? "bg-green-400/20 text-green-400"
              : globalHealthy > 0
                ? "bg-yellow-400/20 text-yellow-400"
                : "bg-red-400/20 text-red-400"
          }`}
        >
          {globalHealthy === globalTotal
            ? t("poolHealth.operational")
            : globalHealthy > 0
              ? t("poolHealth.degraded")
              : t("poolHealth.down")}
        </div>
      </div>

      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {healthChecks.map((pool, index) => (
            <div
              key={pool.apiUrl}
              className={`w-full p-6 rounded-lg border transition-all duration-300 hover:shadow-lg min-h-[160px] ${
                inactivePools.some((node) => node.apiUrl === pool.apiUrl)
                  ? "bg-gray-800/30 border-gray-600/50 opacity-60"
                  : `bg-gray-700/50 hover:bg-gray-700/70 ${
                      pool.healthData.isHealthy
                        ? "border-green-400/30 shadow-green-400/10"
                        : pool.isLoading
                          ? "border-gray-600/50"
                          : "border-red-400/30 shadow-red-400/10"
                    }`
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4 h-full">
                {/* 国旗とステータスインジケーター */}
                <div className="flex-shrink-0 relative">
                  <FlagIcon country={pool.country} />
                  {/* ステータスバッジ */}
                  <div className="absolute -bottom-1 -right-1">
                    {inactivePools.some((node) => node.apiUrl === pool.apiUrl) ? (
                      // Show a static gray circle for "Coming Soon" pools instead of a spinner
                      <div className="w-4 h-4 bg-gray-400 rounded-full shadow-lg"></div>
                    ) : pool.isLoading ? (
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin bg-gray-800"></div>
                    ) : pool.healthData.isHealthy ? (
                      <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                    ) : (
                      <div className="w-4 h-4 bg-red-400 rounded-full shadow-lg"></div>
                    )}
                  </div>
                </div>

                {/* プール情報 */}
                <div className="flex-grow min-w-0 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-semibold text-base truncate">
                          {pool.location}
                        </h4>
                      </div>
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full ${
                          inactivePools.some((node) => node.apiUrl === pool.apiUrl)
                            ? "bg-orange-500/20 text-orange-400"
                            : pool.isLoading
                              ? "bg-gray-600/50 text-gray-300"
                              : pool.healthData.isHealthy
                                ? "bg-green-400/20 text-green-400"
                                : "bg-red-400/20 text-red-400"
                        }`}
                      >
                        {/* Always show "Coming Soon" for inactive pools, regardless of loading state */}
                        {inactivePools.some((node) => node.apiUrl === pool.apiUrl)
                          ? t("poolHealth.comingSoon")
                          : pool.isLoading
                            ? t("poolHealth.checking")
                            : pool.healthData.isHealthy
                              ? t("poolHealth.online")
                              : t("poolHealth.offline")}
                      </span>
                    </div>

                    <p className="text-sm text-gray-400 truncate mb-4">{pool.stratumUrl}</p>
                  </div>

                  {/* メトリクス行 */}
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="flex flex-col items-center p-2.5 bg-gray-800/50 rounded-lg min-w-0">
                      <span className="text-gray-400 text-xs mb-1">{t("poolHealth.latency")}</span>
                      <span
                        className={`font-mono font-medium text-xs ${
                          pool.healthData.latency
                            ? "text-white"
                            : inactivePools.some((node) => node.apiUrl === pool.apiUrl)
                              ? "text-gray-500"
                              : "text-gray-500"
                        }`}
                      >
                        {inactivePools.some((node) => node.apiUrl === pool.apiUrl)
                          ? "---"
                          : pool.healthData.latency
                            ? `${pool.healthData.latency}ms`
                            : "N/A"}
                      </span>
                    </div>
                    <div className="col-span-2 w-full flex flex-col items-center p-2.5 bg-gray-800/50 rounded-lg min-w-0">
                      <span className="text-gray-400 text-xs mb-1">
                        {t("poolHealth.stratumPorts")}
                      </span>
                      <div className="flex justify-center gap-1">
                        {inactivePools.some((node) => node.apiUrl === pool.apiUrl) ? (
                          <span className="text-gray-500 font-medium text-xs">---</span>
                        ) : (
                          pool.stratumPorts.map((port: number, portIndex: number) => {
                            const portHealthy = pool.healthData.portStatuses
                              ? pool.healthData.portStatuses[port]
                              : undefined;
                            const badgeClass =
                              portHealthy === undefined
                                ? "bg-blue-500/20 text-blue-400"
                                : portHealthy === true
                                  ? "bg-green-500/20 text-green-400"
                                  : portHealthy === false
                                    ? "bg-red-500/20 text-red-400"
                                    : "bg-gray-500/20 text-gray-400"; // エラー時はグレー
                            return (
                              <span
                                key={portIndex}
                                className={`${badgeClass} px-1.5 py-0.5 rounded text-xs font-medium`}
                                title={typeof portHealthy === "string" ? portHealthy : undefined}
                              >
                                {port}
                              </span>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-600">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">{t("poolHealth.lastUpdated")}</span>
          <span className="text-gray-300">
            {new Date().toLocaleString(undefined, { timeZoneName: "short" }) || "N/A"}
          </span>
        </div>

        {/* ヘルス状態バー */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{t("poolHealth.globalHealth")}</span>
            <span>{healthPercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                healthPercentage === 100
                  ? "bg-green-400"
                  : healthPercentage >= 66
                    ? "bg-yellow-400"
                    : "bg-red-400"
              }`}
              style={{ width: `${healthPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
