"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Percent, Plus, Trash2 } from "lucide-react";
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
    <section className="space-y-[24px] rounded-[14px] bg-white p-4 lg:p-[30px]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-[6px]">
          <Label className="text-base font-semibold text-dark">
            {globalSettings("taxTypes")}
          </Label>
          <p className="text-sm leading-6 text-gray">
            {canManage
              ? globalSettings("taxTypesDescription")
              : globalSettings("taxTypesReadonlyDescription")}
          </p>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm text-gray">
          <Percent size={16} className="text-primary" />
          <span className="font-semibold text-dark">{activeCount}</span>
          {globalSettings("activeTaxTypes", { total: taxTypes.length })}
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-[12px] border border-dashed border-[#BBBBBB] bg-[#F9FAFB] p-5 text-sm text-gray">
          {globalSettings("loadingTaxTypes")}
        </div>
      ) : isError ? (
        <Alert variant="destructive">
          <AlertDescription>{globalSettings("taxTypesLoadFailed")}</AlertDescription>
        </Alert>
      ) : taxTypes.length === 0 ? (
        <div className="rounded-[12px] border border-dashed border-[#BBBBBB] bg-[#F9FAFB] p-5 text-sm text-gray">
          {globalSettings("noTaxTypes")}
        </div>
      ) : (
        <div className="space-y-4">
          {taxTypes.map((taxType, index) => (
            <div
              key={`${taxType.code || "tax-type"}-${index}`}
              className="rounded-[14px] border border-[#E5E7EB] bg-[#F9FAFB] p-4"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="rounded-[8px] bg-primary/10 px-2.5 py-1 text-primary">
                    {taxType.code || globalSettings("newTaxType")}
                  </Badge>
                  {taxType.isDefault ? (
                    <Badge className="rounded-[8px] bg-green/10 px-2.5 py-1 text-green">
                      {globalSettings("defaultTaxType")}
                    </Badge>
                  ) : null}
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-gray">
                    <Switch
                      checked={taxType.isActive}
                      disabled={!canManage}
                      onCheckedChange={(checked) => updateTaxType(index, { isActive: checked })}
                    />
                    {taxType.isActive ? common("active") : common("inactive")}
                  </label>

                  {canManage ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 rounded-[10px] px-3 text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => removeTaxType(index)}
                      disabled={taxTypes.length === 1}
                    >
                      <Trash2 size={15} />
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1.5fr_1fr_auto]">
                <TaxInput
                  label={globalSettings("taxTypeCode")}
                  value={taxType.code}
                  disabled={!canManage}
                  onChange={(value) => updateTaxType(index, { code: value.toUpperCase() })}
                />
                <TaxInput
                  label={globalSettings("taxTypeLabel")}
                  value={taxType.label}
                  disabled={!canManage}
                  onChange={(value) => updateTaxType(index, { label: value })}
                />
                <TaxInput
                  label={globalSettings("taxTypePercentage")}
                  value={String(taxType.percentage)}
                  type="number"
                  disabled={!canManage}
                  onChange={(value) => updateTaxType(index, { percentage: Number(value) })}
                />

                <div className="flex flex-col justify-end">
                  <Button
                    type="button"
                    variant={taxType.isDefault ? "primary" : "outline"}
                    className="h-[48px] rounded-[12px] px-4"
                    disabled={!canManage || taxType.isDefault}
                    onClick={() => markDefault(index)}
                  >
                    {taxType.isDefault
                      ? globalSettings("defaultTaxType")
                      : globalSettings("makeDefaultTaxType")}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {validationMessage ? (
        <Alert variant="destructive">
          <AlertCircle size={16} />
          <AlertDescription>{validationMessage}</AlertDescription>
        </Alert>
      ) : null}

      {canManage ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-[48px] rounded-[12px] px-5"
            onClick={addTaxType}
          >
            <Plus size={16} />
            {globalSettings("addTaxType")}
          </Button>
          <Button
            type="button"
            className="h-[48px] rounded-[12px] px-8"
            disabled={updateMutation.isPending || Boolean(validationMessage)}
            onClick={handleSave}
          >
            {updateMutation.isPending ? common("saving") : globalSettings("saveTaxTypes")}
          </Button>
        </div>
      ) : null}
    </section>
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
