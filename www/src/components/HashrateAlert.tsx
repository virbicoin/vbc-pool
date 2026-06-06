"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  BellIcon,
  BellAlertIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { BellIcon as BellIconSolid } from "@heroicons/react/24/solid";
import poolConfig from "@/lib/poolConfig";

interface AlertConfig {
  enabled: boolean;
  minHashrate: number; // in MH/s
  checkInterval: number; // in minutes
}

const STORAGE_KEY = `${poolConfig.storage.notificationsEnabled}-alerts`;

function getStoredConfig(): AlertConfig {
  if (typeof window === "undefined") {
    return { enabled: false, minHashrate: 0, checkInterval: 5 };
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return { enabled: false, minHashrate: 0, checkInterval: 5 };
}

function saveConfig(config: AlertConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

interface HashrateAlertProps {
  currentHashrate: number; // in H/s
}

export default function HashrateAlert({ currentHashrate }: HashrateAlertProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<AlertConfig>(() => getStoredConfig());
  const [minHashrateInput, setMinHashrateInput] = useState(config.minHashrate.toString());
  const hasPermission = useRef(
    typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
  );
  const lastAlert = useRef<number>(0);

  const requestPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      hasPermission.current = permission === "granted";
    }
  };

  // Check hashrate and send alert
  const checkHashrate = useCallback(() => {
    if (!config.enabled || config.minHashrate <= 0) return;

    const currentMHs = currentHashrate / 1e6;
    const now = Date.now();

    // Only alert once every 5 minutes minimum
    if (currentMHs < config.minHashrate && now - lastAlert.current > 5 * 60 * 1000) {
      lastAlert.current = now;

      // Browser notification
      if (hasPermission.current && "Notification" in window) {
        new Notification(`${poolConfig.pool.name} - Low Hashrate Alert`, {
          body: `Your hashrate (${currentMHs.toFixed(2)} MH/s) is below ${config.minHashrate} MH/s`,
          icon: poolConfig.branding.logo,
          tag: "hashrate-alert",
        });
      }
    }
  }, [config.enabled, config.minHashrate, currentHashrate]);

  useEffect(() => {
    const checkAndSchedule = () => {
      checkHashrate();
    };
    checkAndSchedule();
    const interval = setInterval(checkAndSchedule, config.checkInterval * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkHashrate, config.checkInterval]);

  const handleSave = () => {
    const newConfig = {
      ...config,
      minHashrate: parseFloat(minHashrateInput) || 0,
    };
    setConfig(newConfig);
    saveConfig(newConfig);
    setIsOpen(false);
  };

  const toggleEnabled = () => {
    const newConfig = { ...config, enabled: !config.enabled };
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  const currentMHs = currentHashrate / 1e6;
  const isLow = config.enabled && config.minHashrate > 0 && currentMHs < config.minHashrate;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`p-2 rounded-lg transition-colors relative ${
          isLow
            ? "bg-red-600/20 text-red-400 hover:bg-red-600/30"
            : config.enabled
              ? "bg-green-600/20 text-green-400 hover:bg-green-600/30"
              : "bg-gray-700 text-gray-400 hover:bg-gray-600"
        }`}
        title="Hashrate Alert Settings"
      >
        {isLow ? (
          <BellAlertIcon className="w-5 h-5 animate-pulse" />
        ) : config.enabled ? (
          <BellIconSolid className="w-5 h-5" />
        ) : (
          <BellIcon className="w-5 h-5" />
        )}
        {isLow && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                <BellIcon className="w-5 h-5 text-yellow-400" />
                Hashrate Alert
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {!hasPermission && (
              <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-yellow-200">
                      Enable browser notifications to receive alerts
                    </p>
                    <button
                      onClick={requestPermission}
                      className="mt-2 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors"
                    >
                      Enable Notifications
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Enable Alert</span>
                <button
                  onClick={toggleEnabled}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    config.enabled ? "bg-green-600" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      config.enabled ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Minimum Hashrate (MH/s)</label>
                <input
                  type="number"
                  value={minHashrateInput}
                  onChange={(e) => setMinHashrateInput(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="e.g., 100"
                  min="0"
                  step="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Alert when hashrate drops below this value
                </p>
              </div>

              <div className="pt-2 border-t border-gray-700">
                <p className="text-xs text-gray-400 mb-2">
                  Current: <span className="text-white">{currentMHs.toFixed(2)} MH/s</span>
                </p>
                {isLow && <p className="text-xs text-red-400">⚠️ Hashrate is below threshold!</p>}
              </div>

              <button
                onClick={handleSave}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
