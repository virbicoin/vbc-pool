"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import useSWR from "swr";
import { BellIcon, BellSlashIcon } from "@heroicons/react/24/outline";
import { BellAlertIcon } from "@heroicons/react/24/solid";
import { poolConfig } from "@/lib/poolConfig";
import { API_BASE_URL } from "@/lib/api";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function BlockNotification() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>("default");
  const [recentBlock, setRecentBlock] = useState<number | null>(null);
  const lastBlockRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch stats to check for new blocks
  const { data: statsData } = useSWR(
    notificationsEnabled ? API_BASE_URL + "/api/stats" : null,
    fetcher,
    { refreshInterval: 10000 } // Check every 10 seconds
  );

  // Initialize notification state
  useEffect(() => {
    // Check if notifications are supported
    if (!("Notification" in window)) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- Initialization from browser API is intentional
    setPermissionStatus(Notification.permission);

    // Load saved preference
    const saved = localStorage.getItem(poolConfig.storage.notificationsEnabled);
    if (saved === "true" && Notification.permission === "granted") {
      setNotificationsEnabled(true);
    }

    // Load last known block height
    const lastBlock = localStorage.getItem(poolConfig.storage.lastBlockHeight);
    if (lastBlock) {
      lastBlockRef.current = parseInt(lastBlock, 10);
    }

    // Create audio element for notification sound
    audioRef.current = new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQUbas3k4oBLIz1wqNDmkFAWH1CLz+elXw0LM3eXxOGnYhINIVuMyOGtYhYQHFeJxeGudBYMIUuCxN+2cRUQHlh+wt67cxIRHFZ/wOC8dBYQG1N9v9+8dxQQG1F6v969eRQQHE95v967fBMRHE55vt+7fRMRHU55vd+8fhMRHE55vN67fxMRHU95vN68fxMRHU95u968fxMRHU55u968gBMRHU95ut68gBMRHU95ut28gBMRHU95ut28gRMRHE55ut28gRMRHE55ut28gRMRHU95ut28gRMRHU95ut28gRMRHU95ut28gRMRHU95ut28gBMRHU55ut68gBMRHU55ut68fxMRHU55u968fxMRHU55vN68fxMRHU95vN+8fhMRHE55vd+7fRMRHU55vt+7fBMRHU95v9+7fBMRHE96v966exISG1F7v969eRQQG1N9v9+8dxQQHFZ/wOC8dBYQG1h+wt67cxIRHEuCxN+2cRUQH1iJxeGudBYMHVeMyOGtYhYQIFuLz+elXw0LNXiXxOGnYhINH1CLzueleQUbatDk4oBLIj5wodDbq2EcBjya3televisQPVkZFmYSBgAAAAA=="
    );
  }, []);

  // Show block notification function
  const showBlockNotification = useCallback((blockHeight: number) => {
    if (Notification.permission !== "granted") return;

    // Play sound
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Ignore audio play errors (e.g., user hasn't interacted with page)
      });
    }

    // Show notification
    const notification = new Notification("🎉 New Block Found!", {
      body: `${poolConfig.pool.name} found block #${blockHeight.toLocaleString()}`,
      icon: poolConfig.branding.logo,
      tag: "block-found",
      requireInteraction: false,
    });

    // Close after 10 seconds
    setTimeout(() => notification.close(), 10000);

    // Handle click
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }, []);

  // Check for new blocks
  useEffect(() => {
    if (!notificationsEnabled || !statsData) return;

    const currentBlockHeight = statsData.stats?.height || statsData.nodes?.[0]?.height;
    if (!currentBlockHeight) return;

    const currentHeight =
      typeof currentBlockHeight === "string"
        ? parseInt(currentBlockHeight, 10)
        : currentBlockHeight;

    // Initialize last block if not set
    if (lastBlockRef.current === null) {
      lastBlockRef.current = currentHeight;
      localStorage.setItem(poolConfig.storage.lastBlockHeight, currentHeight.toString());
      return;
    }

    // Check if a new block was found by the pool
    const lastBlockFound = statsData.stats?.lastBlockFound;
    if (lastBlockFound && lastBlockFound > (lastBlockRef.current || 0)) {
      // New block found!
      showBlockNotification(currentHeight);
      setRecentBlock(currentHeight);
      lastBlockRef.current = currentHeight;
      localStorage.setItem(poolConfig.storage.lastBlockHeight, currentHeight.toString());

      // Clear recent block indicator after 30 seconds
      setTimeout(() => setRecentBlock(null), 30000);
    }
  }, [statsData, notificationsEnabled, showBlockNotification]);

  const toggleNotifications = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support notifications");
      return;
    }

    if (notificationsEnabled) {
      // Disable notifications
      setNotificationsEnabled(false);
      localStorage.setItem(poolConfig.storage.notificationsEnabled, "false");
      return;
    }

    // Request permission if needed
    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission !== "granted") {
        return;
      }
    }

    if (Notification.permission === "granted") {
      setNotificationsEnabled(true);
      localStorage.setItem(poolConfig.storage.notificationsEnabled, "true");

      // Show test notification
      new Notification("Notifications Enabled", {
        body: "You will be notified when the pool finds a new block",
        icon: poolConfig.branding.logo,
      });
    }
  };

  // Don't render if notifications aren't supported
  if (typeof window !== "undefined" && !("Notification" in window)) {
    return null;
  }

  return (
    <button
      onClick={toggleNotifications}
      className={`relative p-2 rounded-lg transition-all ${
        notificationsEnabled
          ? "bg-green-600/20 text-green-400 hover:bg-green-600/30"
          : "bg-gray-700 text-gray-400 hover:bg-gray-600"
      }`}
      title={
        permissionStatus === "denied"
          ? "Notifications blocked by browser"
          : notificationsEnabled
            ? "Block notifications enabled"
            : "Enable block notifications"
      }
      disabled={permissionStatus === "denied"}
    >
      {notificationsEnabled ? (
        recentBlock ? (
          <BellAlertIcon className="w-5 h-5 animate-bounce" />
        ) : (
          <BellIcon className="w-5 h-5" />
        )
      ) : (
        <BellSlashIcon className="w-5 h-5" />
      )}

      {/* Notification indicator */}
      {notificationsEnabled && (
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full" />
      )}

      {/* Recent block pulse */}
      {recentBlock && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
      )}
    </button>
  );
}
