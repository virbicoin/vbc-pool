"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "@/components/I18nProvider";

export default function TimeAgo({
  timestamp,
  agoOnly = false,
}: {
  timestamp: number;
  agoOnly?: boolean;
}) {
  const [text, setText] = useState("");
  const { t, locale } = useTranslation();

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
        if (diff < 5) setText(t("time.justNow"));
        else if (diff < 60) setText(t("time.secondsAgo", { count: diff }));
        else if (diff < 3600) setText(t("time.minutesAgo", { count: Math.floor(diff / 60) }));
        else if (diff < 86400) setText(t("time.hoursAgo", { count: Math.floor(diff / 3600) }));
        else setText(t("time.daysAgo", { count: Math.floor(diff / 86400) }));
      } else {
        setText(new Date(timestampMs).toLocaleString(undefined, { timeZoneName: "short" }));
      }
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [timestamp, agoOnly, t, locale]);

  return <span>{text}</span>;
}
