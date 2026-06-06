"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { ArrowPathIcon, ClockIcon, PlayIcon, PauseIcon } from "@heroicons/react/24/outline";

interface AutoRefreshSettingsProps {
  onRefresh: () => void;
  className?: string;
}

const STORAGE_KEY = "autoRefreshSettings";

interface RefreshSettings {
  enabled: boolean;
  interval: number;
}

const getDefaultSettings = (): RefreshSettings => ({
  enabled: true,
  interval: 10,
});

function setStoredSettings(settings: RefreshSettings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event("autoRefreshSettingsChange"));
  } catch {}
}

const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener("autoRefreshSettingsChange", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("autoRefreshSettingsChange", callback);
  };
};

const getSnapshot = (): string => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored || JSON.stringify(getDefaultSettings());
};

const getServerSnapshot = (): string => JSON.stringify(getDefaultSettings());

export default function AutoRefreshSettings({
  onRefresh,
  className = "",
}: AutoRefreshSettingsProps) {
  const storedStr = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const settings: RefreshSettings = JSON.parse(storedStr);
  const [countdown, setCountdown] = useState(settings.interval);
  const [isOpen, setIsOpen] = useState(false);

  // Update settings and persist
  const updateSettings = useCallback((newSettings: Partial<RefreshSettings>) => {
    const current: RefreshSettings = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || JSON.stringify(getDefaultSettings())
    );
    const updated = { ...current, ...newSettings };
    setStoredSettings(updated);
    if (newSettings.interval !== undefined) {
      setCountdown(newSettings.interval);
    }
  }, []);

  // Countdown and auto-refresh logic
  useEffect(() => {
    if (!settings.enabled) {
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onRefresh();
          return settings.interval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [settings.enabled, settings.interval, onRefresh]);

  const intervalOptions = [5, 10, 15, 30, 60];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
          settings.enabled
            ? "bg-green-900/30 text-green-400 hover:bg-green-900/50"
            : "bg-gray-700 text-gray-400 hover:bg-gray-600"
        }`}
      >
        <ArrowPathIcon
          className={`w-4 h-4 ${settings.enabled ? "animate-spin" : ""}`}
          style={{ animationDuration: "3s" }}
        />
        {settings.enabled ? <span className="tabular-nums">{countdown}s</span> : <span>Auto</span>}
      </button>

      {/* Settings Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 rounded-lg border border-gray-700 shadow-xl z-50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-200">Auto Refresh</h4>
                <button
                  onClick={() => updateSettings({ enabled: !settings.enabled })}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded text-sm ${
                    settings.enabled ? "bg-green-600 text-white" : "bg-gray-600 text-gray-300"
                  }`}
                >
                  {settings.enabled ? (
                    <>
                      <PauseIcon className="w-4 h-4" />
                      On
                    </>
                  ) : (
                    <>
                      <PlayIcon className="w-4 h-4" />
                      Off
                    </>
                  )}
                </button>
              </div>

              <div className="mb-4">
                <label className="text-sm text-gray-400 mb-2 block">Refresh Interval</label>
                <div className="grid grid-cols-5 gap-1">
                  {intervalOptions.map((interval) => (
                    <button
                      key={interval}
                      onClick={() => updateSettings({ interval })}
                      className={`py-1.5 text-sm rounded ${
                        settings.interval === interval
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                      }`}
                    >
                      {interval}s
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <ClockIcon className="w-3.5 h-3.5" />
                  Next refresh in {countdown}s
                </span>
                <button
                  onClick={() => {
                    onRefresh();
                    setCountdown(settings.interval);
                  }}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Refresh now
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Simple hook for using auto-refresh in components
export function useAutoRefresh(
  callback: () => void,
  interval: number = 10,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const timer = setInterval(callback, interval * 1000);
    return () => clearInterval(timer);
  }, [callback, interval, enabled]);
}
