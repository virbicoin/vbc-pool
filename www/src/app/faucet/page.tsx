"use client";

import { useState, useEffect } from "react";
import { BeakerIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import { poolConfig } from "@/lib/poolConfig";
import { isValidEthereumAddress } from "@/lib/formatters";

interface FaucetStatus {
  enabled: boolean;
  backendNotReady?: boolean;
  amount?: number;
  amountFormatted?: string;
  symbol?: string;
  cooldownHours?: number;
}

interface FaucetResponse {
  success?: boolean;
  error?: string;
  message?: string;
  txHash?: string;
  amount?: number;
  amountFormatted?: string;
  symbol?: string;
  remainingRequests?: number;
  nextRequestTime?: number;
  remainingMs?: number;
}

export default function FaucetPage() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<FaucetStatus | null>(null);
  const [result, setResult] = useState<FaucetResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);

  // Fetch faucet status on load
  useEffect(() => {
    fetch("/api/faucet")
      .then((res) => res.json())
      .then((data) => setStatus(data))
      .catch(() => setStatus({ enabled: false }));
  }, []);

  // Validate address on change
  const handleAddressChange = (value: string) => {
    setAddress(value);
    setResult(null);
    setError(null);

    if (value && !value.startsWith("0x")) {
      setAddressError("Address must start with 0x");
    } else if (value && value.length > 2 && !isValidEthereumAddress(value)) {
      if (value.length === 42) {
        setAddressError("Invalid address format");
      } else {
        setAddressError(null); // Still typing
      }
    } else {
      setAddressError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!address) {
      setError("Please enter your wallet address");
      return;
    }

    if (!isValidEthereumAddress(address)) {
      setError("Please enter a valid Ethereum address (0x followed by 40 hex characters)");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/faucet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to request from faucet");
        if (data.remainingMs) {
          setResult(data);
        }
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (ms: number) => {
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Format amount to display nicely (handles both raw and formatted amounts)
  const formatAmount = (amount?: number, formatted?: string): string => {
    if (formatted) return formatted;
    if (!amount) return "0";
    // Convert Shannon to VBC (1 VBC = 1e18 Shannon)
    const vbc = amount / 1e18;
    if (vbc >= 1) return vbc.toFixed(2);
    if (vbc >= 0.001) return vbc.toFixed(4);
    return vbc.toFixed(6);
  };

  // Get display amount for the faucet
  const displayAmount = formatAmount(status?.amount, status?.amountFormatted);

  if (!status) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (!status.enabled) {
    const isBackendNotReady = status.backendNotReady;
    return (
      <div>
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-600/20 rounded-lg">
                <BeakerIcon className="w-8 h-8 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-100">Faucet</h1>
                <p className="text-gray-400 text-sm mt-1">
                  Get free {poolConfig.coin.symbol} to start mining
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-lg mx-auto bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-center">
              {isBackendNotReady ? (
                <>
                  <ClockIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-100 mb-2">Coming Soon</h2>
                  <p className="text-gray-400">
                    The faucet service is being set up. Please check back later or join our
                    community for updates on when it will be available.
                  </p>
                </>
              ) : (
                <>
                  <XCircleIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-100 mb-2">Faucet Disabled</h2>
                  <p className="text-gray-400">
                    The faucet is currently not available. Please check back later or join our
                    community for updates.
                  </p>
                </>
              )}
              {poolConfig.links.discord && (
                <a
                  href={poolConfig.links.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  Join Discord
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600/20 rounded-lg">
              <BeakerIcon className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-100">Faucet</h1>
              <p className="text-gray-400 text-sm mt-1">
                Get free {poolConfig.coin.symbol} to start mining
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          {/* Info Card */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Faucet Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Amount per request</span>
                <span className="text-green-400 font-mono font-semibold">
                  {displayAmount} {status.symbol}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Cooldown period</span>
                <span className="text-gray-100">{status.cooldownHours} hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Network</span>
                <span className="text-gray-100">{poolConfig.coin.name}</span>
              </div>
            </div>
          </div>

          {/* Request Form */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Request {status.symbol}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-2">
                  Wallet Address
                </label>
                <input
                  type="text"
                  id="address"
                  value={address}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  placeholder="0x..."
                  className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 ${
                    addressError
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-700 focus:ring-green-500"
                  }`}
                  disabled={loading}
                />
                {addressError && <p className="mt-1 text-sm text-red-400">{addressError}</p>}
              </div>

              <button
                type="submit"
                disabled={loading || !!addressError || !address}
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <BeakerIcon className="w-5 h-5" />
                    Request {displayAmount} {status.symbol}
                  </>
                )}
              </button>
            </form>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-900/30 border border-red-700 rounded-lg">
                <div className="flex items-start gap-3">
                  <XCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400">{error}</p>
                    {result?.remainingMs && (
                      <p className="text-gray-400 text-sm mt-1">
                        <ClockIcon className="w-4 h-4 inline mr-1" />
                        Time remaining: {formatTimeRemaining(result.remainingMs)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {result?.success && (
              <div className="mt-4 p-4 bg-green-900/30 border border-green-700 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-green-400 font-medium">{result.message}</p>
                    {result.txHash && result.txHash !== "0x" + "0".repeat(64) && (
                      <p className="text-gray-400 text-sm mt-2">
                        Transaction:{" "}
                        {poolConfig.links.explorer ? (
                          <a
                            href={`${poolConfig.links.explorer}/tx/${result.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline font-mono break-all"
                          >
                            {result.txHash}
                          </a>
                        ) : (
                          <span className="font-mono break-all">{result.txHash}</span>
                        )}
                      </p>
                    )}
                    {result.nextRequestTime && (
                      <p className="text-gray-400 text-sm mt-1">
                        <ClockIcon className="w-4 h-4 inline mr-1" />
                        Next request available in {status.cooldownHours} hours
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">How to Use</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-300">
              <li>
                Create a wallet that supports {poolConfig.coin.name} (Chain ID:{" "}
                {poolConfig.coin.chainId})
              </li>
              <li>Copy your wallet address (starts with 0x)</li>
              <li>Paste your address above and click &quot;Request&quot;</li>
              <li>Wait for the transaction to be confirmed</li>
              <li>You can request again after {status.cooldownHours} hours</li>
            </ol>
          </div>

          {/* Warning */}
          <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
            <p className="text-yellow-300 text-sm">
              ⚠️ The faucet is intended for testing purposes. Please only request what you need and
              do not abuse this service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
