"use client";

import { ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

function CopyButton({ text }: { text: string }) {
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

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
      title="Copy to clipboard"
    >
      {copied ? (
        <CheckIcon className="w-4 h-4 text-green-400" />
      ) : (
        <ClipboardDocumentIcon className="w-4 h-4" />
      )}
    </button>
  );
}

export default function CodeBlock({
  children,
  copyText,
}: {
  children: React.ReactNode;
  copyText?: string;
}) {
  const textToCopy = copyText || (typeof children === "string" ? children : "");
  return (
    <div className="relative">
      <pre className="bg-gray-900 rounded-lg p-4 pr-12 border border-gray-700 text-gray-300 overflow-x-auto text-sm">
        <code>{children}</code>
      </pre>
      {textToCopy && <CopyButton text={textToCopy} />}
    </div>
  );
}
