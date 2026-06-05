"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { NextIntlClientProvider } from "next-intl";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  getSafeLocale,
  isAppLocale,
  type AppLocale,
} from "@/config/i18n";
import enMessages from "@/messages/en.json";
import deMessages from "@/messages/de.json";

type IntlMessages = Record<string, unknown>;

const MESSAGES = {
  en: enMessages,
  de: deMessages,
} satisfies Record<AppLocale, IntlMessages>;

interface LocaleContextValue {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  isLocaleReady: boolean;
}

export const AppLocaleContext = createContext<LocaleContextValue | undefined>(
  undefined,
);

interface I18nProviderProps {
  children: ReactNode;
}

const getLocaleCookie = () => {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${LOCALE_STORAGE_KEY}=`));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.split("=")[1] ?? "");
};

const getPersistedLocale = () => {
  let localStorageLocale: string | null = null;

  try {
    localStorageLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  } catch {
    localStorageLocale = null;
  }

  if (isAppLocale(localStorageLocale)) {
    return localStorageLocale;
  }

  return getSafeLocale(getLocaleCookie());
};

const persistLocale = (locale: AppLocale) => {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Cookie persistence remains available if localStorage is blocked.
  }

  document.cookie = `${LOCALE_STORAGE_KEY}=${encodeURIComponent(
    locale,
  )}; path=/; max-age=31536000; sameSite=lax`;
};

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<AppLocale>(DEFAULT_LOCALE);
  const [isLocaleReady, setIsLocaleReady] = useState(false);

  useEffect(() => {
    const persistedLocale = getPersistedLocale();

    setLocaleState(persistedLocale);
    document.documentElement.lang = persistedLocale;
    setIsLocaleReady(true);
  }, []);

  const setLocale = useCallback((nextLocale: AppLocale) => {
    setLocaleState(nextLocale);
    persistLocale(nextLocale);
    document.documentElement.lang = nextLocale;
  }, []);

  const contextValue = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      isLocaleReady,
    }),
    [isLocaleReady, locale, setLocale],
  );

  return (
    <AppLocaleContext.Provider value={contextValue}>
      <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]}>
        {children}
      </NextIntlClientProvider>
    </AppLocaleContext.Provider>
  );
}
