"use client";

import useSWR from "swr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import { CheckCircleIcon, ClockIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "@/components/I18nProvider";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function BlocksTabs() {
  const { t } = useTranslation();
  const { data: stats } = useSWR(API_BASE_URL + "/api/stats", fetcher, { refreshInterval: 5000 });
  const maturedCount = stats?.maturedTotal ?? 0;
  const immatureCount = stats?.immatureTotal ?? 0;
  const pendingCount = stats?.candidatesTotal ?? 0;

  const path = usePathname();

  const tabs = [
    {
      href: "/blocks",
      label: t("blocks.mature"),
      count: maturedCount,
      icon: CheckCircleIcon,
      activeColor: "blue",
      isActive: path === "/blocks",
    },
    {
      href: "/blocks/immature",
      label: t("blocks.immature"),
      count: immatureCount,
      icon: ClockIcon,
      activeColor: "green",
      isActive: path === "/blocks/immature",
    },
    {
      href: "/blocks/pending",
      label: t("blocks.pending"),
      count: pendingCount,
      icon: SparklesIcon,
      activeColor: "cyan",
      isActive: path === "/blocks/pending",
    },
  ];

  const getTabClasses = (tab: (typeof tabs)[0]) => {
    const baseClasses =
      "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors";

    if (tab.isActive) {
      switch (tab.activeColor) {
        case "blue":
          return `${baseClasses} border-blue-400 text-blue-400 bg-blue-900/20`;
        case "green":
          return `${baseClasses} border-green-400 text-green-400 bg-green-900/20`;
        case "cyan":
          return `${baseClasses} border-cyan-400 text-cyan-400 bg-cyan-900/20`;
        default:
          return `${baseClasses} border-blue-400 text-blue-400 bg-blue-900/20`;
      }
    }

    return `${baseClasses} border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700/50`;
  };

  const getBadgeClasses = (tab: (typeof tabs)[0]) => {
    if (tab.isActive) {
      switch (tab.activeColor) {
        case "blue":
          return "bg-blue-600 text-white";
        case "green":
          return "bg-green-600 text-white";
        case "cyan":
          return "bg-cyan-600 text-white";
        default:
          return "bg-blue-600 text-white";
      }
    }
    return "bg-gray-700 text-gray-300";
  };

  return (
    <div className="flex">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Link key={tab.href} href={tab.href} className={getTabClasses(tab)}>
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span
                className={`ml-1 px-2 py-0.5 text-xs font-semibold rounded-full ${getBadgeClasses(tab)}`}
              >
                {tab.count.toLocaleString()}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
