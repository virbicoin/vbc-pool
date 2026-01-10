import { SiGithub, SiDiscord, SiX, SiTelegram } from "react-icons/si";
import { FaBitcoin } from "react-icons/fa";
import { poolConfig } from "@/lib/poolConfig";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const startYear = poolConfig.company.startYear;
  const yearDisplay = startYear === currentYear ? currentYear : `${startYear}-${currentYear}`;
  const companyName = poolConfig.company.name || poolConfig.pool.name;

  // Get GitHub repo name from URL
  const getGithubRepoName = (url: string) => {
    const match = url.match(/github\.com\/[^/]+\/([^/]+)/);
    return match ? match[1] : "GitHub";
  };

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-2 py-2 flex items-center justify-center text-gray-400">
        <div className="space-x-2 text-sm flex items-center flex-wrap justify-center">
          <span>
            &copy; {yearDisplay} {companyName}
          </span>

          {poolConfig.links.github && (
            <>
              <span>|</span>
              <a
                href={poolConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-100 transition-colors inline-flex items-center gap-1 align-middle"
              >
                <SiGithub className="w-4 h-4" />
                <span className="align-middle">{getGithubRepoName(poolConfig.links.github)}</span>
              </a>
            </>
          )}

          {poolConfig.pool.address && (
            <>
              <span>|</span>
              <span className="text-cyan-400">
                Pool {poolConfig.coin.symbol}:{" "}
                <span className="font-mono">{poolConfig.pool.address}</span>
              </span>
            </>
          )}

          {poolConfig.links.twitter && (
            <>
              <span>|</span>
              <a
                href={poolConfig.links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-100 transition-colors"
              >
                <SiX className="w-4 h-4" />
              </a>
            </>
          )}

          {poolConfig.links.bitcointalk && (
            <a
              href={poolConfig.links.bitcointalk}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-100 transition-colors"
            >
              <FaBitcoin className="w-4 h-4 text-orange-400" />
            </a>
          )}

          {poolConfig.links.discord && (
            <a
              href={poolConfig.links.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-100 transition-colors"
            >
              <SiDiscord className="w-4 h-4" />
            </a>
          )}

          {poolConfig.links.telegram && (
            <a
              href={poolConfig.links.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-100 transition-colors"
            >
              <SiTelegram className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
