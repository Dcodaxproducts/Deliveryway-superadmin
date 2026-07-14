"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Percent,
  Plus,
  Save,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGetGlobalTaxTypes, useUpdateGlobalTaxTypes } from "@/hooks/useGlobalSettings";
import type { TaxType } from "@/types/global-settings";

type TaxTypesSectionProps = {
  canManage: boolean;
};

const CODE_PATTERN = /^[A-Za-z0-9_-]+$/;

const createTaxType = (): TaxType => ({
  code: "",
  label: "",
  percentage: 0,
  isActive: true,
  isDefault: false,
});

const normalizeTaxTypes = (taxTypes: TaxType[]) => {
  const next = taxTypes.map((taxType) => ({
    code: taxType.code.trim().toUpperCase(),
    label: taxType.label.trim(),
    percentage: Number(Number(taxType.percentage).toFixed(2)),
    isActive: Boolean(taxType.isActive),
    isDefault: Boolean(taxType.isDefault),
  }));

  if (!next.some((taxType) => taxType.isDefault) && next[0]) {
    next[0].isDefault = true;
  }

  return next.map((taxType, index) => ({
    ...taxType,
    isDefault: index === next.findIndex((item) => item.isDefault),
  }));
};

const getTaxTypesError = (taxTypes: TaxType[]) => {
  if (taxTypes.length === 0) {
    return "At least one tax type is required.";
  }

  const codes = taxTypes.map((taxType) => taxType.code.trim().toUpperCase());
  const duplicateCode = codes.find((code, index) => code && codes.indexOf(code) !== index);

  if (duplicateCode) {
    return `Duplicate tax type code: ${duplicateCode}`;
  }

  const invalidCode = taxTypes.find((taxType) => !CODE_PATTERN.test(taxType.code.trim()));

  if (invalidCode) {
    return `Tax code "${invalidCode.code || "empty"}" can only use letters, numbers, underscore, or hyphen.`;
  }

  const invalidPercentage = taxTypes.find((taxType) => {
    const value = Number(taxType.percentage);
    const hasMoreThanTwoDecimals = !Number.isInteger(value * 100);
    return !Number.isFinite(value) || value < 0 || value > 100 || hasMoreThanTwoDecimals;
  });

  if (invalidPercentage) {
    return "Tax percentages must be between 0 and 100 with max 2 decimals.";
  }

  return "";
};

