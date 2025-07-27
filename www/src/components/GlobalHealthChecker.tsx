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
        // ブラウザのロケールとタイムゾーンを取得
        const locale = typeof window !== 'undefined' ? navigator.language : 'en-US';
        const timeZone = typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC';
        
        // Local health check (latency measurement)
        const localStartTime = Date.now();
        const localRes = await fetch('/health');
        const localEndTime = Date.now();
        const localLatency = localEndTime - localStartTime;
        
        const localData = await localRes.json();
        console.log('[Health Check] Local Health:', localData.status);
        console.log('[Health Check] Local Hostname:', localData.hostname);
        console.log('[Health Check] Local Latency:', `${localLatency}ms`);
        
        // 日時をブラウザロケール・タイムゾーンで表示
        const healthTime = new Date(localData.time);
        const formattedHealthTime = new Intl.DateTimeFormat(locale, {
          dateStyle: 'short',
          timeStyle: 'long',
          timeZone,
        }).format(healthTime);
        console.log('[Health Check] Local Time:', formattedHealthTime);

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
          };
          
          // 最速のhealthyプールを選択
          const healthyPools = poolResults.filter((pool: PoolResult) => pool.status === 'healthy');
          const fastestPool = healthyPools.length > 0 
            ? healthyPools.reduce((fastest: PoolResult, current: PoolResult) => 
                current.latency < fastest.latency ? current : fastest
              )
            : null;

          // 全体のステータスを決定（1つでもhealthyならhealthy）
          const overallStatus = healthyPools.length > 0 ? 'healthy' : 'unhealthy';

          console.log('[Health Check] Global Health (Fastest):', overallStatus);
          console.log('[Health Check] Selected Pool:', fastestPool?.pool || 'none');
          console.log('[Health Check] Global Latency:', fastestPool?.latency || 'N/A');

          // 全プールの結果をログ出力
          poolResults.forEach((pool: PoolResult) => {
            console.log(`[Health Check] ${pool.pool}: ${pool.status} (${pool.latency}ms)${pool.error ? ` - ${pool.error}` : ''}`);
          });

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
