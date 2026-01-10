"use client";
import TimeAgo from "@/components/TimeAgo";
import { formatDifficulty } from "@/lib/formatters";
import { poolConfig } from "@/lib/poolConfig";
import { CubeIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export type Block = {
  height: number;
  hash: string;
  timestamp: number;
  shares?: number;
  difficulty?: number;
  reward?: string | number;
  uncle?: boolean;
  orphan?: boolean;
};

type BlocksTableProps = {
  blocks: Block[];
  type: "matured" | "immature" | "pending";
};

function VarianceBadge({
  shares,
  difficulty,
}: {
  shares?: number | undefined;
  difficulty?: number | undefined;
}) {
  if (!shares || !difficulty) return <span className="text-gray-500">N/A</span>;

  const variance = (shares / difficulty) * 100;
  let badgeClass = "";
  let icon = null;

  if (variance <= 50) {
    badgeClass = "bg-green-600/20 text-green-400 border-green-600/50";
    icon = "🍀";
  } else if (variance <= 100) {
    badgeClass = "bg-green-900/30 text-green-300 border-green-700/50";
  } else if (variance <= 150) {
    badgeClass = "bg-yellow-900/30 text-yellow-300 border-yellow-700/50";
  } else {
    badgeClass = "bg-red-900/30 text-red-300 border-red-700/50";
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-sm font-medium ${badgeClass} border`}
    >
      {icon && <span>{icon}</span>}
      {Math.round(variance)}%
    </span>
  );
}

function RewardBadge({
  reward,
  uncle,
  orphan,
}: {
  reward?: string | number | undefined;
  uncle?: boolean | undefined;
  orphan?: boolean | undefined;
}) {
  if (orphan) return null;
  if (!reward) return <span className="text-gray-500">N/A</span>;

  const rewardAmount = Number(reward) / 1e18;
  let badgeClass = "";

  if (uncle) {
    badgeClass = "bg-gray-700/50 text-gray-300 border-gray-600/50";
  } else if (rewardAmount >= 8.0) {
    badgeClass = "bg-green-900/30 text-green-300 border-green-700/50";
  } else {
    badgeClass = "bg-blue-900/30 text-blue-300 border-blue-700/50";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium ${badgeClass} border`}
    >
      {rewardAmount.toFixed(4)} {poolConfig.coin.symbol}
    </span>
  );
}

export default function BlocksTable({ blocks, type }: BlocksTableProps) {
  if (blocks.length === 0) {
    return (
      <div className="text-center py-12">
        <CubeIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No {type} blocks found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Height
            </th>
            {type !== "pending" && (
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Block Hash
              </th>
            )}
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Time Found
            </th>
            {type === "pending" && (
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Difficulty
              </th>
            )}
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Variance
            </th>
            {type !== "pending" && (
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Reward
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700/50">
          {blocks.map((block, index) => (
            <tr
              key={`${block.height}-${block.hash || block.timestamp}`}
              className={`hover:bg-gray-700/30 transition-colors ${index % 2 === 0 ? "bg-gray-800/30" : "bg-gray-800/10"}`}
            >
              <td className="px-4 py-3">
                {poolConfig.links.explorer ? (
                  <a
                    href={`${poolConfig.links.explorer}/block/${block.height}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-mono"
                  >
                    <CubeIcon className="w-4 h-4" />
                    {block.height.toLocaleString()}
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-2 font-mono">
                    <CubeIcon className="w-4 h-4 text-gray-400" />
                    {block.height.toLocaleString()}
                  </span>
                )}
              </td>
              {type !== "pending" && (
                <td className="px-4 py-3">
                  {block.orphan ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium bg-red-900/30 text-red-300 border border-red-700/50">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      Orphan
                    </span>
                  ) : poolConfig.links.explorer ? (
                    <a
                      href={`${poolConfig.links.explorer}/block/${block.hash}`}
                      className="font-mono text-sm text-gray-400 hover:text-gray-200 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="hidden lg:inline">{block.hash}</span>
                      <span className="lg:hidden">
                        {block.hash.slice(0, 16)}...{block.hash.slice(-8)}
                      </span>
                    </a>
                  ) : (
                    <span className="font-mono text-sm text-gray-400">
                      <span className="hidden lg:inline">{block.hash}</span>
                      <span className="lg:hidden">
                        {block.hash.slice(0, 16)}...{block.hash.slice(-8)}
                      </span>
                    </span>
                  )}
                </td>
              )}
              <td className="px-4 py-3 text-gray-300">
                <TimeAgo timestamp={block.timestamp} />
              </td>
              {type === "pending" && (
                <td className="px-4 py-3 text-gray-300 font-mono text-sm">
                  {formatDifficulty(block.difficulty ?? 0)}
                </td>
              )}
              <td className="px-4 py-3">
                {block.orphan ? null : (
                  <VarianceBadge shares={block.shares} difficulty={block.difficulty} />
                )}
              </td>
              {type !== "pending" && (
                <td className="px-4 py-3">
                  <RewardBadge reward={block.reward} uncle={block.uncle} orphan={block.orphan} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
