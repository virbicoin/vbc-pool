"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BeakerIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  WalletIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ShareIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import { poolConfig } from "@/lib/poolConfig";
import { isValidEthereumAddress } from "@/lib/formatters";

interface FaucetStats {
  totalRequests: number;
  totalSent: number;
  uniqueAddresses: number;
}

interface FaucetStatus {
  enabled: boolean;
  backendNotReady?: boolean;
  amount?: number;
  amountFormatted?: string;
  symbol?: string;
  cooldownHours?: number;
  maxDailyPerIP?: number;
  balance?: number;
  stats?: FaucetStats;
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
  const [cooldownRemaining, setCooldownRemaining] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [walletConnecting, setWalletConnecting] = useState(false);

  // Fetch faucet status on load
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/faucet");
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus({ enabled: false });
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    // Refresh status every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Countdown timer for cooldown
  useEffect(() => {
    if (!result?.remainingMs || result.remainingMs <= 0) {
      setCooldownRemaining(null);
      return;
    }

    setCooldownRemaining(result.remainingMs);

    const interval = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (!prev || prev <= 1000) {
          clearInterval(interval);
          return null;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [result?.remainingMs]);

  // Connect MetaMask wallet
  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setError("MetaMask is not installed. Please install it to use this feature.");
      return;
    }

    setWalletConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts && Array.isArray(accounts) && accounts.length > 0) {
        setAddress(accounts[0] as string);
        setError(null);
        setAddressError(null);
      }
    } catch (err: unknown) {
      const error = err as { code?: number; message?: string };
      if (error.code === 4001) {
        setError("Connection request was rejected");
      } else {
        setError("Failed to connect wallet");
      }
    } finally {
      setWalletConnecting(false);
    }
  };

  // Copy address to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Share transaction on Twitter/X
  const shareOnTwitter = () => {
    if (!result?.txHash) return;
    const text = `I just received free ${status?.symbol || "coins"} from the ${poolConfig.coin.name} faucet! 🎉\n\nTx: ${poolConfig.links.explorer}/tx/${result.txHash}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // Validate address on change
  const handleAddressChange = (value: string) => {
    setAddress(value);
    setResult(null);
    setError(null);
    setCooldownRemaining(null);

    if (value && !value.startsWith("0x")) {
      setAddressError("Address must start with 0x");
    } else if (value && value.length > 2 && !isValidEthereumAddress(value)) {
      if (value.length === 42) {
        setAddressError("Invalid address format");
      } else {
        setAddressError(null);
      }
    } else {
      setAddressError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setCooldownRemaining(null);

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
        fetchStatus();
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
    const seconds = Math.floor((ms % (60 * 1000)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const formatAmount = (amount?: number, formatted?: string): string => {
    if (formatted) return formatted;
    if (!amount) return "0";
    const coins = amount / 1e18;
    if (coins >= 1) return coins.toFixed(2);
    if (coins >= 0.001) return coins.toFixed(4);
    return coins.toFixed(6);
  };

  const formatBalance = (balance?: number): string => {
    if (!balance) return "0";
    const coins = balance / 1e18;
    if (coins >= 1000) return `${(coins / 1000).toFixed(2)}K`;
    if (coins >= 1) return coins.toFixed(2);
    return coins.toFixed(4);
  };

  const displayAmount = formatAmount(status?.amount, status?.amountFormatted);
  const symbol = status?.symbol || poolConfig.coin.symbol;

  if (!status) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading faucet...</p>
          </div>
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
                    The faucet service is being set up. Please check back later.
                  </p>
                </>
              ) : (
                <>
                  <XCircleIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-100 mb-2">Faucet Disabled</h2>
                  <p className="text-gray-400">The faucet is currently not available.</p>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600/20 rounded-lg">
                <BeakerIcon className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-100">Faucet</h1>
                <p className="text-gray-400 text-sm mt-1">
                  Get free {symbol} to start using {poolConfig.coin.name}
                </p>
              </div>
            </div>
            <button
              onClick={fetchStatus}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Refresh"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Stats Cards */}
          {status.stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <BeakerIcon className="w-4 h-4" />
                  Amount
                </div>
                <div className="text-xl font-bold text-green-400">
                  {displayAmount} {symbol}
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <WalletIcon className="w-4 h-4" />
                  Balance
                </div>
                <div className="text-xl font-bold text-blue-400">
                  {formatBalance(status.balance)} {symbol}
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <ChartBarIcon className="w-4 h-4" />
                  Total Sent
                </div>
                <div className="text-xl font-bold text-purple-400">
                  {formatBalance(status.stats.totalSent)} {symbol}
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <ChartBarIcon className="w-4 h-4" />
                  Users
                </div>
                <div className="text-xl font-bold text-orange-400">
                  {status.stats.uniqueAddresses.toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* Info Card */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Faucet Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Amount per request</span>
                <span className="text-green-400 font-mono font-semibold">
                  {displayAmount} {symbol}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Cooldown</span>
                <span className="text-gray-100">{status.cooldownHours} hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Daily limit per IP</span>
                <span className="text-gray-100">{status.maxDailyPerIP || 10} requests</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Network</span>
                <span className="text-gray-100">
                  {poolConfig.coin.name} (ID: {poolConfig.coin.chainId})
                </span>
              </div>
            </div>
          </div>

          {/* Request Form */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Request {symbol}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-2">
                  Wallet Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="address"
                    value={address}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    placeholder="0x..."
                    className={`flex-1 px-4 py-3 bg-gray-900 border rounded-lg text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 ${
                      addressError
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-700 focus:ring-green-500"
                    }`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={connectWallet}
                    disabled={walletConnecting || loading}
                    className="px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    title="Connect MetaMask"
                  >
                    {walletConnecting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <WalletIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {addressError && <p className="mt-1 text-sm text-red-400">{addressError}</p>}
              </div>

              <button
                type="submit"
                disabled={loading || !!addressError || !address || !!cooldownRemaining}
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : cooldownRemaining ? (
                  <>
                    <ClockIcon className="w-5 h-5" />
                    Wait {formatTimeRemaining(cooldownRemaining)}
                  </>
                ) : (
                  <>
                    <BeakerIcon className="w-5 h-5" />
                    Request {displayAmount} {symbol}
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
                    {cooldownRemaining && cooldownRemaining > 0 && (
                      <p className="text-gray-400 text-sm mt-1">
                        <ClockIcon className="w-4 h-4 inline mr-1" />
                        Time remaining: {formatTimeRemaining(cooldownRemaining)}
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
                      <div className="mt-3 p-3 bg-gray-900/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">Transaction Hash</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => copyToClipboard(result.txHash!)}
                              className="text-gray-400 hover:text-white transition-colors"
                              title="Copy"
                            >
                              <DocumentDuplicateIcon className="w-4 h-4" />
                            </button>
                            {poolConfig.links.twitter && (
                              <button
                                onClick={shareOnTwitter}
                                className="text-gray-400 hover:text-blue-400 transition-colors"
                                title="Share on X"
                              >
                                <ShareIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        {poolConfig.links.explorer ? (
                          <a
                            href={`${poolConfig.links.explorer}/tx/${result.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline font-mono text-sm break-all"
                          >
                            {result.txHash}
                          </a>
                        ) : (
                          <span className="font-mono text-sm break-all text-gray-300">
                            {result.txHash}
                          </span>
                        )}
                        {copied && (
                          <p className="text-green-400 text-xs mt-2">✓ Copied to clipboard!</p>
                        )}
                      </div>
                    )}
                    {result.remainingRequests !== undefined && result.remainingRequests > 0 && (
                      <p className="text-gray-400 text-sm mt-2">
                        Remaining requests today: {result.remainingRequests}
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
            <ol className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white text-sm font-bold flex-shrink-0">
                  1
                </span>
                <span>
                  Connect MetaMask or create a wallet for {poolConfig.coin.name} (Chain ID:{" "}
                  {poolConfig.coin.chainId})
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white text-sm font-bold flex-shrink-0">
                  2
                </span>
                <span>Click the wallet button or paste your address (starts with 0x)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white text-sm font-bold flex-shrink-0">
                  3
                </span>
                <span>Click &quot;Request&quot; to receive free {symbol}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white text-sm font-bold flex-shrink-0">
                  4
                </span>
                <span>Wait for the transaction to be confirmed (~{poolConfig.block.time}s)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white text-sm font-bold flex-shrink-0">
                  5
                </span>
                <span>You can request again after {status.cooldownHours} hours</span>
              </li>
            </ol>

            {/* Add network to MetaMask button */}
            <button
              onClick={async () => {
                if (typeof window === "undefined" || !window.ethereum) {
                  setError("MetaMask is not installed");
                  return;
                }
                try {
                  await window.ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [
                      {
                        chainId: `0x${poolConfig.coin.chainId.toString(16)}`,
                        chainName: poolConfig.coin.name,
                        nativeCurrency: {
                          name: poolConfig.coin.name,
                          symbol: poolConfig.coin.symbol,
                          decimals: 18,
                        },
                        rpcUrls: [poolConfig.coin.rpcUrl],
                        blockExplorerUrls: poolConfig.links.explorer
                          ? [poolConfig.links.explorer]
                          : [],
                      },
                    ],
                  });
                } catch {
                  setError("Failed to add network to MetaMask");
                }
              }}
              className="mt-4 w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <WalletIcon className="w-5 h-5" />
              Add {poolConfig.coin.name} to MetaMask
            </button>
          </div>

          {/* Warning */}
          <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
            <p className="text-yellow-300 text-sm">
              ⚠️ This faucet is for testing purposes only. Please don&apos;t abuse this service.
              Excessive requests may result in temporary restrictions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
