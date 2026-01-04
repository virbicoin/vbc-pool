"use client";
import useSWR from "swr";
import BlocksTable from "@/components/BlocksTable";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function BlocksPage() {
  const { data: blocksData = {}, isLoading } = useSWR(API_BASE_URL + "/api/blocks", fetcher, {
    refreshInterval: 5000,
  });
  const maturedBlocks = blocksData.matured || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div>
      {maturedBlocks.length > 0 ? (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircleIcon className="w-5 h-5 text-blue-400" />
            <h4 className="text-lg font-semibold text-gray-100">
              Matured Blocks
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({maturedBlocks.length.toLocaleString()} blocks)
              </span>
            </h4>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            These blocks have been confirmed and rewards have been distributed to miners.
          </p>
          <BlocksTable blocks={maturedBlocks} type="matured" />
        </div>
      ) : (
        <div className="text-center py-12">
          <CheckCircleIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No Matured Blocks Yet</h3>
          <p className="text-gray-500">
            Blocks will appear here once they have been confirmed by the network.
          </p>
        </div>
      )}
    </div>
  );
}
