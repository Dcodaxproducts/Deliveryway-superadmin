"use client";

import {
  createContext,
  useContext,
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
  type AppLocale,
} from "@/config/i18n";
import enMessages from "@/messages/en.json";
import deMessages from "@/messages/de.json";

type IntlMessages = typeof enMessages;

const MESSAGES: Record<AppLocale, IntlMessages> = {
  en: enMessages,
  de: deMessages,
};

interface LocaleContextValue {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<AppLocale>(DEFAULT_LOCALE);

  useEffect(() => {
    const storedLocale = getSafeLocale(
      window.localStorage.getItem(LOCALE_STORAGE_KEY),
    );

    setLocaleState(storedLocale);
    document.documentElement.lang = storedLocale;
  }, []);

  const setLocale = (nextLocale: AppLocale) => {
    setLocaleState(nextLocale);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    document.documentElement.lang = nextLocale;
  };

  const contextValue = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
    }),
    [locale],
  );

  return (
    <LocaleContext.Provider value={contextValue}>
      <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}

export function useAppLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useAppLocale must be used within I18nProvider");
  }

  return context;
}
