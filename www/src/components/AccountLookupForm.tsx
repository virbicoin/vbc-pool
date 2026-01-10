"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MagnifyingGlassIcon,
  UserCircleIcon,
  ArrowRightIcon,
  StarIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { poolConfig } from "@/lib/poolConfig";

const MAX_FAVORITES = 5;

interface FavoriteAddress {
  address: string;
  label?: string;
  addedAt: number;
}

function getFavorites(): FavoriteAddress[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(poolConfig.storage.favorites);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites: FavoriteAddress[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(poolConfig.storage.favorites, JSON.stringify(favorites));
}

export default function AccountLookupForm() {
  const [address, setAddress] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteAddress[]>(() => getFavorites());
  const [showFavorites, setShowFavorites] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address) {
      router.push(`/account/${address}`);
    }
  };

  const isValidAddress = address.length === 42 && address.startsWith("0x");

  const isFavorite = favorites.some((f) => f.address.toLowerCase() === address.toLowerCase());

  const addToFavorites = () => {
    if (!isValidAddress || isFavorite) return;
    if (favorites.length >= MAX_FAVORITES) {
      alert(`Maximum ${MAX_FAVORITES} favorites allowed. Please remove one first.`);
      return;
    }
    const newFavorites = [...favorites, { address, addedAt: Date.now() }];
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  };

  const removeFromFavorites = (addr: string) => {
    const newFavorites = favorites.filter((f) => f.address.toLowerCase() !== addr.toLowerCase());
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  };

  const selectFavorite = (addr: string) => {
    setAddress(addr);
    setShowFavorites(false);
    router.push(`/account/${addr}`);
  };

  return (
    <div
      className={`w-full bg-gray-800 border rounded-xl p-6 shadow-lg transition-all duration-300 ${isFocused ? "border-blue-500/50 shadow-blue-500/10" : "border-gray-700"}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-600/20 rounded-lg">
          <UserCircleIcon className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-100">Check Your Mining Stats</h2>
          <p className="text-gray-400 text-sm">
            Enter your wallet address to view hashrate, balance, and payment history
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon
              className={`w-5 h-5 transition-colors ${isFocused ? "text-blue-400" : "text-gray-500"}`}
            />
          </div>
          <input
            type="text"
            className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg pl-12 pr-12 py-3 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
            placeholder="0x..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              if (favorites.length > 0) setShowFavorites(true);
            }}
            onBlur={() => {
              setIsFocused(false);
              // Delay hiding to allow click on favorites
              setTimeout(() => setShowFavorites(false), 200);
            }}
          />
          {isValidAddress && (
            <button
              type="button"
              onClick={isFavorite ? () => removeFromFavorites(address) : addToFavorites}
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite ? (
                <StarIconSolid className="w-5 h-5 text-yellow-400 hover:text-yellow-300" />
              ) : (
                <StarIcon className="w-5 h-5 text-gray-500 hover:text-yellow-400" />
              )}
            </button>
          )}

          {/* Favorites dropdown */}
          {showFavorites && favorites.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
              <div className="px-3 py-2 bg-gray-800 border-b border-gray-700">
                <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                  <StarIconSolid className="w-3 h-3 text-yellow-400" />
                  Saved Addresses
                </span>
              </div>
              {favorites.map((fav) => (
                <div
                  key={fav.address}
                  className="flex items-center justify-between px-3 py-2 hover:bg-gray-800 cursor-pointer group"
                >
                  <button
                    type="button"
                    onClick={() => selectFavorite(fav.address)}
                    className="flex-1 text-left font-mono text-sm text-gray-300 hover:text-white truncate"
                  >
                    {fav.address.slice(0, 10)}...{fav.address.slice(-8)}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromFavorites(fav.address);
                    }}
                    className="p-1 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={!address}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              address
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            <span>View Stats</span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>

        {address && !isValidAddress && address.length > 0 && (
          <p className="text-yellow-400 text-sm flex items-center gap-2">
            <span>💡</span>
            <span>Wallet addresses are 42 characters starting with 0x</span>
          </p>
        )}

        {/* Show favorites count */}
        {favorites.length > 0 && !showFavorites && (
          <p className="text-gray-500 text-xs flex items-center gap-1">
            <StarIconSolid className="w-3 h-3 text-yellow-400" />
            {favorites.length} saved address{favorites.length > 1 ? "es" : ""}
          </p>
        )}
      </form>
    </div>
  );
}
