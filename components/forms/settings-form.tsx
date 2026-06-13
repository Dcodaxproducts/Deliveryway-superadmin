"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Banknote,
  CreditCard,
  Globe2,
  Info,
  Landmark,
  Smartphone,
  WalletCards,
} from "lucide-react";

import {
  useGetGlobalSettings,
  useUpdateGlobalSettings,
} from "@/hooks/useGlobalSettings";
import { useUser } from "@/hooks/useAuth";
import { isSuperAdmin } from "@/lib/auth-role";
import { TaxTypesSection } from "@/components/forms/tax-types-section";
import {
  useGlobalPaymentMethodsQuery,
  useUpdateGlobalPaymentMethodsMutation,
} from "@/hooks/useGlobalPaymentMethods";
import type { GlobalPaymentMethod } from "@/types/global-settings";

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

const formatPaymentMethodCode = (code: string) => {
  return code.replaceAll("_", " ");
};

const PAYMENT_METHOD_VISUALS: Record<
  string,
  {
    icon: typeof CreditCard;
    accent: string;
    surface: string;
  }
> = {
  COD: {
    icon: Banknote,
    accent: "text-emerald-700",
    surface: "bg-emerald-50",
  },
  CARD_ON_DELIVERY: {
    icon: CreditCard,
    accent: "text-sky-700",
    surface: "bg-sky-50",
  },
  STRIPE: {
    icon: CreditCard,
    accent: "text-violet-700",
    surface: "bg-violet-50",
  },
  PAYPAL: {
    icon: Globe2,
    accent: "text-blue-700",
    surface: "bg-blue-50",
  },
  EASYPAISA: {
    icon: Smartphone,
    accent: "text-lime-700",
    surface: "bg-lime-50",
  },
  JAZZCASH: {
    icon: Smartphone,
    accent: "text-rose-700",
    surface: "bg-rose-50",
  },
  BANK_TRANSFER: {
    icon: Landmark,
    accent: "text-slate-700",
    surface: "bg-slate-100",
  },
  WALLET: {
    icon: WalletCards,
    accent: "text-amber-700",
    surface: "bg-amber-50",
  },
};

const DEFAULT_PAYMENT_METHOD_VISUAL = {
  icon: CreditCard,
  accent: "text-primary",
  surface: "bg-primary/10",
};

const getPaymentMethodVisual = (code: string) => {
  return PAYMENT_METHOD_VISUALS[code.toUpperCase()] ?? DEFAULT_PAYMENT_METHOD_VISUAL;
};

