"use client";

import { useContext } from "react";
import { AppLocaleContext } from "@/components/providers/i18n-provider";

export function useAppLocale() {
  const context = useContext(AppLocaleContext);

  if (!context) {
    throw new Error("useAppLocale must be used within I18nProvider");
  }

  return context;
}
