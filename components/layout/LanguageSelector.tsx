"use client";

import { useTranslations } from "next-intl";
import {
  LANGUAGE_LABELS,
  SUPPORTED_LOCALES,
  getSafeLocale,
} from "@/config/i18n";
import { useAppLocale } from "@/hooks/useAppLocale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

export default function LanguageSelector() {
  const { locale, setLocale } = useAppLocale();
  const navigation = useTranslations("navigation");

  return (
    <Select
      value={locale}
      onValueChange={(value) => setLocale(getSafeLocale(value))}
    >
      <SelectTrigger
        aria-label={navigation("changeLanguage")}
        className="h-10 w-[74px] rounded-xl border-[#E6E7EC] bg-white text-sm font-semibold uppercase shadow-none"
      >
        <span>{locale.toUpperCase()}</span>
      </SelectTrigger>
      <SelectContent align="end">
        {SUPPORTED_LOCALES.map((language) => (
          <SelectItem key={language} value={language}>
            {LANGUAGE_LABELS[language]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
