"use client";

import Link from "next/link";
import { poolConfig } from "@/lib/poolConfig";
import { useTranslation } from "@/components/I18nProvider";
import {
  InformationCircleIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ServerStackIcon,
  BanknotesIcon,
  ScaleIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div>
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <DocumentTextIcon className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-100">{t("about.title")}</h1>
              <p className="text-gray-400 text-sm mt-1">{t("about.subtitle")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Links */}
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-700/30 p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <a href="#overview" className="p-3 rounded-lg hover:bg-white/5 transition-colors">
              <InformationCircleIcon className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-gray-300 text-sm">{t("about.overview")}</p>
            </a>
            <a href="#terms" className="p-3 rounded-lg hover:bg-white/5 transition-colors">
              <ShieldCheckIcon className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-gray-300 text-sm">{t("about.termsOfUse")}</p>
            </a>
            <a href="#features" className="p-3 rounded-lg hover:bg-white/5 transition-colors">
              <ServerStackIcon className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-gray-300 text-sm">{t("about.features")}</p>
            </a>
            <a href="#contact" className="p-3 rounded-lg hover:bg-white/5 transition-colors">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-gray-300 text-sm">{t("about.contact")}</p>
            </a>
          </div>
        </div>

        {/* Overview Section */}
        <div id="overview" className="bg-gray-800 rounded-lg border border-gray-700 mb-6">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <InformationCircleIcon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100">{t("about.overview")}</h3>
            </div>
            <p className="text-gray-400 leading-relaxed">
              {t("about.overviewDesc").replace("{poolName}", poolConfig.pool.name)}
            </p>
          </div>
        </div>

        {/* Terms of Use Section */}
        <div id="terms" className="bg-gray-800 rounded-lg border border-gray-700 mb-6">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-600/20 rounded-lg">
                <ShieldCheckIcon className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100">{t("about.termsOfUse")}</h3>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <h4 className="text-gray-200 font-semibold mb-2 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
                  {t("about.experimentalSoftware")}
                </h4>
                <p className="text-gray-400 text-sm">{t("about.experimentalSoftwareDesc")}</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <h4 className="text-gray-200 font-semibold mb-2 flex items-center gap-2">
                  <ShieldCheckIcon className="w-5 h-5 text-blue-400" />
                  {t("about.acceptanceOfRisk")}
                </h4>
                <p className="text-gray-400 text-sm">{t("about.acceptanceOfRiskDesc")}</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <h4 className="text-gray-200 font-semibold mb-2 flex items-center gap-2">
                  <ScaleIcon className="w-5 h-5 text-purple-400" />
                  {t("about.liabilityOfPoolOwner")}
                </h4>
                <p className="text-gray-400 text-sm">{t("about.liabilityOfPoolOwnerDesc")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="bg-gray-800 rounded-lg border border-gray-700 mb-6">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <ServerStackIcon className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100">
                {t("about.featuresAndServices")}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <h4 className="text-gray-200 font-semibold mb-2">
                  ⚡ {t("about.highPerformanceProxy")}
                </h4>
                <p className="text-gray-400 text-sm">{t("about.highPerformanceProxyDesc")}</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <h4 className="text-gray-200 font-semibold mb-2">💰 {t("about.blockUnlocking")}</h4>
                <p className="text-gray-400 text-sm">{t("about.blockUnlockingDesc")}</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <h4 className="text-gray-200 font-semibold mb-2">
                  🌐 {t("about.distributedArchitecture")}
                </h4>
                <p className="text-gray-400 text-sm">{t("about.distributedArchitectureDesc")}</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <h4 className="text-gray-200 font-semibold mb-2">
                  🎨 {t("about.modernInterface")}
                </h4>
                <p className="text-gray-400 text-sm">{t("about.modernInterfaceDesc")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Prohibited Activities Section */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 mb-6">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-600/20 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100">
                {t("about.prohibitedActivities")}
              </h3>
            </div>
            <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4">
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✕</span>
                  <span>
                    <strong className="text-gray-300">{t("about.fraudulentActivities")}:</strong>{" "}
                    {t("about.fraudulentActivitiesDesc")}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✕</span>
                  <span>
                    <strong className="text-gray-300">{t("about.personalInfoMisuse")}:</strong>{" "}
                    {t("about.personalInfoMisuseDesc")}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Rewards and Payments Section */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 mb-6">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-600/20 rounded-lg">
                <BanknotesIcon className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100">
                {t("about.rewardsAndPayments")}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <h4 className="text-gray-200 font-semibold mb-2">
                  {t("about.rewardDistribution")}
                </h4>
                <p className="text-gray-400 text-sm">{t("about.rewardDistributionDesc")}</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <h4 className="text-gray-200 font-semibold mb-2">
                  {t("about.minPayoutThreshold")}
                </h4>
                <p className="text-gray-400 text-sm">
                  {t("about.minPayoutThresholdDesc")
                    .replace("{minPayout}", String(poolConfig.pool.minPayout))
                    .replace("{symbol}", poolConfig.coin.symbol)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimers Section */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 mb-6">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-600/20 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100">{t("about.disclaimers")}</h3>
            </div>
            <div className="bg-orange-900/20 border border-orange-700/30 rounded-lg p-4">
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1">⚠</span>
                  <span>
                    <strong className="text-gray-300">{t("about.serviceInterruption")}:</strong>{" "}
                    {t("about.serviceInterruptionDesc")}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1">⚠</span>
                  <span>
                    <strong className="text-gray-300">{t("about.thirdPartyLiability")}:</strong>{" "}
                    {t("about.thirdPartyLiabilityDesc")}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Legal Section */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 mb-6">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-cyan-600/20 rounded-lg">
                <ScaleIcon className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100">{t("about.legalInfo")}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <h4 className="text-gray-200 font-semibold mb-2">{t("about.changesToTerms")}</h4>
                <p className="text-gray-400 text-sm">{t("about.changesToTermsDesc")}</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <h4 className="text-gray-200 font-semibold mb-2">{t("about.governingLaw")}</h4>
                <p className="text-gray-400 text-sm">{t("about.governingLawDesc")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div id="contact" className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-pink-600/20 rounded-lg">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100">{t("about.contactInfo")}</h3>
            </div>
            <p className="text-gray-400 mb-4">{t("about.contactInfoDesc")}</p>
            <div className="flex flex-wrap gap-3">
              {poolConfig.links.twitter && (
                <a
                  href={poolConfig.links.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
                >
                  <GlobeAltIcon className="w-5 h-5" />X (Twitter)
                </a>
              )}
              {poolConfig.links.discord && (
                <a
                  href={poolConfig.links.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-700 hover:bg-indigo-600 text-gray-200 rounded-lg transition-colors"
                >
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  Discord
                </a>
              )}
              <span
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700/50 text-gray-400 rounded-lg cursor-not-allowed"
                title="Coming Soon"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                Telegram
                <span className="text-xs bg-gray-600 px-1.5 py-0.5 rounded">WIP</span>
              </span>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-gray-500 text-sm text-center">
                {t("about.readyToMine")}{" "}
                <Link href="/help" className="text-blue-400 hover:text-blue-300">
                  {t("about.gettingStartedGuide")}
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
