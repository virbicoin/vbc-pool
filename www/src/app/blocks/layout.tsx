import { getStats } from "@/lib/api";
import BlocksTabs from "@/components/BlocksTabs";
import BlocksStats from "@/components/BlocksStats";
import { CubeIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

export default async function BlocksLayout({ children }: { children: React.ReactNode }) {
  const stats = await getStats();

  return (
    <div>
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <CubeIcon className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-100">Pool Blocks</h1>
              <p className="text-gray-400 text-sm mt-1">View all blocks found by the pool</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Block Stats Banner */}
        <BlocksStats stats={stats} />

        {/* Info Banner */}
        <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
          <div className="flex items-start gap-3">
            <InformationCircleIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p className="mb-1">
                <strong className="text-blue-400">Full block rewards</strong>, including TX fees and
                uncle rewards, are always paid out to miners.
              </p>
              <p className="text-gray-400">
                Blocks go through three stages: <span className="text-cyan-400">Pending</span> →{" "}
                <span className="text-green-400">Immature</span> →{" "}
                <span className="text-blue-400">Matured</span>. Rewards are distributed once blocks
                reach matured status.
              </p>
            </div>
          </div>
        </div>

        {/* Blocks Card */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="border-b border-gray-700">
            <BlocksTabs />
          </div>
          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
