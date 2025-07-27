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
            apiUrl?: string; // 追加
            id?: string; // 追加
          };
          
          // /healthエンドポイントのHTTPレイテンシ（直接fetch）で各プールを計測
          const healthyPoolsWithLatency = await Promise.all(
            poolResults.filter((pool: PoolResult) => pool.status === 'healthy' && pool.pool !== 'global')
              .map(async (pool: PoolResult) => {
                let latency = Infinity;
                try {
                  const start = Date.now();
                  const res = await fetch(`${pool.apiUrl}/health`);
                  await res.text(); // 内容不要でも待つ
                  latency = Date.now() - start;
                } catch {}
                return { ...pool, latency };
              })
          );
          const fastest = healthyPoolsWithLatency.length > 0
            ? healthyPoolsWithLatency.reduce((a: PoolResult, b: PoolResult) => (typeof a.latency === 'number' && typeof b.latency === 'number' && a.latency < b.latency) ? a : b)
            : null;

          // ログ出力
          if (fastest) {
            console.log('[Health Check] Selected Pool:', `${fastest.stratumUrl || fastest.pool || fastest.id || fastest.apiUrl || 'N/A'}`);
            console.log('[Health Check] Global Latency:', typeof fastest.latency === 'number' ? `${fastest.latency}ms` : 'N/A');
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
