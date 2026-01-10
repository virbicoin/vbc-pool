"use client";

import { useState, useEffect, useMemo, useSyncExternalStore } from "react";
import {
  BellIcon,
  BellAlertIcon,
  BellSlashIcon,
  CheckIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: "block" | "payment" | "alert" | "info";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  link?: string;
}

const STORAGE_KEY = "notifications";
const MAX_NOTIFICATIONS = 50;

// Storage helpers
function getStoredNotifications(): Notification[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setStoredNotifications(notifications: Notification[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS)));
  } catch {}
}

// For useSyncExternalStore
const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener("notificationUpdate", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("notificationUpdate", callback);
  };
};

const getSnapshot = () => {
  return localStorage.getItem(STORAGE_KEY) || "[]";
};

const getServerSnapshot = () => "[]";

// Helper to add notification from anywhere
export function addNotification(notification: Omit<Notification, "id" | "timestamp" | "read">) {
  const newNotification: Notification = {
    ...notification,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    timestamp: Date.now(),
    read: false,
  };

  const current = getStoredNotifications();
  setStoredNotifications([newNotification, ...current]);

  // Dispatch custom event to trigger re-render
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("notificationUpdate"));
  }

  // Show browser notification if permitted
  if (
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "granted"
  ) {
    new Notification(notification.title, {
      body: notification.message,
      icon: "/favicon.ico",
    });
  }

  return newNotification;
}

export default function NotificationCenter({ className = "" }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const storedStr = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const notifications = useMemo(() => {
    try {
      return JSON.parse(storedStr) as Notification[];
    } catch {
      return [];
    }
  }, [storedStr]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setStoredNotifications(updated);
    window.dispatchEvent(new Event("notificationUpdate"));
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setStoredNotifications(updated);
    window.dispatchEvent(new Event("notificationUpdate"));
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setStoredNotifications(updated);
    window.dispatchEvent(new Event("notificationUpdate"));
  };

  const clearAll = () => {
    setStoredNotifications([]);
    window.dispatchEvent(new Event("notificationUpdate"));
  };

  const getTypeStyles = (type: Notification["type"]) => {
    switch (type) {
      case "block":
        return "border-l-green-500 bg-green-900/10";
      case "payment":
        return "border-l-blue-500 bg-blue-900/10";
      case "alert":
        return "border-l-red-500 bg-red-900/10";
      default:
        return "border-l-gray-500 bg-gray-800";
    }
  };

  // Request notification permission
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      // Don't auto-request, will be requested on user action
    }
  }, []);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-700 transition-colors"
      >
        {unreadCount > 0 ? (
          <BellAlertIcon className="w-6 h-6 text-yellow-400" />
        ) : (
          <BellIcon className="w-6 h-6 text-gray-400" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-gray-800 rounded-lg border border-gray-700 shadow-xl z-50 max-h-[70vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="font-semibold text-gray-100">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Mark all read
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <BellSlashIcon className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700/50">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-l-4 ${getTypeStyles(notification.type)} ${
                        !notification.read ? "bg-opacity-100" : "bg-opacity-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {notification.link ? (
                            <a
                              href={notification.link}
                              className="font-medium text-gray-200 hover:text-white block truncate"
                              onClick={() => markAsRead(notification.id)}
                            >
                              {notification.title}
                            </a>
                          ) : (
                            <p className="font-medium text-gray-200 truncate">
                              {notification.title}
                            </p>
                          )}
                          <p className="text-sm text-gray-400 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 text-gray-400 hover:text-green-400"
                              title="Mark as read"
                            >
                              <CheckIcon className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 text-gray-400 hover:text-red-400"
                            title="Delete"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-700">
                <button
                  onClick={clearAll}
                  className="w-full text-sm text-red-400 hover:text-red-300"
                >
                  Clear all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