export function SettingsForm() {
  const globalSettings = useTranslations("globalSettings");
  const common = useTranslations("common");
  const { data } = useGetGlobalSettings();
  const { data: user } = useUser();
  const { mutate, isPending } = useUpdateGlobalSettings();
  const {
    data: paymentMethodsResponse,
    isLoading: isPaymentMethodsLoading,
    isError: isPaymentMethodsError,
  } = useGlobalPaymentMethodsQuery();
  const {
    mutate: updatePaymentMethods,
    isPending: isPaymentMethodsPending,
  } = useUpdateGlobalPaymentMethodsMutation();

  const [form, setForm] = useState<SettingsFormValues>({
    globalTaxPercentage: "",
    vatHandlingRule: "EXCLUSIVE",
    defaultCommissionPercentage: "",
    defaultHybridFeePercentage: "",
    defaultCurrency: "EUR",
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
  });

  const [currencyFormat, setCurrencyFormat] = useState("suffix");
  const [dateFormat, setDateFormat] = useState("dd/mm/yyyy");
  const [paymentMethods, setPaymentMethods] = useState<GlobalPaymentMethod[]>(
    []
  );

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
      defaultCurrency: rest.defaultCurrency || "EUR",
      defaultLanguage: rest.defaultLanguage || "de",
      timezone: rest.timezone || "Europe/Berlin",
      fontFamily: rest.fontFamily || "Inter",
      dateFormat: rest.dateFormat || "DD_MM_YYYY",
      currencyDisplayFormat: rest.currencyDisplayFormat || "AMOUNT_CODE",
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
    const loadedMethods = paymentMethodsResponse?.data ?? [];

    setPaymentMethods(loadedMethods);
  }, [paymentMethodsResponse]);

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

  const handleSubmit = () => {
    const payload = {
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
    };

    mutate(payload);
  };

  const updatePaymentMethod = (
    code: string,
    value: Partial<Omit<GlobalPaymentMethod, "code">>
  ) => {
    setPaymentMethods((prev) =>
      prev.map((method) =>
        method.code === code ? { ...method, ...value } : method
      )
    );
  };

  const hasDuplicatePaymentMethods = () => {
    return new Set(paymentMethods.map((method) => method.code)).size !==
      paymentMethods.length;
  };

  const handlePaymentMethodsSave = () => {
    if (hasDuplicatePaymentMethods()) {
      return;
    }

    updatePaymentMethods({
      paymentMethods: paymentMethods.map((method) => ({
        code: method.code,
        label: method.label,
        isActive: method.isActive,
      })),
    });
  };

  const paymentMethodsValidationMessage = hasDuplicatePaymentMethods()
    ? globalSettings("duplicatePaymentMethods")
    : "";
  const activePaymentMethodsCount = paymentMethods.filter(
    (method) => method.isActive
  ).length;
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

      <section className="space-y-[24px] rounded-[14px] bg-white p-4 lg:p-[30px]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-[6px]">
            <Label className="text-base font-semibold text-dark">
              {globalSettings("platformPaymentMethods")}
            </Label>
            <p className="text-sm text-gray">
              {globalSettings("paymentMethodsDescription")}
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm text-gray">
            <span className="font-semibold text-dark">
              {activePaymentMethodsCount}
            </span>
            {globalSettings("activeCount", {
              total: paymentMethods.length,
            })}
          </div>
        </div>

        {isPaymentMethodsLoading ? (
          <div className="rounded-[12px] border border-dashed border-[#BBBBBB] bg-[#F9FAFB] p-5 text-sm text-gray">
            {globalSettings("loadingPaymentMethods")}
          </div>
        ) : isPaymentMethodsError ? (
          <Alert variant="destructive">
            <AlertDescription>
              {globalSettings("paymentMethodsLoadFailed")}
            </AlertDescription>
          </Alert>
        ) : paymentMethods.length === 0 ? (
          <div className="rounded-[12px] border border-dashed border-[#BBBBBB] bg-[#F9FAFB] p-5 text-sm text-gray">
            {globalSettings("noPaymentMethods")}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {paymentMethods.map((method) => {
              const visual = getPaymentMethodVisual(method.code);
              const MethodIcon = visual.icon;

              return (
                <div
                  key={method.code}
                  className={`group relative overflow-hidden rounded-[12px] border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)] ${
                    method.isActive
                      ? "border-primary/30 bg-white shadow-[0_12px_28px_rgba(255,107,0,0.08)]"
                      : "border-[#E5E7EB] bg-[#FAFAFB]"
                  }`}
                >
                  <div
                    className={`absolute inset-x-0 top-0 h-1 ${
                      method.isActive ? "bg-primary" : "bg-[#E5E7EB]"
                    }`}
                  />

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] ${visual.surface} ${visual.accent} ring-1 ring-black/[0.04]`}
                      >
                        <MethodIcon size={19} />
                      </div>

                      <div className="min-w-0 space-y-2">
                        <p className="truncate text-sm font-semibold text-dark">
                          {method.label || formatPaymentMethodCode(method.code)}
                        </p>
                        <Badge
                          variant="outline"
                          className="max-w-full rounded-[8px] border-[#D1D5DB] bg-white px-2 py-1 text-[10px] font-semibold tracking-normal text-[#4B5563]"
                        >
                          <span className="truncate">
                            {formatPaymentMethodCode(method.code)}
                          </span>
                        </Badge>
                      </div>
                    </div>

                    <Switch
                      checked={method.isActive}
                      onCheckedChange={(checked) =>
                        updatePaymentMethod(method.code, {
                          isActive: checked,
                        })
                      }
                    />
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 rounded-[10px] border border-[#EEF0F4] bg-[#F8FAFC] px-3 py-2">
                    <span className="text-xs font-medium text-gray">
                      {globalSettings("apiManagedCode")}
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        method.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {method.isActive ? common("active") : common("inactive")}
                    </span>
                  </div>

                  <div className="mt-4 space-y-[6px]">
                    <Label>{globalSettings("displayLabel")}</Label>
                    <Input
                      value={method.label}
                      onChange={(event) =>
                        updatePaymentMethod(method.code, {
                          label: event.target.value,
                        })
                      }
                      className="h-[46px] rounded-[10px] border-[#D6DAE2] bg-white focus:border-primary"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {paymentMethodsValidationMessage ? (
          <Alert variant="destructive">
            <AlertDescription>
              {paymentMethodsValidationMessage}
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="flex justify-end">
          <Button
            onClick={handlePaymentMethodsSave}
            disabled={
              isPaymentMethodsPending ||
              isPaymentMethodsLoading ||
              isPaymentMethodsError ||
              paymentMethods.length === 0 ||
              Boolean(paymentMethodsValidationMessage)
            }
            className="h-auto px-10 py-3"
          >
            {isPaymentMethodsPending
              ? common("saving")
              : globalSettings("savePaymentMethods")}
          </Button>
        </div>
      </section>

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
