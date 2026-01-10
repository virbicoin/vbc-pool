"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const shortcuts: { key: string; description: string; path?: string; action?: string }[] = [
  { key: "g h", description: "Go to Home", path: "/" },
  { key: "g b", description: "Go to Blocks", path: "/blocks" },
  { key: "g p", description: "Go to Payments", path: "/payments" },
  { key: "g c", description: "Go to Calculator", path: "/calculator" },
  { key: "g ?", description: "Go to Help", path: "/help" },
  { key: "g a", description: "Go to About", path: "/about" },
  { key: "/", description: "Focus search", action: "focus-search" },
  { key: "?", description: "Show shortcuts", action: "show-help" },
];

export function useKeyboardShortcuts() {
  const router = useRouter();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Handle "g" prefix shortcuts
      if (e.key === "g" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const handleSecondKey = (e2: KeyboardEvent) => {
          const combo = `g ${e2.key}`;
          const shortcut = shortcuts.find((s) => s.key === combo);
          if (shortcut?.path) {
            e2.preventDefault();
            router.push(shortcut.path);
          }
          document.removeEventListener("keydown", handleSecondKey);
        };
        document.addEventListener("keydown", handleSecondKey, { once: true });
        setTimeout(() => {
          document.removeEventListener("keydown", handleSecondKey);
        }, 1000);
        return;
      }

      // Handle single key shortcuts
      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[placeholder*="address"], input[placeholder*="Address"]'
        );
        if (searchInput) {
          searchInput.focus();
        }
        return;
      }

      if (e.key === "?" && e.shiftKey) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("show-keyboard-help"));
      }
    },
    [router]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

export function KeyboardShortcutsHelp({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-100">Keyboard Shortcuts</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-lg transition-colors text-gray-400"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2">Navigation</h4>
            <div className="space-y-1">
              {shortcuts
                .filter((s) => s.path)
                .map((shortcut) => (
                  <div key={shortcut.key} className="flex items-center justify-between py-1">
                    <span className="text-gray-300 text-sm">{shortcut.description}</span>
                    <kbd className="px-2 py-1 bg-gray-900 border border-gray-600 rounded text-xs text-gray-300 font-mono">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2">Actions</h4>
            <div className="space-y-1">
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-300 text-sm">Focus search</span>
                <kbd className="px-2 py-1 bg-gray-900 border border-gray-600 rounded text-xs text-gray-300 font-mono">
                  /
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-300 text-sm">Show this help</span>
                <kbd className="px-2 py-1 bg-gray-900 border border-gray-600 rounded text-xs text-gray-300 font-mono">
                  ?
                </kbd>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Press <kbd className="px-1 bg-gray-700 rounded">Esc</kbd> to close
        </p>
      </div>
    </div>
  );
}

// Provider component to enable shortcuts globally
export default function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  useKeyboardShortcuts();
  return <>{children}</>;
}
