"use client";

import { useState } from "react";
import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
  showIcon?: boolean;
  variant?: "default" | "minimal" | "inline";
}

export default function CopyButton({
  text,
  label,
  className = "",
  showIcon = true,
  variant = "default",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const baseStyles = {
    default:
      "inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors",
    minimal: "p-1.5 hover:bg-gray-700 text-gray-400 hover:text-gray-200 rounded transition-colors",
    inline: "inline-flex items-center gap-1 text-gray-400 hover:text-gray-200 transition-colors",
  };

  return (
    <button
      onClick={handleCopy}
      className={`${baseStyles[variant]} ${className}`}
      title={copied ? "Copied!" : "Copy to clipboard"}
    >
      {showIcon &&
        (copied ? (
          <CheckIcon className="w-4 h-4 text-green-400" />
        ) : (
          <ClipboardIcon className="w-4 h-4" />
        ))}
      {label && <span>{copied ? "Copied!" : label}</span>}
      {!label && variant === "default" && <span>{copied ? "Copied!" : "Copy"}</span>}
    </button>
  );
}

// Inline copy text component - shows text with copy button
export function CopyableText({
  text,
  displayText,
  className = "",
  truncate = false,
}: {
  text: string;
  displayText?: string;
  className?: string;
  truncate?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const display = displayText || text;
  const truncatedDisplay = truncate ? `${display.slice(0, 10)}...${display.slice(-8)}` : display;

  return (
    <span
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 cursor-pointer group ${className}`}
      title={copied ? "Copied!" : "Click to copy"}
    >
      <span className="font-mono">{truncatedDisplay}</span>
      {copied ? (
        <CheckIcon className="w-3.5 h-3.5 text-green-400" />
      ) : (
        <ClipboardIcon className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </span>
  );
}
