"use client";

import { useState, useSyncExternalStore, useCallback } from "react";
import { useRouter } from "next/navigation";
import { StarIcon, TrashIcon, XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import poolConfig from "@/lib/poolConfig";

interface FavoriteAddress {
  address: string;
  label: string;
  addedAt: number;
}

// Storage key from config
const STORAGE_KEY = poolConfig.storage.favorites;

// Custom hook for hydration-safe localStorage
function useFavorites() {
  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") return "[]";
    return localStorage.getItem(STORAGE_KEY) || "[]";
  }, []);

  const getServerSnapshot = useCallback(() => "[]", []);

  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener("storage", callback);
    window.addEventListener("favorites-updated", callback);
    return () => {
      window.removeEventListener("storage", callback);
      window.removeEventListener("favorites-updated", callback);
    };
  }, []);

  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return JSON.parse(data) as FavoriteAddress[];
}

function saveFavorites(favorites: FavoriteAddress[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  window.dispatchEvent(new Event("favorites-updated"));
}

// Hook to check if an address is favorited
export function useIsFavorite(address: string) {
  const favorites = useFavorites();
  return favorites.some((f) => f.address.toLowerCase() === address.toLowerCase());
}

// Component to toggle favorite status
export function FavoriteButton({ address, size = "md" }: { address: string; size?: "sm" | "md" }) {
  const favorites = useFavorites();
  const isFavorite = favorites.some((f) => f.address.toLowerCase() === address.toLowerCase());

  const toggleFavorite = () => {
    if (isFavorite) {
      const newFavorites = favorites.filter(
        (f) => f.address.toLowerCase() !== address.toLowerCase()
      );
      saveFavorites(newFavorites);
    } else {
      const newFavorites = [
        ...favorites,
        { address, label: "", addedAt: Date.now() } as FavoriteAddress,
      ];
      saveFavorites(newFavorites);
    }
  };

  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <button
      onClick={toggleFavorite}
      className={`p-1.5 rounded-lg transition-colors ${
        isFavorite
          ? "text-yellow-400 hover:text-yellow-300 bg-yellow-400/10"
          : "text-gray-400 hover:text-yellow-400 hover:bg-gray-700"
      }`}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      {isFavorite ? <StarIconSolid className={iconSize} /> : <StarIcon className={iconSize} />}
    </button>
  );
}

// Favorites dropdown/panel component
export function FavoritesPanel({ iconOnly = false }: { iconOnly?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const favorites = useFavorites();
  const router = useRouter();

  const handleNavigate = (address: string) => {
    router.push(`/account/${address}`);
    setIsOpen(false);
  };

  const handleDelete = (address: string) => {
    const newFavorites = favorites.filter((f) => f.address.toLowerCase() !== address.toLowerCase());
    saveFavorites(newFavorites);
  };

  const handleEditLabel = (address: string) => {
    const favorite = favorites.find((f) => f.address === address);
    setEditingId(address);
    setEditLabel(favorite?.label || "");
  };

  const handleSaveLabel = (address: string) => {
    const newFavorites = favorites.map((f) =>
      f.address === address ? { ...f, label: editLabel } : f
    );
    saveFavorites(newFavorites);
    setEditingId(null);
    setEditLabel("");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 ${iconOnly ? "p-2" : "px-3 py-2"} bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors`}
        title="Favorites"
      >
        <StarIconSolid className="w-4 h-4 text-yellow-400" />
        {!iconOnly && <span className="text-sm text-gray-200">Favorites</span>}
        {favorites.length > 0 && (
          <span className="bg-yellow-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
            {favorites.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-3 border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-100">Favorite Addresses</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {favorites.length === 0 ? (
              <div className="p-6 text-center">
                <StarIcon className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No favorites yet</p>
                <p className="text-gray-500 text-xs mt-1">Star addresses to save them here</p>
              </div>
            ) : (
              <ul className="max-h-64 overflow-y-auto">
                {favorites.map((fav) => (
                  <li key={fav.address} className="border-b border-gray-700/50 last:border-0">
                    {editingId === fav.address ? (
                      <div className="p-3 space-y-2">
                        <input
                          type="text"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          placeholder="Enter label..."
                          className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveLabel(fav.address)}
                            className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 hover:bg-gray-700/50 group">
                        <div className="flex items-center justify-between mb-1">
                          <button
                            onClick={() => handleEditLabel(fav.address)}
                            className="text-sm font-medium text-gray-200 hover:text-white truncate max-w-[180px]"
                          >
                            {fav.label || "Unnamed"}
                          </button>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleNavigate(fav.address)}
                              className="p-1 hover:bg-gray-600 rounded"
                              title="View account"
                            >
                              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                            </button>
                            <button
                              onClick={() => handleDelete(fav.address)}
                              className="p-1 hover:bg-red-600/20 rounded"
                              title="Remove"
                            >
                              <TrashIcon className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => handleNavigate(fav.address)}
                          className="font-mono text-xs text-gray-400 hover:text-gray-300 truncate block w-full text-left"
                        >
                          {fav.address.slice(0, 10)}...{fav.address.slice(-8)}
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default FavoritesPanel;
