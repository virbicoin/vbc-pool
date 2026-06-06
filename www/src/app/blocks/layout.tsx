"use client";

import BlocksTabs from "@/components/BlocksTabs";
import BlocksStats from "@/components/BlocksStats";
import { CubeIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "@/components/I18nProvider";

export default function BlocksLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <div>
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <CubeIcon className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-100">{t("blocks.title")}</h1>
              <p className="text-gray-400 text-sm mt-1">{t("home.recentBlocks")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Block Stats Banner */}
        <BlocksStats />

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
