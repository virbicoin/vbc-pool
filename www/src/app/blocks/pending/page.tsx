"use client";
import useSWR from "swr";
import { API_BASE_URL } from "@/lib/api";
import BlocksTable from "@/components/BlocksTable";
import { SparklesIcon } from "@heroicons/react/24/outline";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PendingBlocksPage() {
  const { data: blocksData = {}, isLoading } = useSWR(API_BASE_URL + "/api/blocks", fetcher, {
    refreshInterval: 5000,
  });
  const pendingBlocks = blocksData.candidates || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div>
      {pendingBlocks.length > 0 ? (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <SparklesIcon className="w-5 h-5 text-cyan-400" />
            <h4 className="text-lg font-semibold text-gray-100">
              Pending Blocks
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({pendingBlocks.length.toLocaleString()} blocks)
              </span>
            </h4>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            These blocks have been found but are waiting to be included in the blockchain.
          </p>
          <BlocksTable blocks={pendingBlocks} type="pending" />
        </div>
      ) : (
        <div className="text-center py-12">
          <SparklesIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No Pending Blocks</h3>
          <p className="text-gray-500">
            New blocks will appear here when they are found by the pool.
          </p>
        </div>
      )}
    </div>
  );
}
