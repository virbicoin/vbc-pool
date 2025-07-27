"use client";

import { useEffect } from 'react';

// グローバル変数でヘルスチェック実行状態を管理
let hasPerformedGlobalHealthCheck = false;

const GlobalHealthChecker: React.FC = () => {
  useEffect(() => {
    // グローバル変数で重複実行を防ぐ
    if (hasPerformedGlobalHealthCheck) {
      return; // ログも出力しない（完全にサイレント）
    }
    
    hasPerformedGlobalHealthCheck = true;

    const fetchHealth = async () => {
      try {
        
        
        

        // Global health check - 単一APIルートで全プールのヘルスチェックを実行
        try {
          const response = await fetch('/api/health/pools', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(20000) // 20秒タイムアウト（全プール分）
          });

          if (!response.ok) {
            console.error('[Health Check] Global health check failed:', response.status);
            return;
          }

          const data = await response.json();
          const poolResults = data.pools || [];
          
          // 型定義
          type PoolResult = {
            pool: string;
            status: string;
            latency: number;
            hostname?: string;
            time?: string;
            error?: string;
            stratumUrl?: string; // 追加
            stratumPorts?: number[]; // 追加
          };
          
          // pools.jsonからactiveかつglobal以外の全プールのstratumUrl/stratumPorts[0]で/api/check-portを並列fetch
          const candidatePools = poolResults.filter((pool: PoolResult) => pool.status !== 'inactive' && pool.pool !== 'global');
          const checkPortResults = await Promise.all(candidatePools.map(async (pool: any) => {
            const host = pool.stratumUrl;
            const port = Array.isArray(pool.stratumPorts) && pool.stratumPorts.length > 0 ? pool.stratumPorts[0] : 8002;
            const res = await fetch(`/api/check-port?host=${host}&port=${port}`);
            let latency = Infinity;
            let healthy = false;
            if (res.ok) {
              const data = await res.json();
              latency = typeof data.latency === 'number' ? data.latency : Infinity;
              healthy = !!data.healthy;
            }
            return { pool, latency, healthy };
          }));
          const healthyPools = checkPortResults.filter(r => r.healthy && typeof r.latency === 'number');
          const fastest = healthyPools.length > 0
            ? healthyPools.reduce((a, b) => (a.latency < b.latency ? a : b))
            : null;

          // ログ出力
          if (fastest) {
            console.log('[Health Check] Selected Pool:', `${fastest.pool.stratumUrl || 'N/A'}`);
            console.log('[Health Check] Global Latency:', `${fastest.latency}ms`);
          } else {
            console.log('[Health Check] Selected Pool:', 'none');
            console.log('[Health Check] Global Latency:', 'N/A');
          }


        } catch (globalError) {
          console.error('[Health Check] Global health check failed:', globalError);
        }

      } catch (error) {
        console.error('[Health Check] Local health check failed:', error);
      }
    };
    
    fetchHealth();
  }, []);

  return null; // このコンポーネントは何もレンダリングしない
};

export default GlobalHealthChecker;
