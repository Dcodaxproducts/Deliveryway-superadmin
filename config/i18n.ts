export const SUPPORTED_LOCALES = ["en", "de"] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "en";

export const LANGUAGE_LABELS: Record<AppLocale, string> = {
  en: "English",
  de: "Deutsch",
};

export const LOCALE_STORAGE_KEY = "deliveryway-superadmin-locale";

export const isAppLocale = (
  value: string | null | undefined,
): value is AppLocale => {
  return SUPPORTED_LOCALES.some((locale) => locale === value);
};

export const getSafeLocale = (
  value: string | null | undefined,
): AppLocale => {
  return isAppLocale(value) ? value : DEFAULT_LOCALE;
};
