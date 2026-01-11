"use client";
import { useEffect, useState } from "react";

export default function TimeAgo({
  timestamp,
  agoOnly = false,
}: {
  timestamp: number;
  agoOnly?: boolean;
}) {
  const [text, setText] = useState("");

  useEffect(() => {
    function update() {
      if (!timestamp) {
        setText("N/A");
        return;
      }
      // Normalize timestamp: if > 1e12, it's already in milliseconds, otherwise convert from seconds
      const timestampMs = timestamp > 1e12 ? timestamp : timestamp * 1000;
      const timestampSec = Math.floor(timestampMs / 1000);

      if (agoOnly) {
        // "xx ago"形式
        const now = Math.floor(Date.now() / 1000);
        const diff = now - timestampSec;
        if (diff < 60) setText(`${diff} seconds ago`);
        else if (diff < 3600) setText(`${Math.floor(diff / 60)} minutes ago`);
        else if (diff < 86400) setText(`${Math.floor(diff / 3600)} hours ago`);
        else setText(`${Math.floor(diff / 86400)} days ago`);
      } else {
        setText(new Date(timestampMs).toLocaleString(undefined, { timeZoneName: "short" }));
      }
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [timestamp, agoOnly]);

  return <span>{text}</span>;
}
