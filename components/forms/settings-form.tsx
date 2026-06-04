"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Info } from "lucide-react";

import {
  useGetGlobalSettings,
  useUpdateGlobalSettings,
} from "@/hooks/useGlobalSettings";

type SelectOption = {
  label: string;
  value: string;
};

const LANGUAGE_OPTIONS: SelectOption[] = [
  { label: "German", value: "de" },
  { label: "English", value: "en" },
  { label: "Urdu", value: "ur" },
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

export default function SettingsForm() {
  const { data } = useGetGlobalSettings();
  const { mutate, isPending } = useUpdateGlobalSettings();

  const [form, setForm] = useState<any>({
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

  useEffect(() => {
    if (!data) return;

    const { id, ...rest } = data;

    const nextForm = {
      ...form,
      ...rest,
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

  const updateField = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const toNumber = (value: any) => {
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

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-[48px] p-4 lg:p-[30px] bg-white rounded-[14px]">
      <div className="hidden lg:block lg:col-span-4 space-y-8 relative">
        <div className="flex items-center gap-[12px] cursor-pointer">
          <Info size={18} className="text-gray" />
          <span className="text-base font-semibold text-[#646982] group-hover:text-primary transition-colors">
            Tax Settings
          </span>
        </div>

        <div className="flex items-center gap-[12px] cursor-pointer absolute top-88">
          <Info size={18} className="text-gray" />
          <span className="text-base font-semibold text-[#646982] group-hover:text-primary transition-colors">
            Commission Settings
          </span>
        </div>

        <div className="flex items-center gap-[12px] cursor-pointer absolute top-143">
          <Info size={18} className="text-gray" />
          <span className="text-base font-semibold text-[#646982] group-hover:text-primary transition-colors">
            Currency Settings
          </span>
        </div>

        <div className="flex items-center gap-[12px] cursor-pointer absolute bottom-143">
          <Info size={18} className="text-gray" />
          <span className="text-base font-semibold text-[#646982] group-hover:text-primary transition-colors">
            Localization Settings
          </span>
        </div>

        <div className="flex items-center gap-[12px] cursor-pointer absolute bottom-70">
          <Info size={18} className="text-gray" />
          <span className="text-base font-semibold text-[#646982] group-hover:text-primary transition-colors">
            Branding (Quick Setup)
          </span>
        </div>
      </div>

      <div className="lg:col-span-8 space-y-[48px]">
        <section className="space-y-[24px]">
          <div className="space-y-[6px]">
            <Label>Global Tax %</Label>
            <p className="text-sm text-gray mb-2">
              Set the default tax percentage applied to transactions across the
              platform.
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
            <Label>VAT/GST handling rules</Label>
            <p className="text-sm text-gray">
              Choose how VAT/GST should be calculated and displayed system-wide.
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
                <Label>Prices are inclusive of tax</Label>
              </div>

              <div className="flex items-center gap-3">
                <RadioGroupItem value="exclusive" />
                <Label>Prices are exclusive of tax</Label>
              </div>

              <div className="flex items-center gap-3">
                <RadioGroupItem value="completed" />
                <Label>Tax applies only to completed transactions</Label>
              </div>
            </RadioGroup>
          </div>
        </section>

        <section className="space-y-[24px]">
          <FormGroup
            label="Default Commission (%)"
            placeholder="Add Percentage"
            prefix="%"
            value={form.defaultCommissionPercentage}
            onChange={(value: any) =>
              updateField("defaultCommissionPercentage", value)
            }
          />

          <FormGroup
            label="Default Hybrid Fee (%)"
            placeholder="Add Percentage"
            prefix="%"
            value={form.defaultHybridFeePercentage}
            onChange={(value: any) =>
              updateField("defaultHybridFeePercentage", value)
            }
          />
        </section>

        <section className="space-y-[24px]">
          <div className="space-y-[6px]">
            <Label>Default Platform Currency</Label>
            <p className="text-sm text-gray mb-2">
              This currency will be used as the default for all monetary values.
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
                  <SelectValue placeholder="Select Currency" />
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
            <Label>Currency Display Format</Label>

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
            label="Default Platform Language"
            type="select"
            placeholder="Select Language"
            value={form.defaultLanguage}
            options={LANGUAGE_OPTIONS}
            onChange={(value: any) => updateField("defaultLanguage", value)}
          />

          <div className="space-y-[12px]">
            <Label>Date Format</Label>

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
            label="Timezone"
            type="select"
            placeholder="Select Timezone"
            value={form.timezone}
            options={TIMEZONE_OPTIONS}
            onChange={(value: any) => updateField("timezone", value)}
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
            label="Font Selection (Optional)"
            type="select"
            placeholder="Select font"
            value={form.fontFamily}
            options={FONT_OPTIONS}
            onChange={(value: any) => updateField("fontFamily", value)}
          />
        </section>

        <section className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button variant="outline" disabled={isPending}>
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="px-10 py-2 md:py-0"
          >
            {isPending ? "Saving..." : "Save & Activate"}
          </Button>
        </section>
      </div>
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
  value: any;
  onChange: (value: any) => void;
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