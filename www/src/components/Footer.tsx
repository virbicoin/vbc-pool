import { SiGithub, SiDiscord, SiX } from "react-icons/si";
import { poolConfig } from "@/lib/poolConfig";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const startYear = 2024;
  const yearDisplay = startYear === currentYear ? currentYear : `${startYear}-${currentYear}`;

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-2 py-2 flex items-center justify-center text-gray-400">
        <div className="space-x-2 text-sm flex items-center flex-wrap justify-center">
          <span>
            &copy; {yearDisplay} {poolConfig.pool.name}
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
                <span className="align-middle">GitHub</span>
              </a>
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

          {poolConfig.links.discord && (
            <>
              <span>|</span>
              <a
                href={poolConfig.links.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-100 transition-colors"
              >
                <SiDiscord className="w-4 h-4" />
              </a>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
