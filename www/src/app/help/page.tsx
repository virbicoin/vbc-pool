"use client";

import Link from "next/link";
import MetaMaskButton from "@/components/MetaMaskButton";
import CodeBlock from "@/components/CodeBlock";
import { CountryFlag } from "@/components/CountryFlag";
import { poolConfig, getPoolServers, PoolServer } from "@/lib/poolConfig";
import { useTranslation } from "@/components/I18nProvider";
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

export default function HelpPage() {
  const { t } = useTranslation();
  const pools: PoolServer[] = getPoolServers();
  const globalPool = pools.find((p) => p.id === "global");
  const regionalPools = pools.filter((p) => p.id !== "global");
  const stratumAddress = `${poolConfig.stratum.host}:${poolConfig.stratum.port}`;
  const miningCommands = {
    lolMiner: `lolMiner --algo ETHASH --pool ${stratumAddress} --user YOUR_ADDRESS --worker WORKER_NAME`,
    trex: `t-rex -a ethash -o stratum+tcp://${stratumAddress} -u YOUR_ADDRESS -w WORKER_NAME`,
    claymore: `EthDcrMiner64 -epool stratum+tcp://${stratumAddress} -ewal YOUR_ADDRESS -eworker WORKER_NAME -epsw x -allcoins -1`,
    teamred: `teamredminer -a ethash -o stratum+tcp://${stratumAddress} -u YOUR_ADDRESS.WORKER_NAME -p x`,
  };

  return (
    <div>
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <QuestionMarkCircleIcon className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-100">{t("help.title")}</h1>
              <p className="text-gray-400 text-sm mt-1">
                {t("help.followSteps", { coinName: poolConfig.coin.name })}
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
              <p className="text-gray-400 text-sm">{t("stats.poolFee")}</p>
              <p className="text-2xl font-bold text-green-400">{poolConfig.pool.fee}%</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">{t("stats.minPayout")}</p>
              <p className="text-2xl font-bold text-blue-400">
                {poolConfig.pool.minPayout} {poolConfig.coin.symbol}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">{t("stats.payoutInterval")}</p>
              <p className="text-2xl font-bold text-purple-400">{t("help.twoHours")}</p>
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
              <h3 className="text-xl font-semibold text-gray-100">
                {t("help.step1Title", { coinName: poolConfig.coin.name })}
              </h3>
            </div>
            <p className="text-gray-400 mb-4">
              {t("help.step1Desc", { coinName: poolConfig.coin.name })}
            </p>
            <div className="bg-gray-900/50 rounded-lg p-4 mb-4 border border-gray-700/50">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">
                {t("help.networkDetails", { coinName: poolConfig.coin.name })}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">{t("help.networkName")}:</span>{" "}
                  <span className="text-gray-300">{poolConfig.coin.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">{t("help.chainId")}:</span>{" "}
                  <span className="text-gray-300">{poolConfig.coin.chainId}</span>
                </div>
                <div>
                  <span className="text-gray-500">{t("help.currencySymbol")}:</span>{" "}
                  <span className="text-gray-300">{poolConfig.coin.symbol}</span>
                </div>
                {poolConfig.coin.rpcUrl && (
                  <div>
                    <span className="text-gray-500">{t("help.rpcUrl")}:</span>{" "}
                    <span className="text-gray-300">{poolConfig.coin.rpcUrl}</span>
                  </div>
                )}
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
              <h3 className="text-xl font-semibold text-gray-100">{t("help.step2Title")}</h3>
            </div>
            <p className="text-gray-400 mb-4">{t("help.step2Desc")}</p>
            <div className="bg-gray-900 rounded-lg p-4 mb-4 border border-gray-700">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-gray-500 text-sm min-w-[80px]">{t("help.server")}:</span>
                  <code className="text-green-400 font-mono">
                    stratum+tcp://{poolConfig.stratum.host}:{poolConfig.stratum.port}
                  </code>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-gray-500 text-sm min-w-[80px]">{t("help.username")}:</span>
                  <span className="text-gray-300">
                    {t("help.yourWalletAddress", { coinName: poolConfig.coin.name })}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-gray-500 text-sm min-w-[80px]">{t("help.password")}:</span>
                  <span className="text-gray-300">
                    x <span className="text-gray-500">({t("help.orAnyValue")})</span>
                  </span>
                </div>
              </div>
            </div>

            <h4 className="text-lg font-semibold mb-3 text-gray-100">{t("help.miningSoftware")}</h4>

            {/* lolMiner Recommended Section */}
            <div className="bg-green-900/20 border border-green-600/50 rounded-lg p-5 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  ★ {t("help.recommended")}
                </span>
                <h5 className="text-xl font-bold text-green-400">lolMiner</h5>
              </div>
              <p className="text-gray-300 mb-4">
                <strong>lolMiner</strong> {t("help.lolMinerDesc")}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <span className="text-green-500">✓</span> {t("help.crossPlatform")}
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <span className="text-green-500">✓</span> {t("help.nvidiaAmdSupport")}
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <span className="text-green-500">✓</span> {t("help.lowDevFee")}
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <span className="text-green-500">✓</span> {t("help.excellentStability")}
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <span className="text-green-500">✓</span> {t("help.activeDevelopment")}
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <span className="text-green-500">✓</span> {t("help.easyConfiguration")}
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-3">
                📥 {t("help.download")}:{" "}
                <a
                  href="https://github.com/Lolliedieb/lolMiner-releases/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  github.com/Lolliedieb/lolMiner-releases
                </a>
              </p>
              <CodeBlock copyText={miningCommands.lolMiner}>{miningCommands.lolMiner}</CodeBlock>
            </div>

            <details className="group">
              <summary className="cursor-pointer text-md font-semibold mb-3 text-gray-300 hover:text-white flex items-center gap-2">
                <span className="transform group-open:rotate-90 transition-transform">▶</span>
                {t("help.alternativeSoftware")}
              </summary>
              <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-700">
                <p className="text-gray-400 text-sm">{t("help.alternativeSoftwareDesc")}</p>

                <div>
                  <p className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                    <span className="bg-green-700/50 text-green-300 text-xs px-2 py-0.5 rounded">
                      Nvidia
                    </span>
                    T-Rex Miner
                  </p>
                  <CodeBlock copyText={miningCommands.trex}>{miningCommands.trex}</CodeBlock>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                    <span className="bg-green-700/50 text-green-300 text-xs px-2 py-0.5 rounded">
                      Nvidia
                    </span>
                    Claymore Miner
                  </p>
                  <CodeBlock copyText={miningCommands.claymore}>
                    {miningCommands.claymore}
                  </CodeBlock>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                    <span className="bg-red-700/50 text-red-300 text-xs px-2 py-0.5 rounded">
                      AMD
                    </span>
                    TeamRedMiner
                  </p>
                  <CodeBlock copyText={miningCommands.teamred}>{miningCommands.teamred}</CodeBlock>
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
              <h3 className="text-xl font-semibold text-gray-100">{t("help.step3Title")}</h3>
            </div>
            <p className="text-gray-400 mb-4">{t("help.step3Desc")}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                {t("help.goToDashboard")}
              </Link>
              <Link
                href="/miners"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-600 text-base font-medium rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
              >
                {t("help.viewAllMiners")}
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
              <h3 className="text-xl font-semibold text-gray-100">{t("help.payouts")}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <h4 className="text-sm font-semibold text-gray-400 mb-2">
                  {t("help.payoutSchedule")}
                </h4>
                <p className="text-gray-300">
                  {t("help.payoutScheduleDesc1")}{" "}
                  <strong className="text-yellow-400">{t("help.everyTwoHours")}</strong>{" "}
                  {t("help.payoutScheduleDesc2")}{" "}
                  <strong className="text-yellow-400">
                    {poolConfig.pool.minPayout} {poolConfig.coin.symbol}
                  </strong>
                  .
                </p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <h4 className="text-sm font-semibold text-gray-400 mb-2">{t("stats.poolFee")}</h4>
                <p className="text-gray-300">
                  {t("help.poolFeeDesc1")}{" "}
                  <strong className="text-green-400">
                    {poolConfig.pool.fee}%{t("help.poolFeeDesc2")}
                  </strong>{" "}
                  {t("help.poolFeeDesc3")}
                </p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
              <p className="text-blue-300 text-sm flex items-start gap-2">
                <InformationCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{t("help.paymentBatchInfo")}</span>
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
              <h3 className="text-xl font-semibold text-gray-100">
                {t("help.poolServersLocations")}
              </h3>
            </div>
            <p className="text-gray-400 mb-6">{t("help.chooseServer")}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
              {/* Global Server */}
              {globalPool && (
                <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 p-4 rounded-lg border border-blue-700/30">
                  <div className="flex items-center gap-2 mb-2">
                    <CountryFlag country={globalPool.country} className="w-6 h-6" />
                    <h4 className="text-lg font-semibold text-white">{globalPool.location}</h4>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{t("help.autoConnects")}</p>
                  <p className="font-mono text-sm">
                    <span className="text-gray-500">{t("help.host")}:</span> {globalPool.stratumUrl}
                  </p>
                  <p className="font-mono text-sm">
                    <span className="text-gray-500">{t("help.port")}:</span>{" "}
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
                    <span className="text-gray-500">{t("help.host")}:</span> {pool.stratumUrl}
                  </p>
                  <p className="font-mono text-sm">
                    <span className="text-gray-500">{t("help.port")}:</span>{" "}
                    {pool.stratumPorts.join(", ")}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
              <h5 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                <InformationCircleIcon className="w-5 h-5" />
                {t("help.connectionTips")}
              </h5>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• {t("help.tip1")}</li>
                <li>• {t("help.tip2")}</li>
                <li>• {t("help.tip3")}</li>
                <li>
                  • {t("help.allPorts")}:{" "}
                  {globalPool?.stratumPorts.map((p, i) => (
                    <span key={p}>
                      {p} ({i === 0 ? t("help.portLow") : i === 1 ? t("help.portHigh") : "NiceHash"}
                      ){i < globalPool.stratumPorts.length - 1 ? ", " : ""}
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
              <h3 className="text-xl font-semibold text-gray-100">
                {t("help.advancedConfiguration")}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold mb-3 text-gray-100">
                  {t("help.staticDifficultyPorts")}
                </h4>
                <p className="text-gray-400 text-sm mb-4">{t("help.choosePort")}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                    <div>
                      <span className="text-gray-300 font-mono">{t("help.port")} 8002</span>
                      <span className="text-gray-500 text-sm ml-2">2 GH</span>
                    </div>
                    <span className="text-xs bg-blue-600/30 text-blue-300 px-2 py-1 rounded">
                      {t("help.lowEndGpus")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                    <div>
                      <span className="text-gray-300 font-mono">{t("help.port")} 8004</span>
                      <span className="text-gray-500 text-sm ml-2">44 GH</span>
                    </div>
                    <span className="text-xs bg-purple-600/30 text-purple-300 px-2 py-1 rounded">
                      {t("help.highEndGpus")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                    <div>
                      <span className="text-gray-300 font-mono">{t("help.port")} 8009</span>
                      <span className="text-gray-500 text-sm ml-2">999 GH</span>
                    </div>
                    <span className="text-xs bg-orange-600/30 text-orange-300 px-2 py-1 rounded">
                      NiceHash
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3 text-gray-100">
                  {t("help.niceHashConfiguration")}
                </h4>
                <p className="text-gray-400 text-sm mb-4">{t("help.niceHashDesc")}:</p>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t("help.algorithm")}:</span>
                    <span className="text-gray-300 font-mono">Ethash (DaggerHashimoto)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t("help.host")}:</span>
                    <span className="text-gray-300 font-mono">{poolConfig.stratum.host}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t("help.port")}:</span>
                    <span className="text-gray-300 font-mono">
                      {poolConfig.stratum.ports[poolConfig.stratum.ports.length - 1] || 8009}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t("help.username")}:</span>
                    <span className="text-gray-300">{t("help.yourWalletAddressShort")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t("help.password")}:</span>
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
              <h3 className="text-xl font-semibold text-gray-100">{t("help.faq")}</h3>
            </div>

            <div className="space-y-4">
              <details className="group bg-gray-900/50 rounded-lg border border-gray-700/50">
                <summary className="cursor-pointer p-4 text-gray-200 font-medium hover:text-white flex items-center justify-between">
                  <span>{t("help.faqHashrateZero")}</span>
                  <span className="transform group-open:rotate-180 transition-transform text-gray-500">
                    ▼
                  </span>
                </summary>
                <div className="px-4 pb-4 text-gray-400 text-sm">
                  {t("help.faqHashrateZeroAnswer")}
                </div>
              </details>

              <details className="group bg-gray-900/50 rounded-lg border border-gray-700/50">
                <summary className="cursor-pointer p-4 text-gray-200 font-medium hover:text-white flex items-center justify-between">
                  <span>{t("help.faqFirstPayout")}</span>
                  <span className="transform group-open:rotate-180 transition-transform text-gray-500">
                    ▼
                  </span>
                </summary>
                <div className="px-4 pb-4 text-gray-400 text-sm">
                  {t("help.faqFirstPayoutAnswer", {
                    interval: poolConfig.pool.payoutInterval.toLowerCase(),
                    minPayout: String(poolConfig.pool.minPayout),
                    symbol: poolConfig.coin.symbol,
                  })}
                </div>
              </details>

              <details className="group bg-gray-900/50 rounded-lg border border-gray-700/50">
                <summary className="cursor-pointer p-4 text-gray-200 font-medium hover:text-white flex items-center justify-between">
                  <span>{t("help.faqPortDifference")}</span>
                  <span className="transform group-open:rotate-180 transition-transform text-gray-500">
                    ▼
                  </span>
                </summary>
                <div className="px-4 pb-4 text-gray-400 text-sm">
                  {t("help.faqPortDifferenceAnswer")}
                </div>
              </details>

              <details className="group bg-gray-900/50 rounded-lg border border-gray-700/50">
                <summary className="cursor-pointer p-4 text-gray-200 font-medium hover:text-white flex items-center justify-between">
                  <span>{t("help.faqMultipleWorkers")}</span>
                  <span className="transform group-open:rotate-180 transition-transform text-gray-500">
                    ▼
                  </span>
                </summary>
                <div className="px-4 pb-4 text-gray-400 text-sm">
                  {t("help.faqMultipleWorkersAnswer")}
                </div>
              </details>

              <details className="group bg-gray-900/50 rounded-lg border border-gray-700/50">
                <summary className="cursor-pointer p-4 text-gray-200 font-medium hover:text-white flex items-center justify-between">
                  <span>{t("help.faqWhyLolMiner")}</span>
                  <span className="transform group-open:rotate-180 transition-transform text-gray-500">
                    ▼
                  </span>
                </summary>
                <div className="px-4 pb-4 text-gray-400 text-sm">
                  {t("help.faqWhyLolMinerAnswer")}
                </div>
              </details>

              <details className="group bg-gray-900/50 rounded-lg border border-gray-700/50">
                <summary className="cursor-pointer p-4 text-gray-200 font-medium hover:text-white flex items-center justify-between">
                  <span>{t("help.faqCheckStats")}</span>
                  <span className="transform group-open:rotate-180 transition-transform text-gray-500">
                    ▼
                  </span>
                </summary>
                <div className="px-4 pb-4 text-gray-400 text-sm">
                  {t("help.faqCheckStatsAnswer")}
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
