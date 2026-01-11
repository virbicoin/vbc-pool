"use client";
import useSWR from "swr";
import { API_BASE_URL } from "@/lib/api";
import BlocksTable from "@/components/BlocksTable";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "@/components/I18nProvider";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function BlocksPage() {
  const { t } = useTranslation();
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
              {t("blocks.mature")}
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({maturedBlocks.length.toLocaleString()} {t("nav.blocks").toLowerCase()})
              </span>
            </h4>
          </div>
          <BlocksTable blocks={maturedBlocks} type="matured" />
        </div>
      ) : (
        <div className="text-center py-12">
          <CheckCircleIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">{t("common.noData")}</h3>
        </div>
      )}
    </div>
  );
}
