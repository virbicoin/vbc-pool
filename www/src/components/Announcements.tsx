"use client";

import { useState, useSyncExternalStore } from "react";
import {
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import poolConfig, { Announcement } from "@/lib/poolConfig";

const iconMap = {
  info: InformationCircleIcon,
  warning: ExclamationTriangleIcon,
  success: CheckCircleIcon,
  error: XCircleIcon,
};

const colorMap = {
  info: {
    bg: "bg-blue-900/30",
    border: "border-blue-700/50",
    icon: "text-blue-400",
    title: "text-blue-300",
    message: "text-blue-200",
  },
  warning: {
    bg: "bg-yellow-900/30",
    border: "border-yellow-700/50",
    icon: "text-yellow-400",
    title: "text-yellow-300",
    message: "text-yellow-200",
  },
  success: {
    bg: "bg-green-900/30",
    border: "border-green-700/50",
    icon: "text-green-400",
    title: "text-green-300",
    message: "text-green-200",
  },
  error: {
    bg: "bg-red-900/30",
    border: "border-red-700/50",
    icon: "text-red-400",
    title: "text-red-300",
    message: "text-red-200",
  },
};

// Custom hook for hydration-safe mounting
function useHasMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function Announcements() {
  const hasMounted = useHasMounted();
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const dismissed = localStorage.getItem("dismissed-announcements");
      return dismissed ? JSON.parse(dismissed) : [];
    }
    return [];
  });

  const handleDismiss = (id: string) => {
    const newDismissed = [...dismissedIds, id];
    setDismissedIds(newDismissed);
    localStorage.setItem("dismissed-announcements", JSON.stringify(newDismissed));
  };

  if (!hasMounted) return null;

  const activeAnnouncements = (poolConfig.announcements || []).filter(
    (a: Announcement) => a.enabled && !dismissedIds.includes(a.id)
  );

  if (activeAnnouncements.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {activeAnnouncements.map((announcement: Announcement) => {
        const Icon = iconMap[announcement.type];
        const colors = colorMap[announcement.type];

        return (
          <div
            key={announcement.id}
            className={`${colors.bg} border ${colors.border} rounded-lg p-4 relative`}
          >
            <button
              onClick={() => handleDismiss(announcement.id)}
              className="absolute top-3 right-3 p-1 hover:bg-gray-700/50 rounded transition-colors"
              title="Dismiss"
            >
              <XMarkIcon className="w-4 h-4 text-gray-400" />
            </button>
            <div className="flex items-start gap-3 pr-8">
              <Icon className={`w-5 h-5 ${colors.icon} flex-shrink-0 mt-0.5`} />
              <div>
                <h4 className={`font-semibold ${colors.title}`}>{announcement.title}</h4>
                <p className={`text-sm ${colors.message} mt-1`}>{announcement.message}</p>
                {announcement.link && (
                  <a
                    href={announcement.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm ${colors.title} underline hover:no-underline mt-2 inline-block`}
                  >
                    Learn more →
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
