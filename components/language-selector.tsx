"use client";

import { Languages } from "lucide-react";
import { useTranslations } from "next-intl";
import { LANGUAGE_LABELS, SUPPORTED_LOCALES, getSafeLocale } from "@/config/i18n";
import { useAppLocale } from "@/hooks/useAppLocale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LanguageSelector() {
  const { locale, setLocale } = useAppLocale();
  const common = useTranslations("common");
  const navigation = useTranslations("navigation");

  return (
    <div className="flex items-center gap-2">
      <Languages className="size-5 text-primary" aria-hidden="true" />
      <Select
        value={locale}
        onValueChange={(value) => setLocale(getSafeLocale(value))}
      >
        <SelectTrigger
          aria-label={navigation("changeLanguage")}
          className="h-10 w-[126px] rounded-xl border-[#E6E7EC] bg-white text-sm shadow-none"
        >
          <SelectValue placeholder={common("language")} />
        </SelectTrigger>
        <SelectContent align="end">
          {SUPPORTED_LOCALES.map((language) => (
            <SelectItem key={language} value={language}>
              {LANGUAGE_LABELS[language]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
