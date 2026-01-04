"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon, UserCircleIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

export default function AccountLookupForm() {
  const [address, setAddress] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address) {
      router.push(`/account/${address}`);
    }
  };

  const isValidAddress = address.length === 42 && address.startsWith("0x");

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
            className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg pl-12 pr-4 py-3 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
            placeholder="0x..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
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
      </form>
    </div>
  );
}
