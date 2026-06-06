import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

// Static imports for Turbopack compatibility
import en from "../../messages/en.json";
import ja from "../../messages/ja.json";
import zh from "../../messages/zh.json";

// Supported locales
export const locales = ["en", "ja", "zh"] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = "en";

// Locale names for display
export const localeNames: Record<Locale, string> = {
  en: "English",
  ja: "日本語",
  zh: "中文",
};

// Locale flags for display
export const localeFlags: Record<Locale, string> = {
  en: "🇺🇸",
  ja: "🇯🇵",
  zh: "🇨🇳",
};

// Messages map for static resolution
const messages: Record<Locale, typeof en> = {
  en,
  ja,
  zh,
};

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    locale,
    messages: messages[locale as Locale],
  };
});
