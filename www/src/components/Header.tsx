import Link from 'next/link'
import { HomeIcon, QuestionMarkCircleIcon, InformationCircleIcon, CurrencyDollarIcon, GlobeAltIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import HeaderStats from './HeaderStats'

export default function Header() {
  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <nav className="container mx-auto px-2 flex items-center justify-between h-14">
        <Link href="/" className="text-xl font-bold nav-link text-gray-100 hover:text-green-400 transition-colors">
          VirBiCoin Pool
        </Link>
        <ul className="flex items-center space-x-4">
          <li>
            <Link href="/" className="nav-link text-gray-200 flex items-center gap-1">
              <HomeIcon className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link href="/help" className="nav-link text-gray-200 flex items-center gap-1">
              <QuestionMarkCircleIcon className="w-5 h-5" />
              <span>Getting Started</span>
            </Link>
          </li>
          <li><HeaderStats /></li>
          <li>
            <Link href="/payments" className="nav-link text-gray-200 flex items-center gap-1">
              <CurrencyDollarIcon className="w-5 h-5" />
              <span>Payments</span>
            </Link>
          </li>
          <li>
            <Link href="/about" className="nav-link text-gray-200 flex items-center gap-1">
              <InformationCircleIcon className="w-5 h-5" />
              <span>About</span>
            </Link>
          </li>
          <li>
            <Link href='https://explorer.digitalregion.jp/contract/verify' className='nav-link text-gray-200 flex items-center gap-1'>
              <MagnifyingGlassIcon className='w-5 h-5' />
              <span className='hidden sm:inline'>Explorer</span>
            </Link>
          </li>
          <li>
            <a href="https://stats.digitalregion.jp/" target="_blank" rel="noopener noreferrer" className="nav-link text-gray-200 flex items-center gap-1">
              <GlobeAltIcon className="w-5 h-5" />
              <span>Network</span>
            </a>
          </li>
        </ul>
      </nav>
    </header>
  )
} 