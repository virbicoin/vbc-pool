import Link from "next/link";
import MetaMaskButton from "@/components/MetaMaskButton";
import CodeBlock from "@/components/CodeBlock";
import { CountryFlag } from "@/components/CountryFlag";
import poolsData from "@/../pools.json";
import {
  QuestionMarkCircleIcon,
  WalletIcon,
  CpuChipIcon,
  ChartBarIcon,
  BanknotesIcon,
  ServerStackIcon,
  CogIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

interface Pool {
  id: string;
  apiUrl: string;
  stratumUrl: string;
  location: string;
  flag: string;
  country: string;
  region: string;
  stratumPorts: number[];
  active: boolean;
}

const pools: Pool[] = poolsData;
const globalPool = pools.find((p) => p.id === "global");
const regionalPools = pools.filter((p) => p.id !== "global");

export default function HelpPage() {
  return (
    <div>
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <QuestionMarkCircleIcon className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-100">Getting Started</h1>
              <p className="text-gray-400 text-sm mt-1">
                Follow these simple steps to start mining VirBiCoin with our pool
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Pool Info Banner */}
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-700/30 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-gray-400 text-sm">Pool Fee</p>
              <p className="text-2xl font-bold text-green-400">1%</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Minimum Payout</p>
              <p className="text-2xl font-bold text-blue-400">0.1 VBC</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Payout Interval</p>
              <p className="text-2xl font-bold text-purple-400">2 Hours</p>
            </div>
          </div>
        </div>

        {/* Step 1 Card */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 mb-6">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <WalletIcon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100">1. Get a VirBiCoin Wallet</h3>
            </div>
            <p className="text-gray-400 mb-4">
              To receive your mining rewards, you&apos;ll need a VirBiCoin wallet. If you don&apos;t
              have one, you can create a secure wallet using MetaMask or other Ethereum-compatible
              wallets.
            </p>
            <div className="bg-gray-900/50 rounded-lg p-4 mb-4 border border-gray-700/50">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">
                VirBiCoin Network Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Network Name:</span>{" "}
                  <span className="text-gray-300">VirBiCoin</span>
                </div>
                <div>
                  <span className="text-gray-500">Chain ID:</span>{" "}
                  <span className="text-gray-300">329</span>
                </div>
                <div>
                  <span className="text-gray-500">Currency Symbol:</span>{" "}
                  <span className="text-gray-300">VBC</span>
                </div>
                <div>
                  <span className="text-gray-500">RPC URL:</span>{" "}
                  <span className="text-gray-300">https://rpc.digitalregion.jp</span>
                </div>
              </div>
            </div>
            <MetaMaskButton />
          </div>
        </div>

        {/* Step 2 Card */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 mb-6">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-600/20 rounded-lg">
                <CpuChipIcon className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100">
                2. Configure Your Mining Software
              </h3>
            </div>
            <p className="text-gray-400 mb-4">
              Use your favorite mining software to connect to our pool. Here are the stratum server
              details:
            </p>
            <div className="bg-gray-900 rounded-lg p-4 mb-4 border border-gray-700">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-gray-500 text-sm min-w-[80px]">Server:</span>
                  <code className="text-green-400 font-mono">
                    stratum+tcp://stratum.digitalregion.jp:8002
                  </code>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-gray-500 text-sm min-w-[80px]">Username:</span>
                  <span className="text-gray-300">Your VirBiCoin wallet address</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-gray-500 text-sm min-w-[80px]">Password:</span>
                  <span className="text-gray-300">
                    x <span className="text-gray-500">(or any value)</span>
                  </span>
                </div>
              </div>
            </div>

            <h4 className="text-lg font-semibold mb-3 text-gray-100">Mining Software</h4>

            {/* lolMiner Recommended Section */}
            <div className="bg-green-900/20 border border-green-600/50 rounded-lg p-5 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  ★ RECOMMENDED
                </span>
                <h5 className="text-xl font-bold text-green-400">lolMiner</h5>
              </div>
              <p className="text-gray-300 mb-4">
                <strong>lolMiner</strong> is our recommended mining software for both{" "}
                <strong>Nvidia</strong> and <strong>AMD GPUs</strong>. It offers excellent
                performance, stability, and supports a wide range of hardware.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <span className="text-green-500">✓</span> Cross-platform (Windows & Linux)
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <span className="text-green-500">✓</span> Nvidia & AMD GPU support
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <span className="text-green-500">✓</span> Low developer fee (0.7%)
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <span className="text-green-500">✓</span> Excellent stability
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <span className="text-green-500">✓</span> Active development
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <span className="text-green-500">✓</span> Easy configuration
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-3">
                📥 Download:{" "}
                <a
                  href="https://github.com/Lolliedieb/lolMiner-releases/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  github.com/Lolliedieb/lolMiner-releases
                </a>
              </p>
              <CodeBlock copyText="lolMiner --algo ETHASH --pool stratum.digitalregion.jp:8002 --user YOUR_ADDRESS --worker WORKER_NAME">
                lolMiner --algo ETHASH --pool stratum.digitalregion.jp:8002 --user YOUR_ADDRESS
                --worker WORKER_NAME
              </CodeBlock>
            </div>

            <details className="group">
              <summary className="cursor-pointer text-md font-semibold mb-3 text-gray-300 hover:text-white flex items-center gap-2">
                <span className="transform group-open:rotate-90 transition-transform">▶</span>
                Alternative Mining Software
              </summary>
              <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-700">
                <p className="text-gray-400 text-sm">
                  You can also use other mining software if you prefer:
                </p>

                <div>
                  <p className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                    <span className="bg-green-700/50 text-green-300 text-xs px-2 py-0.5 rounded">
                      Nvidia
                    </span>
                    T-Rex Miner
                  </p>
                  <CodeBlock copyText="t-rex -a ethash -o stratum+tcp://stratum.digitalregion.jp:8002 -u YOUR_ADDRESS -w WORKER_NAME">
                    t-rex -a ethash -o stratum+tcp://stratum.digitalregion.jp:8002 -u YOUR_ADDRESS
                    -w WORKER_NAME
                  </CodeBlock>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                    <span className="bg-green-700/50 text-green-300 text-xs px-2 py-0.5 rounded">
                      Nvidia
                    </span>
                    Claymore Miner
                  </p>
                  <CodeBlock copyText="EthDcrMiner64 -epool stratum+tcp://stratum.digitalregion.jp:8002 -ewal YOUR_ADDRESS -eworker WORKER_NAME -epsw x -allcoins -1">
                    EthDcrMiner64 -epool stratum+tcp://stratum.digitalregion.jp:8002 -ewal
                    YOUR_ADDRESS -eworker WORKER_NAME -epsw x -allcoins -1
                  </CodeBlock>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                    <span className="bg-red-700/50 text-red-300 text-xs px-2 py-0.5 rounded">
                      AMD
                    </span>
                    TeamRedMiner
                  </p>
                  <CodeBlock copyText="teamredminer -a ethash -o stratum+tcp://stratum.digitalregion.jp:8002 -u YOUR_ADDRESS.WORKER_NAME -p x">
                    teamredminer -a ethash -o stratum+tcp://stratum.digitalregion.jp:8002 -u
                    YOUR_ADDRESS.WORKER_NAME -p x
                  </CodeBlock>
                </div>
              </div>
            </details>
          </div>
        </div>

        {/* Step 3 Card */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 mb-6">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100">
                3. Start Mining & Monitor Your Progress
              </h3>
            </div>
            <p className="text-gray-400 mb-4">
              Once your miner is configured, run it to start mining. You can monitor your hashrate,
              earnings, and payout status on our dashboard by looking up your wallet address.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/miners"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-600 text-base font-medium rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
              >
                View All Miners
              </Link>
            </div>
          </div>
        </div>

        {/* Payouts Card */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 mb-6">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-600/20 rounded-lg">
                <BanknotesIcon className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100">Payouts</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Payout Schedule</h4>
                <p className="text-gray-300">
                  Payouts are sent automatically{" "}
                  <strong className="text-yellow-400">every 2 hours</strong> for all balances above{" "}
                  <strong className="text-yellow-400">0.1 VBC</strong>.
                </p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Pool Fee</h4>
                <p className="text-gray-300">
                  Our pool charges a <strong className="text-green-400">1% fee</strong> on all
                  mining rewards. This helps us maintain and improve the pool infrastructure.
                </p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
              <p className="text-blue-300 text-sm flex items-start gap-2">
                <InformationCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>
                  Payments are processed in batches. If your balance is below the minimum threshold,
                  it will accumulate until the next payout cycle.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Pool Servers Card */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 mb-6">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-cyan-600/20 rounded-lg">
                <ServerStackIcon className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100">Pool Servers & Locations</h3>
            </div>
            <p className="text-gray-400 mb-6">
              Choose the server closest to your location for optimal mining performance and lower
              latency.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
              {/* Global Server */}
              {globalPool && (
                <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 p-4 rounded-lg border border-blue-700/30">
                  <div className="flex items-center gap-2 mb-2">
                    <CountryFlag country={globalPool.country} className="w-6 h-6" />
                    <h4 className="text-lg font-semibold text-white">{globalPool.location}</h4>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">Auto-connects to lowest latency</p>
                  <p className="font-mono text-sm">
                    <span className="text-gray-500">Host:</span> {globalPool.stratumUrl}
                  </p>
                  <p className="font-mono text-sm">
                    <span className="text-gray-500">Port:</span>{" "}
                    {globalPool.stratumPorts.join(", ")}
                  </p>
                </div>
              )}

              {/* Regional Servers */}
              {regionalPools.map((pool) => (
                <div
                  key={pool.id}
                  className="bg-gray-900/60 p-4 rounded-lg border border-gray-700/50"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CountryFlag country={pool.country} className="w-6 h-4" />
                    <h4 className="font-semibold text-white">{pool.location}</h4>
                  </div>
                  <p className="text-gray-400 text-xs mb-1">{pool.region}</p>
                  <p className="font-mono text-sm">
                    <span className="text-gray-500">Host:</span> {pool.stratumUrl}
                  </p>
                  <p className="font-mono text-sm">
                    <span className="text-gray-500">Port:</span> {pool.stratumPorts.join(", ")}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
              <h5 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                <InformationCircleIcon className="w-5 h-5" />
                Connection Tips
              </h5>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• Use the server closest to your location for best performance</li>
                <li>• All servers share the same pool and payouts</li>
                <li>• You can switch between servers at any time without losing progress</li>
                <li>
                  • All ports:{" "}
                  {globalPool?.stratumPorts.map((p, i) => (
                    <span key={p}>
                      {p} ({i === 0 ? "Low" : i === 1 ? "High" : "NiceHash"})
                      {i < globalPool.stratumPorts.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Advanced Connection Details Card */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 mb-6">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-600/20 rounded-lg">
                <CogIcon className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100">Advanced Configuration</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold mb-3 text-gray-100">
                  Static Difficulty Ports
                </h4>
                <p className="text-gray-400 text-sm mb-4">
                  Choose a port based on your mining hardware:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                    <div>
                      <span className="text-gray-300 font-mono">Port 8002</span>
                      <span className="text-gray-500 text-sm ml-2">2 GH</span>
                    </div>
                    <span className="text-xs bg-blue-600/30 text-blue-300 px-2 py-1 rounded">
                      Low-End GPUs
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                    <div>
                      <span className="text-gray-300 font-mono">Port 8004</span>
                      <span className="text-gray-500 text-sm ml-2">44 GH</span>
                    </div>
                    <span className="text-xs bg-purple-600/30 text-purple-300 px-2 py-1 rounded">
                      High-End GPUs
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                    <div>
                      <span className="text-gray-300 font-mono">Port 8009</span>
                      <span className="text-gray-500 text-sm ml-2">999 GH</span>
                    </div>
                    <span className="text-xs bg-orange-600/30 text-orange-300 px-2 py-1 rounded">
                      NiceHash
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3 text-gray-100">NiceHash Configuration</h4>
                <p className="text-gray-400 text-sm mb-4">Settings for NiceHash marketplace:</p>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Algorithm:</span>
                    <span className="text-gray-300 font-mono">Ethash (DaggerHashimoto)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Host:</span>
                    <span className="text-gray-300 font-mono">stratum.digitalregion.jp</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Port:</span>
                    <span className="text-gray-300 font-mono">8009</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Username:</span>
                    <span className="text-gray-300">Your Wallet Address</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Password:</span>
                    <span className="text-gray-300 font-mono">x</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-pink-600/20 rounded-lg">
                <QuestionMarkCircleIcon className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100">Frequently Asked Questions</h3>
            </div>

            <div className="space-y-4">
              <details className="group bg-gray-900/50 rounded-lg border border-gray-700/50">
                <summary className="cursor-pointer p-4 text-gray-200 font-medium hover:text-white flex items-center justify-between">
                  <span>Why is my hashrate showing 0 on the dashboard?</span>
                  <span className="transform group-open:rotate-180 transition-transform text-gray-500">
                    ▼
                  </span>
                </summary>
                <div className="px-4 pb-4 text-gray-400 text-sm">
                  It may take a few minutes for your hashrate to appear after starting mining. The
                  pool calculates your hashrate based on submitted shares, so please wait 5-10
                  minutes for accurate statistics to display.
                </div>
              </details>

              <details className="group bg-gray-900/50 rounded-lg border border-gray-700/50">
                <summary className="cursor-pointer p-4 text-gray-200 font-medium hover:text-white flex items-center justify-between">
                  <span>When will I receive my first payout?</span>
                  <span className="transform group-open:rotate-180 transition-transform text-gray-500">
                    ▼
                  </span>
                </summary>
                <div className="px-4 pb-4 text-gray-400 text-sm">
                  Payouts are processed every 2 hours. Once your balance reaches 0.1 VBC, you will
                  receive a payout in the next payout cycle. You can check your pending balance on
                  the dashboard.
                </div>
              </details>

              <details className="group bg-gray-900/50 rounded-lg border border-gray-700/50">
                <summary className="cursor-pointer p-4 text-gray-200 font-medium hover:text-white flex items-center justify-between">
                  <span>What is the difference between the ports?</span>
                  <span className="transform group-open:rotate-180 transition-transform text-gray-500">
                    ▼
                  </span>
                </summary>
                <div className="px-4 pb-4 text-gray-400 text-sm">
                  Different ports have different difficulty settings. Port 8002 (2 GH) is best for
                  lower-end GPUs, Port 8004 (44 GH) is for high-end GPUs, and Port 8009 (999 GH) is
                  optimized for NiceHash rentals. Choose the port that matches your hardware.
                </div>
              </details>

              <details className="group bg-gray-900/50 rounded-lg border border-gray-700/50">
                <summary className="cursor-pointer p-4 text-gray-200 font-medium hover:text-white flex items-center justify-between">
                  <span>Can I use multiple workers with the same wallet?</span>
                  <span className="transform group-open:rotate-180 transition-transform text-gray-500">
                    ▼
                  </span>
                </summary>
                <div className="px-4 pb-4 text-gray-400 text-sm">
                  Yes! You can use multiple workers with the same wallet address. Simply use
                  different worker names (e.g., rig1, rig2) for each miner. All rewards will be
                  accumulated to the same wallet and paid out together.
                </div>
              </details>

              <details className="group bg-gray-900/50 rounded-lg border border-gray-700/50">
                <summary className="cursor-pointer p-4 text-gray-200 font-medium hover:text-white flex items-center justify-between">
                  <span>Why should I use lolMiner?</span>
                  <span className="transform group-open:rotate-180 transition-transform text-gray-500">
                    ▼
                  </span>
                </summary>
                <div className="px-4 pb-4 text-gray-400 text-sm">
                  lolMiner is recommended because it supports both Nvidia and AMD GPUs, has a low
                  developer fee (0.7%), offers excellent stability, and is actively maintained.
                  It&apos;s also easy to configure and works well with our pool.
                </div>
              </details>

              <details className="group bg-gray-900/50 rounded-lg border border-gray-700/50">
                <summary className="cursor-pointer p-4 text-gray-200 font-medium hover:text-white flex items-center justify-between">
                  <span>How do I check my mining statistics?</span>
                  <span className="transform group-open:rotate-180 transition-transform text-gray-500">
                    ▼
                  </span>
                </summary>
                <div className="px-4 pb-4 text-gray-400 text-sm">
                  Enter your wallet address in the search box on the dashboard or navigate directly
                  to /account/YOUR_ADDRESS. You can view your hashrate, pending balance, total paid,
                  and individual worker statistics.
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
