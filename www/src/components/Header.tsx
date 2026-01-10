"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  QuestionMarkCircleIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
  CalculatorIcon,
  CubeIcon,
  Bars3Icon,
  XMarkIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import HeaderStats from "./HeaderStats";
import { useState } from "react";
import poolConfig from "@/lib/poolConfig";

// Dynamic imports for client-side components
const BlockNotification = dynamic(() => import("@/components/BlockNotification"), {
  ssr: false,
});
const FavoritesPanel = dynamic(() => import("@/components/FavoritesPanel"), {
  ssr: false,
});

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <nav className="container mx-auto px-2 flex items-center justify-between h-14">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold nav-link text-gray-100 hover:text-green-400 transition-colors"
        >
          <Image src={poolConfig.branding.logo} alt={poolConfig.coin.name} width={32} height={32} />
          <span className="hidden sm:inline">{poolConfig.pool.name}</span>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden lg:flex items-center space-x-4">
          <li>
            <HeaderStats />
          </li>
          <li>
            <Link href="/payments" className="nav-link text-gray-200 flex items-center gap-1">
              <CurrencyDollarIcon className="w-5 h-5" />
              <span>Payments</span>
            </Link>
          </li>
          <li>
            <Link href="/calculator" className="nav-link text-gray-200 flex items-center gap-1">
              <CalculatorIcon className="w-5 h-5" />
              <span>Calculator</span>
            </Link>
          </li>
          <li>
            <Link href="/help" className="nav-link text-gray-200 flex items-center gap-1">
              <QuestionMarkCircleIcon className="w-5 h-5" />
              <span>Help</span>
            </Link>
          </li>
          <li>
            <Link href="/about" className="nav-link text-gray-200 flex items-center gap-1">
              <InformationCircleIcon className="w-5 h-5" />
              <span>About</span>
            </Link>
          </li>
          <li>
            <FavoritesPanel iconOnly />
          </li>
          <li>
            <BlockNotification />
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <BlockNotification />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
          >
            {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-gray-900 border-t border-gray-800 px-4 py-3">
          <ul className="space-y-2">
            <li>
              <Link
                href="/blocks"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-200 hover:bg-gray-800"
              >
                <CubeIcon className="w-5 h-5" />
                <span>Blocks</span>
              </Link>
            </li>
            <li>
              <Link
                href="/miners"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-200 hover:bg-gray-800"
              >
                <UsersIcon className="w-5 h-5" />
                <span>Miners</span>
              </Link>
            </li>
            <li>
              <Link
                href="/payments"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-200 hover:bg-gray-800"
              >
                <CurrencyDollarIcon className="w-5 h-5" />
                <span>Payments</span>
              </Link>
            </li>
            <li>
              <Link
                href="/calculator"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-200 hover:bg-gray-800"
              >
                <CalculatorIcon className="w-5 h-5" />
                <span>Calculator</span>
              </Link>
            </li>
            <li>
              <Link
                href="/help"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-200 hover:bg-gray-800"
              >
                <QuestionMarkCircleIcon className="w-5 h-5" />
                <span>Help</span>
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-200 hover:bg-gray-800"
              >
                <InformationCircleIcon className="w-5 h-5" />
                <span>About</span>
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
