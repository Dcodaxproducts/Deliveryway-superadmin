"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Info,
  Plus,
  Save,
  Trash2,
  ArrowDown,
  ArrowUp,
} from "lucide-react";

import {
  useGetGlobalSettings,
  useUpdateGlobalSettings,
} from "@/hooks/useGlobalSettings";
import { useUser } from "@/hooks/useAuth";
import { isSuperAdmin } from "@/lib/auth-role";
import { DEFAULT_DISPLAY_CURRENCY } from "@/lib/currency";
import { TaxTypesSection } from "@/components/forms/tax-types-section";
import { PremiumImageDropzone } from "@/components/forms/PremiumImageDropzone";
import { useFileUpload } from "@/hooks/useFileUpload";
import { getStorageViewUrl } from "@/services/storage";
import type { LandingPageFaq } from "@/services/globalSettings";
import { RestaurantPayoutConfigurationSection } from "@/components/forms/restaurant-payout-configuration-section";

type SelectOption = {
  label: string;
  value: string;
};

type SettingsFormValues = {
  globalTaxPercentage: string;
  vatHandlingRule: string;
  defaultCommissionPercentage: string;
  defaultHybridFeePercentage: string;
  defaultCurrency: string;
  currencyDisplayFormat: string;
  defaultLanguage: string;
  dateFormat: string;
  timezone: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  isTaxEnforced: boolean;
  isCommissionEnforced: boolean;
  isCurrencyEnforced: boolean;
  isLocalizationEnforced: boolean;
  landingPageSettings: {
    businessName: string;
    logoUrl: string;
    footerDescription: string;
    supportEmail: string;
    supportPhone: string;
    address: string;
    copyrightText: string;
    socialLinks: {
      facebook: string;
      twitter: string;
      instagram: string;
      youtube: string;
    };
    faqs: LandingPageFaq[];
  };
};

const LANGUAGE_OPTIONS: SelectOption[] = [
  { label: "German", value: "de" },
  { label: "English", value: "en" },
];

const TIMEZONE_OPTIONS: SelectOption[] = [
  { label: "Europe/Berlin", value: "Europe/Berlin" },
  { label: "Europe/Vienna", value: "Europe/Vienna" },
  { label: "Europe/Zurich", value: "Europe/Zurich" },
  { label: "Europe/London", value: "Europe/London" },
  { label: "Asia/Karachi", value: "Asia/Karachi" },
  { label: "UTC", value: "UTC" },
];

const FONT_OPTIONS: SelectOption[] = [
  { label: "Inter", value: "Inter" },
  { label: "Roboto", value: "Roboto" },
  { label: "Poppins", value: "Poppins" },
  { label: "Montserrat", value: "Montserrat" },
  { label: "Open Sans", value: "Open Sans" },
  { label: "Lato", value: "Lato" },
  { label: "Nunito Sans", value: "Nunito Sans" },
  { label: "Manrope", value: "Manrope" },
];

const CURRENCY_OPTIONS: Array<SelectOption & { symbol: string }> = [
  { label: "EUR", value: "EUR", symbol: "€" },
  { label: "USD", value: "USD", symbol: "$" },
  { label: "GBP", value: "GBP", symbol: "£" },
  { label: "PKR", value: "PKR", symbol: "₨" },
];

const getCurrencySymbol = (currency: string) => {
  return (
    CURRENCY_OPTIONS.find((item) => item.value === currency)?.symbol || "€"
  );
};

