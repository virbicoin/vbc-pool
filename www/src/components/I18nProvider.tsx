"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Locale, locales, defaultLocale } from "@/i18n";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Messages = Record<string, any>;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  messages: Messages;
}

const I18nContext = createContext<I18nContextType | null>(null);

// Storage key for locale preference
const LOCALE_STORAGE_KEY = "preferred-locale";

// Get browser language
function getBrowserLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;

  const browserLang = navigator.language.split("-")[0];
  if (locales.includes(browserLang as Locale)) {
    return browserLang as Locale;
  }
  return defaultLocale;
}

// Get stored locale or browser locale
function getInitialLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;

  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored && locales.includes(stored as Locale)) {
    return stored as Locale;
  }
  return getBrowserLocale();
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getInitialLocale());
  const [messages, setMessages] = useState<Messages>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load messages for current locale
  useEffect(() => {
    let cancelled = false;
    async function loadMessages() {
      try {
        const msgs = await import(`../../messages/${locale}.json`);
        if (!cancelled) {
          setMessages(msgs.default);
          setIsLoaded(true);
        }
      } catch (error) {
        console.error(`Failed to load messages for locale: ${locale}`, error);
        const fallback = await import(`../../messages/en.json`);
        if (!cancelled) {
          setMessages(fallback.default);
          setIsLoaded(true);
        }
      }
    }
    loadMessages();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  // Update locale and persist
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    // Update html lang attribute
    document.documentElement.lang = newLocale;
  };

  // Translation function
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split(".");
    let value: Messages | string = messages;

    for (const k of keys) {
      if (typeof value === "object" && value !== null && k in value) {
        value = value[k] as Messages | string;
      } else {
        // Key not found, return the key itself
        return key;
      }
    }

    if (typeof value !== "string") {
      return key;
    }

    // Replace parameters
    if (params) {
      return value.replace(/\{(\w+)\}/g, (_, paramKey) => {
        return params[paramKey]?.toString() ?? `{${paramKey}}`;
      });
    }

    return value;
  };

  // Show loading state or children
  if (!isLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, messages }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return context;
}

// Hook for just getting the translation function
export function useT() {
  const { t } = useTranslation();
  return t;
}
