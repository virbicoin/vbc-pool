"use client";

import { useState, useMemo } from 'react';
import useSWR from "swr";
import { formatHashrate } from "@/lib/formatters";
import TimeAgo from "@/components/TimeAgo";
import PoolHealthStatus from "@/components/PoolHealthStatus";
import {
  UserGroupIcon,
  CpuChipIcon,
  GlobeAltIcon,
  ChartBarIcon,
  CubeIcon,
  ClockIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  GiftIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

interface Stats {
  hashrate: number
  miners: number
  workers: number
  lastBlockFound: number
  networkHashrate?: number
  networkDifficulty?: number
  blockHeight?: number
  roundVariance?: number
}

interface DashboardStatsProps {
  stats: Stats
}

// ローディング状態のスケルトンコンポーネント
function DashboardStatsLoading() {
  return (
    <div>
      <div className="mb-8">
        <PoolHealthStatus />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-gray-800 rounded-lg border border-gray-700 p-6 flex items-center gap-4 min-h-[140px] h-full">
            <div className="w-8 h-8 bg-gray-600 rounded animate-pulse"></div>
            <div className="flex-1">
              <div className="h-5 bg-gray-600 rounded animate-pulse mb-2"></div>
              <div className="h-8 bg-gray-600 rounded animate-pulse w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function DashboardStats({ stats: _ }: DashboardStatsProps) {
  // NODE_ENVが'development'の場合のみ模擬データを使用
  // localhostでもproductionビルドなら実際のAPIを使用
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // 開発環境用の模擬データを定義（初回レンダリング時に固定）
  const [mockTime] = useState(() => Date.now());
  const mockData = useMemo(() => ({
    time: mockTime,
    hashrate: 8.93e9,
    networkHashrate: 1.919e10,
    minersTotal: 810,
    nodes: [{
      difficulty: 1.919e10,
      height: '114514'
    }],
    stats: {
      lastBlockFound: Math.floor((mockTime - 12000) / 1000), // 12秒前のUnixタイムスタンプ（秒）
      roundShares: 1.8e10,
      networkHashrate: 1.919e10,
      networkDifficulty: 3.64364e12, 
      height: 114514,
      roundVariance: 85.2
    }
  }), [mockTime]);
  
  const fetcher = async () => {
    if (isDevelopment) {
      // 開発環境では模擬データを返す
      return Promise.resolve(mockData);
    }
    // 本番環境では実際のAPIから取得
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://pool.digitalregion.jp';
    const response = await fetch(`${apiUrl}/api/stats`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  };
  
  // useSWRは常に呼び出す（Reactフックのルール）
  const swrResult = useSWR(
    isDevelopment ? "/api/stats" : "api-stats", // 本番環境では直接APIアクセス
    fetcher, 
    { 
      refreshInterval: isDevelopment ? 0 : 5000, // 開発環境では自動更新を無効化
      revalidateOnFocus: false,
      revalidateOnReconnect: !isDevelopment, // 開発環境では再接続時の再検証を無効化
      dedupingInterval: 2000,
      errorRetryInterval: 1000,
      errorRetryCount: isDevelopment ? 0 : 3, // 開発環境ではリトライを無効化
    }
  );

  // 開発環境では模擬データを使用
  const swr = isDevelopment ? 
    { data: mockData, isLoading: false, error: null } :
    swrResult;

  const { data, isLoading, error } = swr;

  // データが読み込み中、またはエラーがある場合
  if (isLoading || error) {
    return <DashboardStatsLoading />;
  }

  // データが存在しない場合
  if (!data) {
    return <DashboardStatsLoading />;
  }

  // 本番環境でのデータ妥当性チェック - より寛容に
  if (!isDevelopment && (!data || typeof data.hashrate !== 'number')) {
    return <DashboardStatsLoading />;
  }

  // 統計データを安全に取得 - フロントエンド側で計算
  let networkHashrate = 0;
  let networkDifficulty = 0;
  let blockHeight = 0;
  let roundVariance = 0;

  // nodesから最大のdifficultyとheightを計算
  if (data?.nodes && Array.isArray(data.nodes)) {
    data.nodes.forEach((node: { difficulty: string | number; height: string | number }) => {
      const difficulty = typeof node.difficulty === 'string' ? parseFloat(node.difficulty) : node.difficulty;
      const height = typeof node.height === 'string' ? parseInt(node.height) : node.height;
      
      if (!isNaN(difficulty) && difficulty > networkDifficulty) {
        networkDifficulty = difficulty;
      }
      if (!isNaN(height) && height > blockHeight) {
        blockHeight = height;
      }
    });
  }

  // ネットワークハッシュレートを計算
  if (networkDifficulty > 0) {
    const blockTime = 10; // Virbicoinのブロック時間（秒）
    networkHashrate = networkDifficulty / blockTime;
  }

  // roundVarianceを計算
  if (data?.stats?.roundShares && networkDifficulty > 0) {
    roundVariance = (data.stats.roundShares / networkDifficulty) * 100;
  }

  // APIから取得したデータと計算値を使用（本番環境では計算値、ローカルではAPI値を優先）
  const stats = {
    hashrate: data?.hashrate || 0,
    miners: data?.minersTotal || 0,
    workers: data?.minersTotal || 0,
    lastBlockFound: data?.stats?.lastBlockFound || 0,
    networkHashrate: data?.stats?.networkHashrate || networkHashrate,
    networkDifficulty: data?.stats?.networkDifficulty || networkDifficulty,
    blockHeight: data?.stats?.height || blockHeight,
    roundVariance: data?.stats?.roundVariance || roundVariance,
  };

  return (
    <div>
      <div className="mb-8">
        <PoolHealthStatus />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 flex items-center gap-4 min-h-[140px] h-full transition-all duration-300 hover:shadow-lg hover:bg-gray-700/80 hover:border-gray-600">
        <UserGroupIcon className="w-8 h-8 text-blue-400" />
        <div>
          <h3 className="text-lg font-semibold text-gray-300 mb-1">Miners Online</h3>
          <p className="text-2xl font-bold text-blue-500">{stats.miners} Miners</p>
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 flex items-center gap-4 min-h-[140px] h-full transition-all duration-300 hover:shadow-lg hover:bg-gray-700/80 hover:border-gray-600">
        <CpuChipIcon className="w-8 h-8 text-green-400" />
        <div>
          <h3 className="text-lg font-semibold text-gray-300 mb-1">Pool Hashrate</h3>
          <p className="text-2xl font-bold text-blue-500">{formatHashrate(stats.hashrate)}</p>
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 flex items-center gap-4 min-h-[140px] h-full transition-all duration-300 hover:shadow-lg hover:bg-gray-700/80 hover:border-gray-600">
        <GlobeAltIcon className="w-8 h-8 text-yellow-400" />
        <div>
          <h3 className="text-lg font-semibold text-gray-300 mb-1">Network Hashrate</h3>
          <p className="text-2xl font-bold text-blue-500">
            {stats.networkHashrate > 0 ? formatHashrate(stats.networkHashrate) : 'Loading...'}
          </p>
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 flex items-center gap-4 min-h-[140px] h-full transition-all duration-300 hover:shadow-lg hover:bg-gray-700/80 hover:border-gray-600">
        <ChartBarIcon className="w-8 h-8 text-pink-400" />
        <div>
          <h3 className="text-lg font-semibold text-gray-300 mb-1">Network Difficulty</h3>
          <p className="text-2xl font-bold text-blue-500">
            {stats.networkDifficulty > 0 ? `${(stats.networkDifficulty / 1e9).toFixed(2)} GH` : 'Loading...'}
          </p>
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 flex items-center gap-4 min-h-[140px] h-full transition-all duration-300 hover:shadow-lg hover:bg-gray-700/80 hover:border-gray-600">
        <CubeIcon className="w-8 h-8 text-orange-400" />
        <div>
          <h3 className="text-lg font-semibold text-gray-300 mb-1">Blockchain Height</h3>
          <p className="text-2xl font-bold text-blue-500">{stats.blockHeight > 0 ? stats.blockHeight.toLocaleString() : '0'} Blocks</p>
          <span className="text-sm text-gray-400 block mt-1">Best viewed in a <a href={`https://explorer.digitalregion.jp/block/${stats.blockHeight}`} target="_blank" rel="noopener noreferrer">block explorer</a></span>
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 flex items-center gap-4 min-h-[140px] h-full transition-all duration-300 hover:shadow-lg hover:bg-gray-700/80 hover:border-gray-600">
        <ClockIcon className="w-8 h-8 text-cyan-400" />
        <div>
          <h3 className="text-lg font-semibold text-gray-300 mb-1">Last Block Found</h3>
          <p className="text-2xl font-bold text-blue-500">
            {stats.lastBlockFound ? (
              <TimeAgo timestamp={stats.lastBlockFound} agoOnly={true} />
            ) : (
              'Never'
            )}
          </p>
          {stats.lastBlockFound ? (
            <span className="text-sm text-gray-400 block mt-1">
                {new Date(stats.lastBlockFound * 1000).toLocaleString(undefined, { timeZoneName: 'short' })}
            </span>
          ) : null}
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 flex items-center gap-4 min-h-[140px] h-full transition-all duration-300 hover:shadow-lg hover:bg-gray-700/80 hover:border-gray-600">
        <AdjustmentsHorizontalIcon className="w-8 h-8 text-purple-400" />
        <div>
          <h3 className="text-lg font-semibold text-gray-300 mb-1">Round Variance</h3>
          <p className="text-2xl font-bold text-blue-500">
            {stats.roundVariance ? `${stats.roundVariance.toFixed(2)}%` : '0%'}
          </p>
          <span className="text-sm text-gray-400 block mt-1">Lower is better</span>
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 flex items-center gap-4 min-h-[140px] h-full transition-all duration-300 hover:shadow-lg hover:bg-gray-700/80 hover:border-gray-600">
        <ArrowPathIcon className="w-8 h-8 text-blue-400" />
        <div>
          <h3 className="text-lg font-semibold text-gray-300 mb-1">Payouts</h3>
          <p className="text-2xl font-bold text-blue-500">Every 2 hours</p>
          <span className="text-sm text-gray-400 block mt-1">Automatic payouts to your wallet</span>
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 flex items-center gap-4 min-h-[140px] h-full transition-all duration-300 hover:shadow-lg hover:bg-gray-700/80 hover:border-gray-600">
        <CurrencyDollarIcon className="w-8 h-8 text-green-400" />
        <div>
          <h3 className="text-lg font-semibold text-gray-300 mb-1">Pool Fee</h3>
          <p className="text-2xl font-bold text-blue-500">1.0%</p>
            <span className="text-sm text-gray-400 block mt-1">Low fee</span>
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 flex items-center gap-4 min-h-[140px] h-full transition-all duration-300 hover:shadow-lg hover:bg-gray-700/80 hover:border-gray-600">
        <CreditCardIcon className="w-8 h-8 text-yellow-400" />
        <div>
          <h3 className="text-lg font-semibold text-gray-300 mb-1">Minimum Payout</h3>
          <p className="text-2xl font-bold text-blue-500">0.1 VBC</p>
          <span className="text-sm text-gray-400 block mt-1">Low threshold for payouts</span>
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 flex items-center gap-4 min-h-[140px] h-full transition-all duration-300 hover:shadow-lg hover:bg-gray-700/80 hover:border-gray-600">
        <GiftIcon className="w-8 h-8 text-pink-400" />
        <div>
          <h3 className="text-lg font-semibold text-gray-300 mb-1">Block Reward</h3>
          <p className="text-2xl font-bold text-blue-500">8 VBC</p>
            <span className="text-sm text-gray-400 block mt-1">Unlimited supply</span>
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 flex items-center gap-4 min-h-[140px] h-full transition-all duration-300 hover:shadow-lg hover:bg-gray-700/80 hover:border-gray-600">
        <BanknotesIcon className="w-8 h-8 text-cyan-400" />
        <div>
          <h3 className="text-lg font-semibold text-gray-300 mb-1">Payment Method</h3>
          <p className="text-2xl font-bold text-blue-500">PROP</p>
          <span className="text-sm text-gray-400 block mt-1">Stable and profitable pool with regular payouts</span>        </div>
      </div>
    </div>
    </div>
  )
}
