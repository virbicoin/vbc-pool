"use client";
import TimeAgo from "@/components/TimeAgo";
import { formatDifficulty } from "@/lib/formatters";

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

export default function BlocksTable({ blocks, type }: BlocksTableProps) {
    return (
        <div className="overflow-x-auto rounded-lg border border-gray-700">
            <table className="w-full">
                <thead className="bg-gray-900">
                    <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Height</th>
                        {type !== "pending" && <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Block Hash</th>}
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Time Found</th>
                        {type === "matured" && <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Variance</th>}
                        {type === "pending" && <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Difficulty</th>}
                        {type === "pending" && <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Variance</th>}
                        {type !== "pending" && <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Reward</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700 bg-gray-800">
                    {blocks.map((block) => (
                        <tr 
                            key={`${block.height}-${block.hash || block.timestamp}`} 
                            className="hover:bg-gray-800 transition-colors duration-150"
                        >
                            <td className="px-4 py-3 text-gray-200">
                                <a 
                                    href={`https://explorer.digitalregion.jp/block/${block.height}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    {block.height}
                                </a>
                            </td>
                            {type !== "pending" && (
                                <td className="px-4 py-3 font-mono text-sm text-gray-300">
                                    {(type === "immature" || type === "matured") && block.orphan ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-red-900 text-red-200 border border-red-700">
                                            Orphan
                                        </span>
                                    ) : (
                                        <a 
                                            href={`https://explorer.digitalregion.jp/block/${block.hash}`} 
                                            className="text-gray-400 hover:text-gray-200 transition-colors break-all"
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                        >
                                            {block.hash}
                                        </a>
                                    )}
                                </td>
                            )}
                            <td className="px-4 py-3 text-gray-300"><TimeAgo timestamp={block.timestamp} /></td>
                            {type === "matured" && (
                                <td className="px-4 py-3">
                                    {block.orphan ? '' : (
                                        (() => {
                                            if (block.shares && block.difficulty) {
                                                const variance = (block.shares / block.difficulty) * 100;
                                                const variantClass = variance <= 100 
                                                    ? 'bg-green-900 text-green-200 border-green-700' 
                                                    : 'bg-blue-900 text-blue-200 border-blue-700';
                                                return (
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${variantClass} border`}>
                                                        {Math.round(variance)}%
                                                    </span>
                                                );
                                            }
                                            return 'N/A';
                                        })()
                                    )}
                                </td>
                            )}
                            {type === "pending" && (
                                <>
                                    <td className="px-4 py-3 text-gray-300">{formatDifficulty(block.difficulty ?? 0)}</td>
                                    <td className="px-4 py-3">
                                        {(() => {
                                            if (block.shares && block.difficulty) {
                                                const variance = (block.shares / block.difficulty) * 100;
                                                const variantClass = variance <= 100 
                                                    ? 'bg-green-900 text-green-200 border-green-700' 
                                                    : 'bg-blue-900 text-blue-200 border-blue-700';
                                                return (
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${variantClass} border`}>
                                                        {Math.round(variance)}%
                                                    </span>
                                                );
                                            }
                                            return 'N/A';
                                        })()}
                                    </td>
                                </>
                            )}
                            {type !== "pending" && (
                                <td className="px-4 py-3">
                                    {(type === "immature" || type === "matured") && block.orphan ? '' : (
                                        block.reward ? (
                                            (() => {
                                                const rewardAmount = Number(block.reward) / 1e18;
                                                const isStandardReward = rewardAmount >= 8.0;
                                                let badgeClass = '';
                                                
                                                if (block.uncle) {
                                                    badgeClass = 'bg-gray-700 text-gray-200 border-gray-600';
                                                } else if (isStandardReward) {
                                                    badgeClass = 'bg-green-900 text-green-200 border-green-700';
                                                } else {
                                                    badgeClass = 'bg-blue-900 text-blue-200 border-blue-700';
                                                }
                                                
                                                return (
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${badgeClass} border`}>
                                                        {rewardAmount.toFixed(4)} VBC
                                                    </span>
                                                );
                                            })()
                                        ) : 'N/A'
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}