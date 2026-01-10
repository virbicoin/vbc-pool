"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCodeIcon, XMarkIcon, ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";
import poolConfig from "@/lib/poolConfig";

interface WalletQRCodeProps {
  address: string;
  size?: number;
}

export default function WalletQRCode({ address, size = 200 }: WalletQRCodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        title="Show QR Code"
      >
        <QrCodeIcon className="w-5 h-5 text-gray-300" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-sm w-full p-6 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-400" />
            </button>

            <h3 className="text-lg font-semibold text-gray-100 mb-4 text-center">Wallet Address</h3>

            <div className="flex justify-center mb-4">
              <div className="bg-white p-4 rounded-xl">
                <QRCodeSVG
                  value={address}
                  size={size}
                  level="H"
                  includeMargin={false}
                  fgColor="#1f2937"
                  bgColor="#ffffff"
                />
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-400 mb-1">{poolConfig.coin.name} Address</p>
              <p className="text-sm font-mono text-gray-200 break-all">{address}</p>
            </div>

            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <CheckIcon className="w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <ClipboardIcon className="w-5 h-5" />
                  Copy Address
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