export function SettingsForm() {
  const globalSettings = useTranslations("globalSettings");
  const common = useTranslations("common");
  const { data } = useGetGlobalSettings();
  const { data: user } = useUser();
  const { mutate, isPending } = useUpdateGlobalSettings();
  const { uploadFile, uploading, progress } = useFileUpload();
  const [form, setForm] = useState<SettingsFormValues>({
    globalTaxPercentage: "",
    vatHandlingRule: "EXCLUSIVE",
    defaultCommissionPercentage: "",
    defaultHybridFeePercentage: "",
    defaultCurrency: DEFAULT_DISPLAY_CURRENCY,
    currencyDisplayFormat: "AMOUNT_CODE",
    defaultLanguage: "de",
    dateFormat: "DD_MM_YYYY",
    timezone: "Europe/Berlin",
    primaryColor: "#FF6B00",
    secondaryColor: "#1F2937",
    fontFamily: "Inter",
    isTaxEnforced: false,
    isCommissionEnforced: false,
    isCurrencyEnforced: false,
    isLocalizationEnforced: false,
    landingPageSettings: {
      businessName: "DeliveryWay",
      logoUrl: "",
      footerDescription: "",
      supportEmail: "",
      supportPhone: "",
      address: "",
      copyrightText: "",
      socialLinks: {
        facebook: "",
        twitter: "",
        instagram: "",
        youtube: "",
      },
      faqs: [],
    },
  });

  const [currencyFormat, setCurrencyFormat] = useState("suffix");
  const [dateFormat, setDateFormat] = useState("dd/mm/yyyy");
  const [landingLogoPreview, setLandingLogoPreview] = useState("");
  useEffect(() => {
    if (!data) return;

    const { id: _id, ...rest } = data;

    const nextForm: SettingsFormValues = {
      ...form,
      ...Object.fromEntries(
        Object.entries(rest).map(([key, value]) => [key, String(value)])
      ),
      isTaxEnforced: Boolean(rest.isTaxEnforced ?? form.isTaxEnforced),
      isCommissionEnforced: Boolean(
        rest.isCommissionEnforced ?? form.isCommissionEnforced
      ),
      isCurrencyEnforced: Boolean(
        rest.isCurrencyEnforced ?? form.isCurrencyEnforced
      ),
      isLocalizationEnforced: Boolean(
        rest.isLocalizationEnforced ?? form.isLocalizationEnforced
      ),
      defaultCurrency: rest.defaultCurrency || DEFAULT_DISPLAY_CURRENCY,
      defaultLanguage: rest.defaultLanguage || "de",
      timezone: rest.timezone || "Europe/Berlin",
      fontFamily: rest.fontFamily || "Inter",
      dateFormat: rest.dateFormat || "DD_MM_YYYY",
      currencyDisplayFormat: rest.currencyDisplayFormat || "AMOUNT_CODE",
      landingPageSettings: {
        businessName:
          rest.landingPageSettings?.businessName ||
          form.landingPageSettings.businessName,
        logoUrl: rest.landingPageSettings?.logoUrl || "",
        footerDescription:
          rest.landingPageSettings?.footerDescription || "",
        supportEmail: rest.landingPageSettings?.supportEmail || "",
        supportPhone: rest.landingPageSettings?.supportPhone || "",
        address: rest.landingPageSettings?.address || "",
        copyrightText: rest.landingPageSettings?.copyrightText || "",
        socialLinks: {
          facebook: rest.landingPageSettings?.socialLinks.facebook || "",
          twitter: rest.landingPageSettings?.socialLinks.twitter || "",
          instagram: rest.landingPageSettings?.socialLinks.instagram || "",
          youtube: rest.landingPageSettings?.socialLinks.youtube || "",
        },
        faqs: (rest.landingPageSettings?.faqs ?? []).map((faq, index) => ({
          ...faq,
          sortOrder: index,
        })),
      },
    };

    setForm(nextForm);

    if (nextForm.currencyDisplayFormat === "SYMBOL_AMOUNT") {
      setCurrencyFormat("prefix");
    } else if (nextForm.currencyDisplayFormat === "AMOUNT_CODE") {
      setCurrencyFormat("suffix");
    } else {
      setCurrencyFormat("iso");
    }

    if (nextForm.dateFormat === "DD_MM_YYYY") {
      setDateFormat("dd/mm/yyyy");
    } else if (nextForm.dateFormat === "MM_DD_YYYY") {
      setDateFormat("mm/dd/yyyy");
    } else {
      setDateFormat("yyyy-mm-dd");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    const logoUrl = data?.landingPageSettings?.logoUrl;
    let isCurrent = true;

    if (!logoUrl) {
      setLandingLogoPreview("");
      return;
    }

    void getStorageViewUrl(logoUrl).then((viewUrl) => {
      if (isCurrent) setLandingLogoPreview(viewUrl);
    });

    return () => {
      isCurrent = false;
    };
  }, [data?.landingPageSettings?.logoUrl]);

  const updateField = <Key extends keyof SettingsFormValues>(
    key: Key,
    value: SettingsFormValues[Key]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toNumber = (value: string | number | null | undefined) => {
    if (value === "" || value === null || value === undefined) return 0;

    const numberValue = Number(value);

    return Number.isNaN(numberValue) ? 0 : numberValue;
  };

  const buildGlobalSettingsPayload = () => {
    return {
      globalTaxPercentage: toNumber(form.globalTaxPercentage),
      vatHandlingRule: form.vatHandlingRule,
      defaultCommissionPercentage: toNumber(form.defaultCommissionPercentage),
      defaultHybridFeePercentage: toNumber(form.defaultHybridFeePercentage),
      defaultCurrency: form.defaultCurrency,

      currencyDisplayFormat:
        currencyFormat === "prefix"
          ? "SYMBOL_AMOUNT"
          : currencyFormat === "suffix"
          ? "AMOUNT_CODE"
          : "CODE_AMOUNT",

      defaultLanguage: form.defaultLanguage,

      dateFormat:
        dateFormat === "dd/mm/yyyy"
          ? "DD_MM_YYYY"
          : dateFormat === "mm/dd/yyyy"
          ? "MM_DD_YYYY"
          : "YYYY_MM_DD",

      timezone: form.timezone,
      primaryColor: form.primaryColor,
      secondaryColor: form.secondaryColor,
      fontFamily: form.fontFamily,

      isTaxEnforced: form.isTaxEnforced,
      isCommissionEnforced: form.isCommissionEnforced,
      isCurrencyEnforced: form.isCurrencyEnforced,
      isLocalizationEnforced: form.isLocalizationEnforced,
      landingPageSettings: form.landingPageSettings,
    };
  };

  const handleSubmit = () => {
    mutate(buildGlobalSettingsPayload());
  };

  const handleLandingSettingsSubmit = () => {
    mutate({
      landingPageSettings: form.landingPageSettings,
    });
  };

  const updateLandingField = (
    key: keyof Omit<
      SettingsFormValues["landingPageSettings"],
      "socialLinks" | "faqs"
    >,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      landingPageSettings: {
        ...current.landingPageSettings,
        [key]: value,
      },
    }));
  };

  const updateLandingFaq = (
    id: string,
    updates: Partial<Omit<LandingPageFaq, "id">>,
  ) => {
    setForm((current) => ({
      ...current,
      landingPageSettings: {
        ...current.landingPageSettings,
        faqs: current.landingPageSettings.faqs.map((faq) =>
          faq.id === id ? { ...faq, ...updates } : faq,
        ),
      },
    }));
  };

  const addLandingFaq = () => {
    setForm((current) => {
      const nextIndex = current.landingPageSettings.faqs.length;
      const nextFaq: LandingPageFaq = {
        id: `faq-${Date.now()}-${nextIndex}`,
        questionEn: "",
        answerEn: "",
        questionDe: "",
        answerDe: "",
        isActive: true,
        sortOrder: nextIndex,
      };

      return {
        ...current,
        landingPageSettings: {
          ...current.landingPageSettings,
          faqs: [...current.landingPageSettings.faqs, nextFaq],
        },
      };
    });
  };

  const removeLandingFaq = (id: string) => {
    setForm((current) => ({
      ...current,
      landingPageSettings: {
        ...current.landingPageSettings,
        faqs: current.landingPageSettings.faqs
          .filter((faq) => faq.id !== id)
          .map((faq, index) => ({ ...faq, sortOrder: index })),
      },
    }));
  };

  const moveLandingFaq = (id: string, direction: -1 | 1) => {
    setForm((current) => {
      const faqs = [...current.landingPageSettings.faqs];
      const currentIndex = faqs.findIndex((faq) => faq.id === id);
      const nextIndex = currentIndex + direction;

      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= faqs.length) {
        return current;
      }

      [faqs[currentIndex], faqs[nextIndex]] = [
        faqs[nextIndex],
        faqs[currentIndex],
      ];

      return {
        ...current,
        landingPageSettings: {
          ...current.landingPageSettings,
          faqs: faqs.map((faq, index) => ({ ...faq, sortOrder: index })),
        },
      };
    });
  };

  const hasInvalidLandingFaq = form.landingPageSettings.faqs.some(
    (faq) =>
      !faq.questionEn.trim() ||
      !faq.answerEn.trim() ||
      !faq.questionDe.trim() ||
      !faq.answerDe.trim(),
  );

  const updateLandingSocialLink = (
    key: keyof SettingsFormValues["landingPageSettings"]["socialLinks"],
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      landingPageSettings: {
        ...current.landingPageSettings,
        socialLinks: {
          ...current.landingPageSettings.socialLinks,
          [key]: value,
        },
      },
    }));
  };

  const uploadLandingLogo = async (file: File) => {
    const logoUrl = await uploadFile(file);
    if (!logoUrl) return;

    updateLandingField("logoUrl", logoUrl);
    setLandingLogoPreview(await getStorageViewUrl(logoUrl));
  };

  const canManageTaxTypes = isSuperAdmin(user);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-[48px] p-4 lg:p-[30px] bg-white rounded-[14px]">
        <div className="hidden lg:block lg:col-span-4 space-y-8 relative">
          <div className="flex items-center gap-[12px] cursor-pointer">
            <Info size={18} className="text-gray" />
            <span className="text-base font-semibold text-[#646982] group-hover:text-primary transition-colors">
              {globalSettings("taxSettings")}
            </span>
          </div>

          <div className="flex items-center gap-[12px] cursor-pointer absolute top-88">
            <Info size={18} className="text-gray" />
            <span className="text-base font-semibold text-[#646982] group-hover:text-primary transition-colors">
              {globalSettings("commissionSettings")}
            </span>
          </div>

          <div className="flex items-center gap-[12px] cursor-pointer absolute top-143">
            <Info size={18} className="text-gray" />
            <span className="text-base font-semibold text-[#646982] group-hover:text-primary transition-colors">
              {globalSettings("currencySettings")}
            </span>
          </div>

          <div className="flex items-center gap-[12px] cursor-pointer absolute bottom-143">
            <Info size={18} className="text-gray" />
            <span className="text-base font-semibold text-[#646982] group-hover:text-primary transition-colors">
              {globalSettings("localizationSettings")}
            </span>
          </div>

          <div className="flex items-center gap-[12px] cursor-pointer absolute bottom-70">
            <Info size={18} className="text-gray" />
            <span className="text-base font-semibold text-[#646982] group-hover:text-primary transition-colors">
              {globalSettings("brandingQuickSetup")}
            </span>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-[48px]">
          <section className="space-y-[24px]">
          <div className="space-y-[6px]">
            <Label>{globalSettings("globalTax")}</Label>
            <p className="text-sm text-gray mb-2">
              {globalSettings("globalTaxDescription")}
            </p>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark font-medium">
                %
              </span>

              <Input
                type="number"
                value={form.globalTaxPercentage}
                onChange={(e) =>
                  updateField("globalTaxPercentage", e.target.value)
                }
                className="pl-8 border-[#BBBBBB] focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-[6px]">
            <Label>{globalSettings("vatRules")}</Label>
            <p className="text-sm text-gray">
              {globalSettings("vatRulesDescription")}
            </p>

            <RadioGroup
              value={(form.vatHandlingRule || "EXCLUSIVE").toLowerCase()}
              onValueChange={(val) =>
                updateField("vatHandlingRule", val.toUpperCase())
              }
              className="space-y-[24px]"
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem value="inclusive" />
                <Label>{globalSettings("pricesInclusive")}</Label>
              </div>

              <div className="flex items-center gap-3">
                <RadioGroupItem value="exclusive" />
                <Label>{globalSettings("pricesExclusive")}</Label>
              </div>

              <div className="flex items-center gap-3">
                <RadioGroupItem value="completed" />
                <Label>{globalSettings("taxCompleted")}</Label>
              </div>
            </RadioGroup>
          </div>
        </section>

        <section className="space-y-[24px]">
          <FormGroup
            label={globalSettings("defaultCommission")}
            placeholder={globalSettings("addPercentage")}
            prefix="%"
            value={form.defaultCommissionPercentage}
            onChange={(value) =>
              updateField("defaultCommissionPercentage", value)
            }
          />

          <FormGroup
            label={globalSettings("defaultHybridFee")}
            placeholder={globalSettings("addPercentage")}
            prefix="%"
            value={form.defaultHybridFeePercentage}
            onChange={(value) =>
              updateField("defaultHybridFeePercentage", value)
            }
          />
        </section>

        <section className="space-y-[24px]">
          <div className="space-y-[6px]">
            <Label>{globalSettings("defaultCurrency")}</Label>
            <p className="text-sm text-gray mb-2">
              {globalSettings("defaultCurrencyDescription")}
            </p>

            <Select
              value={form.defaultCurrency}
              onValueChange={(value) => updateField("defaultCurrency", value)}
            >
              <SelectTrigger className="h-[52px] border-[#BBBBBB]">
                <div className="flex items-center gap-2">
                  <span className="text-dark">
                    {getCurrencySymbol(form.defaultCurrency)}
                  </span>
                  <SelectValue placeholder={globalSettings("selectCurrency")} />
                </div>
              </SelectTrigger>

              <SelectContent>
                {CURRENCY_OPTIONS.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    <div className="flex items-center gap-2">
                      <span>{currency.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-[12px]">
            <Label>{globalSettings("currencyDisplayFormat")}</Label>

            <div className="grid grid-cols-3 gap-4">
              <FormatBtn
                label={`${getCurrencySymbol(form.defaultCurrency)}1,000.00`}
                active={currencyFormat === "prefix"}
                onClick={() => setCurrencyFormat("prefix")}
              />

              <FormatBtn
                label={`1,000.00 ${form.defaultCurrency}`}
                active={currencyFormat === "suffix"}
                onClick={() => setCurrencyFormat("suffix")}
              />

              <FormatBtn
                label={`${form.defaultCurrency} 1,000.00`}
                active={currencyFormat === "iso"}
                onClick={() => setCurrencyFormat("iso")}
              />
            </div>
          </div>
        </section>

        <section className="space-y-[24px]">
          <FormGroup
            label={globalSettings("defaultLanguage")}
            type="select"
            placeholder={globalSettings("selectLanguage")}
            value={form.defaultLanguage}
            options={LANGUAGE_OPTIONS}
            onChange={(value) => updateField("defaultLanguage", value)}
          />

          <div className="space-y-[12px]">
            <Label>{globalSettings("dateFormat")}</Label>

            <div className="grid grid-cols-3 gap-2">
              <FormatBtn
                label="DD/MM/YYYY"
                active={dateFormat === "dd/mm/yyyy"}
                onClick={() => setDateFormat("dd/mm/yyyy")}
              />

              <FormatBtn
                label="MM/DD/YYYY"
                active={dateFormat === "mm/dd/yyyy"}
                onClick={() => setDateFormat("mm/dd/yyyy")}
              />

              <FormatBtn
                label="YYYY-MM-DD"
                active={dateFormat === "yyyy-mm-dd"}
                onClick={() => setDateFormat("yyyy-mm-dd")}
              />
            </div>
          </div>

          <FormGroup
            label={globalSettings("timezone")}
            type="select"
            placeholder={globalSettings("selectTimezone")}
            value={form.timezone}
            options={TIMEZONE_OPTIONS}
            onChange={(value) => updateField("timezone", value)}
          />
        </section>

        <section className="space-y-[24px]">
          <div className="grid grid-cols-2 gap-[24px]">
            <Input
              value={form.primaryColor}
              onChange={(e) => updateField("primaryColor", e.target.value)}
            />

            <Input
              value={form.secondaryColor}
              onChange={(e) => updateField("secondaryColor", e.target.value)}
            />
          </div>

          <FormGroup
            label={globalSettings("fontSelection")}
            type="select"
            placeholder={globalSettings("selectFont")}
            value={form.fontFamily}
            options={FONT_OPTIONS}
            onChange={(value) => updateField("fontFamily", value)}
          />
        </section>

        <section className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button variant="outline" disabled={isPending}>
            {common("cancel")}
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="h-auto px-10 py-3"
          >
            {isPending ? common("saving") : globalSettings("saveActivate")}
          </Button>
        </section>
      </div>
      </div>

      <section className="rounded-[18px] border border-[#EAECF0] bg-white p-5 shadow-sm lg:p-7">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-dark">
            {globalSettings("landingPageSettings")}
          </h2>
          <p className="mt-1 text-sm text-gray">
            {globalSettings("landingPageSettingsDescription")}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <div>
            <Label>{globalSettings("landingLogo")}</Label>
            <div className="mt-2">
              <PremiumImageDropzone
                alt={globalSettings("landingLogo")}
                emptyHint={globalSettings("landingLogoHint")}
                emptyTitle={globalSettings("landingLogoUpload")}
                onFileSelect={uploadLandingLogo}
                onRemove={() => {
                  updateLandingField("logoUrl", "");
                  setLandingLogoPreview("");
                }}
                preview={landingLogoPreview}
                progress={progress}
                selectedText={globalSettings("landingLogoSelected")}
                uploading={uploading}
                uploadText={globalSettings("landingLogoUploading")}
                variant="logo"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <LandingInput
              label={globalSettings("landingBusinessName")}
              value={form.landingPageSettings.businessName}
              onChange={(value) => updateLandingField("businessName", value)}
            />
            <LandingInput
              label={globalSettings("landingSupportEmail")}
              value={form.landingPageSettings.supportEmail}
              onChange={(value) => updateLandingField("supportEmail", value)}
            />
            <LandingInput
              label={globalSettings("landingSupportPhone")}
              value={form.landingPageSettings.supportPhone}
              onChange={(value) => updateLandingField("supportPhone", value)}
            />
            <LandingInput
              label={globalSettings("landingAddress")}
              value={form.landingPageSettings.address}
              onChange={(value) => updateLandingField("address", value)}
            />
            <LandingInput
              label={globalSettings("landingFooterDescription")}
              value={form.landingPageSettings.footerDescription}
              onChange={(value) => updateLandingField("footerDescription", value)}
            />
            <LandingInput
              label={globalSettings("landingCopyright")}
              value={form.landingPageSettings.copyrightText}
              onChange={(value) => updateLandingField("copyrightText", value)}
            />
            {(["facebook", "twitter", "instagram", "youtube"] as const).map(
              (network) => (
                <LandingInput
                  key={network}
                  label={globalSettings(`landing${network[0].toUpperCase()}${network.slice(1)}`)}
                  value={form.landingPageSettings.socialLinks[network]}
                  onChange={(value) => updateLandingSocialLink(network, value)}
                />
              ),
            )}
          </div>
        </div>

        <div className="mt-8 border-t border-[#EAECF0] pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-dark">
                {globalSettings("landingFaqs")}
              </h3>
              <p className="mt-1 text-sm text-gray">
                {globalSettings("landingFaqsDescription")}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={addLandingFaq}
              className="w-full sm:w-auto"
            >
              <Plus size={16} />
              {globalSettings("addLandingFaq")}
            </Button>
          </div>

          <div className="mt-5 space-y-4">
            {form.landingPageSettings.faqs.length === 0 ? (
              <div className="rounded-[14px] border border-dashed border-[#D0D5DD] bg-[#F8FAFC] px-5 py-8 text-center text-sm text-gray">
                {globalSettings("noLandingFaqs")}
              </div>
            ) : (
              form.landingPageSettings.faqs.map((faq, index) => (
                <div
                  key={faq.id}
                  className="rounded-[16px] border border-[#EAECF0] bg-[#F8FAFC] p-4"
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">
                        {globalSettings("landingFaqNumber", {
                          number: index + 1,
                        })}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={faq.isActive}
                          onCheckedChange={(isActive) =>
                            updateLandingFaq(faq.id, { isActive })
                          }
                        />
                        <span className="text-sm text-gray">
                          {faq.isActive
                            ? globalSettings("landingFaqActive")
                            : globalSettings("landingFaqInactive")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={index === 0}
                        aria-label={globalSettings("moveLandingFaqUp")}
                        onClick={() => moveLandingFaq(faq.id, -1)}
                      >
                        <ArrowUp size={16} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={
                          index === form.landingPageSettings.faqs.length - 1
                        }
                        aria-label={globalSettings("moveLandingFaqDown")}
                        onClick={() => moveLandingFaq(faq.id, 1)}
                      >
                        <ArrowDown size={16} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={globalSettings("removeLandingFaq")}
                        onClick={() => removeLandingFaq(faq.id)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <FaqLanguageFields
                      languageLabel={globalSettings("landingFaqEnglish")}
                      questionLabel={globalSettings("landingFaqQuestion")}
                      answerLabel={globalSettings("landingFaqAnswer")}
                      question={faq.questionEn}
                      answer={faq.answerEn}
                      onQuestionChange={(questionEn) =>
                        updateLandingFaq(faq.id, { questionEn })
                      }
                      onAnswerChange={(answerEn) =>
                        updateLandingFaq(faq.id, { answerEn })
                      }
                    />
                    <FaqLanguageFields
                      languageLabel={globalSettings("landingFaqGerman")}
                      questionLabel={globalSettings("landingFaqQuestion")}
                      answerLabel={globalSettings("landingFaqAnswer")}
                      question={faq.questionDe}
                      answer={faq.answerDe}
                      onQuestionChange={(questionDe) =>
                        updateLandingFaq(faq.id, { questionDe })
                      }
                      onAnswerChange={(answerDe) =>
                        updateLandingFaq(faq.id, { answerDe })
                      }
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {hasInvalidLandingFaq ? (
            <p className="mt-3 text-sm text-red-600">
              {globalSettings("landingFaqRequired")}
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            variant="primary"
            onClick={handleLandingSettingsSubmit}
            disabled={isPending || uploading || hasInvalidLandingFaq}
            className="w-full shadow-sm active:scale-[0.98] sm:w-auto"
          >
            <Save size={16} />
            {isPending ? common("saving") : globalSettings("saveLandingSettings")}
          </Button>
        </div>
      </section>

      <RestaurantPayoutConfigurationSection />

      <TaxTypesSection canManage={canManageTaxTypes} />
    </div>
  );
}

function FormGroup({
  label,
  placeholder,
  type = "text",
  prefix,
  value,
  onChange,
  options = [],
}: {
  label: string;
  placeholder?: string;
  type?: "text" | "select";
  prefix?: string;
  value: string;
  onChange: (value: string) => void;
  options?: SelectOption[];
}) {
  return (
    <div className="space-y-[6px]">
      <Label>{label}</Label>

      {type === "select" ? (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="h-[52px] border-[#BBBBBB] focus:border-primary">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>

          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="relative">
          {prefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark font-medium">
              {prefix}
            </span>
          )}

          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`${
              prefix ? "pl-8" : ""
            } border-[#BBBBBB] focus:border-primary`}
          />
        </div>
      )}
    </div>
  );
}

function LandingInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function FaqLanguageFields({
  languageLabel,
  questionLabel,
  answerLabel,
  question,
  answer,
  onQuestionChange,
  onAnswerChange,
}: {
  languageLabel: string;
  questionLabel: string;
  answerLabel: string;
  question: string;
  answer: string;
  onQuestionChange: (value: string) => void;
  onAnswerChange: (value: string) => void;
}) {
  return (
    <div className="rounded-[14px] border border-[#EAECF0] bg-white p-4">
      <p className="mb-3 text-sm font-semibold text-dark">{languageLabel}</p>
      <div className="space-y-3">
        <div>
          <Label>{questionLabel}</Label>
          <Input
            value={question}
            onChange={(event) => onQuestionChange(event.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label>{answerLabel}</Label>
          <Textarea
            value={answer}
            onChange={(event) => onAnswerChange(event.target.value)}
            className="mt-1.5 min-h-24 bg-white"
          />
        </div>
      </div>
    </div>
  );
}

function FormatBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-[52px] text-xs lg:text-base rounded-[10px] border transition-all ${
        active ? "border-primary text-primary" : "border-[#BBBBBB] text-gray"
      }`}
    >
      {label}
    </button>
  );
}