export function TaxTypesSection({ canManage }: TaxTypesSectionProps) {
  const common = useTranslations("common");
  const globalSettings = useTranslations("globalSettings");
  const { data, isLoading, isError } = useGetGlobalTaxTypes();
  const updateMutation = useUpdateGlobalTaxTypes();
  const [taxTypes, setTaxTypes] = useState<TaxType[]>([]);

  useEffect(() => {
    setTaxTypes(data?.data ?? []);
  }, [data]);

  const validationMessage = useMemo(() => getTaxTypesError(taxTypes), [taxTypes]);
  const activeCount = taxTypes.filter((taxType) => taxType.isActive).length;

  const updateTaxType = (index: number, value: Partial<TaxType>) => {
    setTaxTypes((prev) =>
      prev.map((taxType, currentIndex) =>
        currentIndex === index ? { ...taxType, ...value } : taxType
      )
    );
  };

  const markDefault = (index: number) => {
    setTaxTypes((prev) =>
      prev.map((taxType, currentIndex) => ({
        ...taxType,
        isDefault: currentIndex === index,
      }))
    );
  };

  const addTaxType = () => {
    setTaxTypes((prev) => [
      ...prev,
      {
        ...createTaxType(),
        isDefault: prev.length === 0,
      },
    ]);
  };

  const removeTaxType = (index: number) => {
    setTaxTypes((prev) => normalizeTaxTypes(prev.filter((_, currentIndex) => currentIndex !== index)));
  };

  const handleSave = () => {
    const normalizedTaxTypes = normalizeTaxTypes(taxTypes);
    const error = getTaxTypesError(normalizedTaxTypes);

    if (error) {
      toast.error(error);
      return;
    }

    updateMutation.mutate({ taxTypes: normalizedTaxTypes });
  };

  return (
    <section className="overflow-hidden rounded-[18px] border border-[#EAECF0] bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-[#EAECF0] bg-gradient-to-r from-slate-50 to-white p-5 lg:flex-row lg:items-start lg:justify-between lg:p-7">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-primary/10 text-primary">
            <Percent size={22} />
          </div>
          <div className="space-y-1">
            <Label className="text-lg font-semibold text-dark">
              {globalSettings("taxTypes")}
            </Label>
            <p className="max-w-3xl text-sm leading-6 text-gray">
              {canManage
                ? globalSettings("taxTypesDescription")
                : globalSettings("taxTypesReadonlyDescription")}
            </p>
          </div>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-2 text-sm text-gray shadow-sm">
          <CheckCircle2 size={16} className="text-primary" />
          <span className="font-semibold text-dark">{activeCount}</span>
          {globalSettings("activeTaxTypes", { total: taxTypes.length })}
        </div>
      </div>

      <div className="space-y-5 p-5 lg:p-7">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-20 animate-pulse rounded-[16px] border border-[#EAECF0] bg-[#F8FAFC]"
              />
            ))}
          </div>
        ) : isError ? (
          <Alert variant="destructive" className="rounded-[14px]">
            <AlertCircle size={16} />
            <AlertDescription>{globalSettings("taxTypesLoadFailed")}</AlertDescription>
          </Alert>
        ) : taxTypes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[16px] border border-dashed border-[#D0D5DD] bg-[#F9FAFB] p-8 text-center">
            <Percent size={28} className="text-gray" />
            <p className="mt-3 text-sm font-medium text-dark">
              {globalSettings("noTaxTypes")}
            </p>
            {canManage ? (
              <Button
                type="button"
                variant="outline"
                className="mt-4 rounded-[12px] px-5"
                onClick={addTaxType}
              >
                <Plus size={16} />
                {globalSettings("addTaxType")}
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            {taxTypes.map((taxType, index) => (
              <div
                key={`${taxType.code || "tax-type"}-${index}`}
                className="rounded-[16px] border border-[#EAECF0] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.03)]"
              >
                <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                      {taxType.code || globalSettings("newTaxType")}
                    </Badge>
                    {taxType.isDefault ? (
                      <Badge className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                        <Star size={12} />
                        {globalSettings("defaultTaxType")}
                      </Badge>
                    ) : null}
                    <Badge
                      className={
                        taxType.isActive
                          ? "rounded-full bg-emerald-50 px-3 py-1 text-emerald-700"
                          : "rounded-full bg-slate-100 px-3 py-1 text-slate-500"
                      }
                    >
                      {taxType.isActive ? common("active") : common("inactive")}
                    </Badge>
                  </div>

                  {canManage ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="flex items-center gap-2 rounded-full border border-[#EAECF0] bg-[#F9FAFB] px-3 py-2 text-sm text-gray">
                        <Switch
                          checked={taxType.isActive}
                          onCheckedChange={(checked) =>
                            updateTaxType(index, { isActive: checked })
                          }
                        />
                        {taxType.isActive ? common("active") : common("inactive")}
                      </label>

                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 rounded-[12px] px-3 text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => removeTaxType(index)}
                        disabled={taxTypes.length === 1}
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  ) : null}
                </div>

                {canManage ? (
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.9fr_1.4fr_0.8fr_auto]">
                    <TaxInput
                      label={globalSettings("taxTypeCode")}
                      value={taxType.code}
                      disabled={false}
                      onChange={(value) =>
                        updateTaxType(index, { code: value.toUpperCase() })
                      }
                    />
                    <TaxInput
                      label={globalSettings("taxTypeLabel")}
                      value={taxType.label}
                      disabled={false}
                      onChange={(value) => updateTaxType(index, { label: value })}
                    />
                    <TaxInput
                      label={globalSettings("taxTypePercentage")}
                      value={String(taxType.percentage)}
                      type="number"
                      disabled={false}
                      onChange={(value) =>
                        updateTaxType(index, { percentage: Number(value) })
                      }
                    />

                    <div className="flex flex-col justify-end">
                      <Button
                        type="button"
                        variant={taxType.isDefault ? "primary" : "outline"}
                        className="h-11 rounded-[12px] px-4"
                        disabled={taxType.isDefault}
                        onClick={() => markDefault(index)}
                      >
                        <Star size={15} />
                        {taxType.isDefault
                          ? globalSettings("defaultTaxType")
                          : globalSettings("makeDefaultTaxType")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <ReadonlyValue
                      label={globalSettings("taxTypeCode")}
                      value={taxType.code || common("notAvailable")}
                    />
                    <ReadonlyValue
                      label={globalSettings("taxTypeLabel")}
                      value={taxType.label || common("notAvailable")}
                    />
                    <ReadonlyValue
                      label={globalSettings("taxTypePercentage")}
                      value={`${taxType.percentage}%`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {validationMessage ? (
          <Alert variant="destructive" className="rounded-[14px]">
            <AlertCircle size={16} />
            <AlertDescription>{validationMessage}</AlertDescription>
          </Alert>
        ) : null}

        {canManage ? (
          <div className="flex flex-col gap-3 border-t border-[#EAECF0] pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-[12px] px-5"
              onClick={addTaxType}
            >
              <Plus size={16} />
              {globalSettings("addTaxType")}
            </Button>
            <Button
              type="button"
              className="h-12 rounded-[12px] px-8"
              disabled={updateMutation.isPending || Boolean(validationMessage)}
              onClick={handleSave}
            >
              {updateMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {updateMutation.isPending ? common("saving") : globalSettings("saveTaxTypes")}
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ReadonlyValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-[6px]">
      <Label>{label}</Label>
      <div className="flex h-[48px] items-center rounded-[12px] border border-[#E5E7EB] bg-white px-3 text-sm text-dark">
        {value}
      </div>
    </div>
  );
}

function TaxInput({
  label,
  value,
  onChange,
  disabled,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  type?: "text" | "number";
}) {
  return (
    <div className="space-y-[6px]">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        disabled={disabled}
        min={type === "number" ? 0 : undefined}
        max={type === "number" ? 100 : undefined}
        step={type === "number" ? "0.01" : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="h-[48px] border-[#BBBBBB] bg-white focus:border-primary disabled:cursor-not-allowed disabled:opacity-70"
      />
    </div>
  );
}
