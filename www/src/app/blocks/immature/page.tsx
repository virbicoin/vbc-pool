"use client";
import useSWR from "swr";
import { API_BASE_URL } from "@/lib/api";
import BlocksTable from "@/components/BlocksTable";
import { ClockIcon } from "@heroicons/react/24/outline";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ImmatureBlocksPage() {
  const { data = {}, isLoading } = useSWR(API_BASE_URL + "/api/blocks", fetcher, {
    refreshInterval: 5000,
  });
  const immatureBlocks = data.immature || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
      </div>
    );
  }

  return (
    <div>
      {immatureBlocks.length > 0 ? (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ClockIcon className="w-5 h-5 text-green-400" />
            <h4 className="text-lg font-semibold text-gray-100">
              Immature Blocks
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({immatureBlocks.length.toLocaleString()} blocks)
              </span>
            </h4>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            These blocks are waiting for network confirmations. Rewards will be distributed once
            they mature.
          </p>
          <BlocksTable blocks={immatureBlocks} type="immature" />
        </div>
      ) : (
        <div className="text-center py-12">
          <ClockIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No Immature Blocks</h3>
          <p className="text-gray-500">
            All found blocks have been confirmed or are still pending.
          </p>
        </div>
      )}
    </div>
  );
}
