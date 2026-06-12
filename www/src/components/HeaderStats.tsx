"use client";

import Link from "next/link";
import useSWR from "swr";
import { API_BASE_URL } from "@/lib/api";
import { CubeIcon, UsersIcon } from "@heroicons/react/24/outline";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  badge?: number;
  badgeColor?: string;
}

const NavLink = ({ href, children, badge, badgeColor = "bg-green-500" }: NavLinkProps) => {
  const isActive = typeof window !== "undefined" && window.location.pathname === href;
  return (
    <Link
      href={href}
      className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
        ${
          isActive
            ? "text-text-primary nav-link text-gray-200"
            : "text-text-secondary nav-link text-gray-200 hover:text-text-primary"
        }`}
    >
      {children}
      {badge && badge > 0 && (
        <span
          className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full text-white ${badgeColor}`}
        >
          {badge}
        </span>
      )}
    </Link>
  );
};

const HeaderStats = () => {
  const { data: stats } = useSWR(API_BASE_URL + "/api/stats", fetcher, { refreshInterval: 5000 });
  const immatureCount = stats?.immatureTotal ?? 0;
  const pendingCount = stats?.candidatesTotal ?? 0;
  const minersTotal = stats?.minersTotal ?? 0;
  const poolBlocksBadge = immatureCount + pendingCount;

  return (
    <div className="flex items-center space-x-2">
      <NavLink href="/blocks" badge={poolBlocksBadge > 0 ? poolBlocksBadge : undefined} badgeColor="bg-green-600">
        <CubeIcon className="w-5 h-5 mr-1" />
        Blocks
      </NavLink>
      <NavLink href="/miners" badge={minersTotal > 0 ? minersTotal : undefined} badgeColor="bg-blue-500">
        <UsersIcon className="w-5 h-5 mr-1" />
        Miners
      </NavLink>
    </div>
  );
};

export default HeaderStats;
