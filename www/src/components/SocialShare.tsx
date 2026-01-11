"use client";

import { useState, useCallback, useMemo } from "react";
import { ShareIcon, ClipboardIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { FaXTwitter, FaTelegram, FaReddit } from "react-icons/fa6";
import poolConfig, { getLocalizedValue } from "@/lib/poolConfig";
import { useTranslation } from "@/components/I18nProvider";

interface SocialShareProps {
  title?: string;
  text: string;
  url?: string;
  hashtags?: string[];
  className?: string;
}

type Platform = "twitter" | "telegram" | "reddit" | "copy";

export default function SocialShare({
  title,
  text,
  url = typeof window !== "undefined" ? window.location.href : "",
  hashtags = [poolConfig.coin.symbol, "mining", "crypto"],
  className = "",
}: SocialShareProps) {
  const { locale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareText = `${text}\n\n${url}`;
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);
  const encodedHashtags = hashtags.join(",");

  const shareLinks = useMemo(
    (): Record<Platform, { url: string; icon: React.ReactNode; label: string; color: string }> => ({
      twitter: {
        url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}&hashtags=${encodedHashtags}`,
        icon: <FaXTwitter className="w-5 h-5" />,
        label: "X (Twitter)",
        color: "hover:bg-gray-700",
      },
      telegram: {
        url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
        icon: <FaTelegram className="w-5 h-5" />,
        label: "Telegram",
        color: "hover:bg-blue-600/20",
      },
      reddit: {
        url: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodeURIComponent(title || text)}`,
        icon: <FaReddit className="w-5 h-5" />,
        label: "Reddit",
        color: "hover:bg-orange-600/20",
      },
      copy: {
        url: "",
        icon: copied ? <CheckIcon className="w-5 h-5" /> : <ClipboardIcon className="w-5 h-5" />,
        label: copied ? "Copied!" : "Copy Link",
        color: "hover:bg-green-600/20",
      },
    }),
    [encodedText, encodedUrl, encodedHashtags, title, text, copied]
  );

  const handleShare = useCallback(
    async (platform: Platform) => {
      if (platform === "copy") {
        try {
          await navigator.clipboard.writeText(shareText);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error("Failed to copy:", err);
        }
      } else {
        window.open(shareLinks[platform].url, "_blank", "width=600,height=400");
      }
    },
    [shareText, shareLinks]
  );

  // Native share API support
  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || getLocalizedValue(poolConfig.pool.name, locale),
          text: text,
          url: url,
        });
      } catch (err) {
        // User cancelled or error
        if ((err as Error).name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    } else {
      setIsOpen(true);
    }
  }, [title, text, url, locale]);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
        title="Share"
      >
        <ShareIcon className="w-4 h-4" />
        <span>Share</span>
      </button>

      {/* Share Modal */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 bg-gray-800 rounded-lg border border-gray-700 shadow-xl z-50">
            <div className="flex items-center justify-between p-3 border-b border-gray-700">
              <span className="font-medium text-gray-200">Share</span>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2">
              {(["twitter", "telegram", "reddit", "copy"] as Platform[]).map((platform) => (
                <button
                  key={platform}
                  onClick={() => handleShare(platform)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-gray-300 rounded transition-colors ${shareLinks[platform].color}`}
                >
                  {shareLinks[platform].icon}
                  <span>{shareLinks[platform].label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Preset share buttons for common scenarios
export function ShareMiningStats({ hashrate, coin }: { hashrate: string; coin: string }) {
  return (
    <SocialShare
      title={`My ${coin} Mining Stats`}
      text={`I'm mining ${coin} at ${hashrate}! Join me on ${poolConfig.pool.name} 🚀`}
      hashtags={[coin, "mining", "crypto", "blockchain"]}
    />
  );
}

export function ShareBlockFound({
  blockNumber,
  reward,
  coin,
}: {
  blockNumber: number;
  reward: string;
  coin: string;
}) {
  return (
    <SocialShare
      title={`${coin} Block Found!`}
      text={`🎉 Our pool just found block #${blockNumber}! Reward: ${reward} ${coin}`}
      hashtags={[coin, "mining", "blockfound"]}
    />
  );
}
