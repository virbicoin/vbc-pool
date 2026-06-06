"use client";

import { useMemo } from "react";
import { ChartPieIcon } from "@heroicons/react/24/outline";
import poolConfig from "@/lib/poolConfig";

interface ShareEstimatorProps {
  accountRoundShares: number;
  poolRoundShares: number;
  className?: string;
}

export default function ShareEstimator({
  accountRoundShares,
  poolRoundShares,
  className = "",
}: ShareEstimatorProps) {
  const estimation = useMemo(() => {
    if (poolRoundShares <= 0 || accountRoundShares <= 0) {
      return {
        percentage: 0,
        estimatedReward: 0,
        afterFee: 0,
      };
    }

    const percentage = (accountRoundShares / poolRoundShares) * 100;
    const estimatedReward = (accountRoundShares / poolRoundShares) * poolConfig.block.reward;
    const afterFee = estimatedReward * (1 - poolConfig.pool.fee / 100);

    return {
      percentage,
      estimatedReward,
      afterFee,
    };
  }, [accountRoundShares, poolRoundShares]);

  if (poolRoundShares <= 0) {
    return null;
  }

  return (
    <div
      className={`bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-700/30 p-4 ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <ChartPieIcon className="w-5 h-5 text-purple-400" />
        <h4 className="text-sm font-semibold text-gray-200">Current Round Estimation</h4>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-gray-400 mb-1">Your Share</p>
          <p className="text-lg font-bold text-purple-400">{estimation.percentage.toFixed(4)}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Est. Reward</p>
          <p className="text-lg font-bold text-blue-400">{estimation.estimatedReward.toFixed(6)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">After Fee ({poolConfig.pool.fee}%)</p>
          <p className="text-lg font-bold text-green-400">
            {estimation.afterFee.toFixed(6)} {poolConfig.coin.symbol}
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3 text-center">
        * Estimated reward if current round finds a block. Actual rewards depend on luck variance.
      </p>
    </div>
  );
}
