import Link from "next/link";
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
  return (
    <div>
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <DocumentTextIcon className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-100">Terms of Service</h1>
              <p className="text-gray-400 text-sm mt-1">
                Please read our terms carefully before using the pool
              </p>
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
              <p className="text-gray-300 text-sm">Overview</p>
            </a>
            <a href="#terms" className="p-3 rounded-lg hover:bg-white/5 transition-colors">
              <ShieldCheckIcon className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-gray-300 text-sm">Terms of Use</p>
            </a>
            <a href="#features" className="p-3 rounded-lg hover:bg-white/5 transition-colors">
              <ServerStackIcon className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-gray-300 text-sm">Features</p>
            </a>
            <a href="#contact" className="p-3 rounded-lg hover:bg-white/5 transition-colors">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-gray-300 text-sm">Contact</p>
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
              <h3 className="text-xl font-semibold text-gray-100">Overview</h3>
            </div>
            <p className="text-gray-400 leading-relaxed">
              VirBiCoin Pool (hereafter referred to as &quot;the Pool&quot;) is a service designed
              for <strong className="text-gray-200">decentralized mining</strong>, providing users
              with a high-performance mining environment. By using the Pool, users agree to accept
              all terms and risks outlined below.
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
              <h3 className="text-xl font-semibold text-gray-100">Terms of Use</h3>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <h4 className="text-gray-200 font-semibold mb-2 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
                  Experimental Software Usage
                </h4>
                <p className="text-gray-400 text-sm">
                  The Pool utilizes software written in{" "}
                  <strong className="text-gray-300">Go</strong>, designed to be highly concurrent
                  and low in memory consumption. This software is still under development, meaning
                  there may be unexpected bugs or errors. Users must accept all{" "}
                  <strong className="text-gray-300">risks</strong> associated with using this
                  experimental software.
                </p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <h4 className="text-gray-200 font-semibold mb-2 flex items-center gap-2">
                  <ShieldCheckIcon className="w-5 h-5 text-blue-400" />
                  Acceptance of Risk
                </h4>
                <p className="text-gray-400 text-sm">
                  Users acknowledge and accept all risks (e.g., hardware failure, network
                  interruption, software bugs) related to the use of the Pool. By using the Pool,
                  users agree <strong className="text-gray-300">not to seek compensation</strong>{" "}
                  for any irreversible losses.
                </p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <h4 className="text-gray-200 font-semibold mb-2 flex items-center gap-2">
                  <ScaleIcon className="w-5 h-5 text-purple-400" />
                  Liability of the Pool Owner
                </h4>
                <p className="text-gray-400 text-sm">
                  The Pool owner will make every effort to prevent the worst-case scenarios, but{" "}
                  <strong className="text-gray-300">does not provide compensation</strong> for
                  losses arising from inevitable events or issues. Users understand that there are
                  no guarantees provided regarding the Pool&apos;s performance.
                </p>
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
              <h3 className="text-xl font-semibold text-gray-100">Features and Services</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <h4 className="text-gray-200 font-semibold mb-2">⚡ High-Performance Proxy</h4>
                <p className="text-gray-400 text-sm">
                  The Pool utilizes a high-performance proxy server that allows for highly parallel
                  processing and low latency.
                </p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <h4 className="text-gray-200 font-semibold mb-2">💰 Block Unlocking & Payout</h4>
                <p className="text-gray-400 text-sm">
                  The Pool has a block unlocking and payout module designed to distribute mining
                  rewards fairly.
                </p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <h4 className="text-gray-200 font-semibold mb-2">🌐 Distributed Architecture</h4>
                <p className="text-gray-400 text-sm">
                  Built on a 100% distributed architecture using multiple servers to ensure high
                  availability and fault tolerance.
                </p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <h4 className="text-gray-200 font-semibold mb-2">🎨 Modern Interface</h4>
                <p className="text-gray-400 text-sm">
                  A modern, user-friendly interface built with Next.js for real-time monitoring of
                  mining progress and rewards.
                </p>
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
              <h3 className="text-xl font-semibold text-gray-100">Prohibited Activities</h3>
            </div>
            <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4">
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✕</span>
                  <span>
                    <strong className="text-gray-300">Fraudulent Activities:</strong> Users agree
                    not to engage in fraudulent activities such as unfair mining practices, hacking,
                    or spamming. Any detected fraudulent behavior will result in immediate
                    suspension of the user account.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✕</span>
                  <span>
                    <strong className="text-gray-300">Personal Information Misuse:</strong> Users
                    agree that their personal information provided during Pool usage will be handled
                    according to the Pool&apos;s Privacy Policy.
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
              <h3 className="text-xl font-semibold text-gray-100">Rewards and Payments</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <h4 className="text-gray-200 font-semibold mb-2">Reward Distribution</h4>
                <p className="text-gray-400 text-sm">
                  The Pool distributes mining rewards{" "}
                  <strong className="text-green-400">proportionally</strong> based on the
                  computational resources provided by each user. The calculation method for rewards
                  is available in the official guide and is subject to change.
                </p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <h4 className="text-gray-200 font-semibold mb-2">Minimum Payout Threshold</h4>
                <p className="text-gray-400 text-sm">
                  Users must meet a minimum payout threshold of{" "}
                  <strong className="text-yellow-400">0.1 VBC</strong> before rewards are
                  distributed. This threshold may be changed at the discretion of the Pool owner.
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
              <h3 className="text-xl font-semibold text-gray-100">Disclaimers</h3>
            </div>
            <div className="bg-orange-900/20 border border-orange-700/30 rounded-lg p-4">
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1">⚠</span>
                  <span>
                    <strong className="text-gray-300">Service Interruption:</strong> The Pool may
                    experience temporary service interruptions or downtime due to maintenance or
                    unforeseen issues. In such cases, the Pool owner is not liable for any loss
                    incurred by the user.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1">⚠</span>
                  <span>
                    <strong className="text-gray-300">Third-Party Liability:</strong> If a user
                    causes damage to a third party, the user will be held responsible, and the Pool
                    owner will not be liable for any damages or legal consequences.
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
              <h3 className="text-xl font-semibold text-gray-100">Legal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <h4 className="text-gray-200 font-semibold mb-2">Changes to Terms</h4>
                <p className="text-gray-400 text-sm">
                  The Pool reserves the right to update or change these Terms of Service at any
                  time. If changes are made, users will be notified through the official website.
                  Continued use of the service after the changes constitutes acceptance of the
                  revised terms.
                </p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <h4 className="text-gray-200 font-semibold mb-2">Governing Law</h4>
                <p className="text-gray-400 text-sm">
                  These Terms of Service are governed by the laws of{" "}
                  <strong className="text-gray-300">Japan</strong>. Any disputes arising from the
                  use of this service shall be subject to the exclusive jurisdiction of the{" "}
                  <strong className="text-gray-300">Tokyo District Court</strong>.
                </p>
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
              <h3 className="text-xl font-semibold text-gray-100">Contact Information</h3>
            </div>
            <p className="text-gray-400 mb-4">
              For any inquiries or support requests, please contact us through the following
              channels:
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://x.com/VirBiCoin"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
              >
                <GlobeAltIcon className="w-5 h-5" />X (Twitter)
              </a>
              <a
                href="https://discord.digitalregion.jp/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-700 hover:bg-indigo-600 text-gray-200 rounded-lg transition-colors"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                Discord
              </a>
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
                Ready to start mining? Check out our{" "}
                <Link href="/help" className="text-blue-400 hover:text-blue-300">
                  Getting Started Guide
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
