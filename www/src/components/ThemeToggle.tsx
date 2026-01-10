"use client";

import { useSyncExternalStore, useCallback } from "react";
import { SunIcon, MoonIcon, ComputerDesktopIcon } from "@heroicons/react/24/outline";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "theme";

const themeSubscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener("themeChange", callback);
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("themeChange", callback);
    mediaQuery.removeEventListener("change", callback);
  };
};

const getThemeSnapshot = (): Theme => {
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  return stored || "system";
};

const getThemeServerSnapshot = (): Theme => "system";

// Apply theme to document
function applyTheme(theme: Theme) {
  const effectiveTheme =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;

  const root = document.documentElement;
  if (effectiveTheme === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.add("light");
    root.classList.remove("dark");
  }
}

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(themeSubscribe, getThemeSnapshot, getThemeServerSnapshot);

  // Apply theme on change
  if (typeof window !== "undefined") {
    applyTheme(theme);
  }

  const setTheme = useCallback((newTheme: Theme) => {
    localStorage.setItem(STORAGE_KEY, newTheme);
    window.dispatchEvent(new Event("themeChange"));
  }, []);

  const cycleTheme = useCallback(() => {
    const current = getThemeSnapshot();
    if (current === "dark") setTheme("light");
    else if (current === "light") setTheme("system");
    else setTheme("dark");
  }, [setTheme]);

  const themeIcon = {
    dark: <MoonIcon className="w-5 h-5" />,
    light: <SunIcon className="w-5 h-5" />,
    system: <ComputerDesktopIcon className="w-5 h-5" />,
  };

  const themeLabel = {
    dark: "Dark",
    light: "Light",
    system: "System",
  };

  return (
    <button
      onClick={cycleTheme}
      className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
        theme === "dark"
          ? "bg-gray-700 text-blue-400 hover:bg-gray-600"
          : theme === "light"
            ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
            : "bg-gray-700 text-gray-400 hover:bg-gray-600"
      } ${className}`}
      title={`Theme: ${themeLabel[theme]}`}
    >
      {themeIcon[theme]}
    </button>
  );
}

// Hook for using theme in components
export function useTheme() {
  const theme = useSyncExternalStore(themeSubscribe, getThemeSnapshot, getThemeServerSnapshot);

  const effectiveTheme: "light" | "dark" =
    typeof window !== "undefined"
      ? theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme
      : "dark";

  const updateTheme = useCallback((newTheme: Theme) => {
    localStorage.setItem(STORAGE_KEY, newTheme);
    window.dispatchEvent(new Event("themeChange"));
  }, []);

  return { theme, effectiveTheme, setTheme: updateTheme };
}
