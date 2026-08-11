"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Loader2,
  Save,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useGlobalPaymentMethodsQuery,
  useUpdateGlobalPaymentMethodsMutation,
} from "@/hooks/useGlobalPaymentMethods";
import type { GlobalPaymentMethod } from "@/types/global-settings";

type PlatformPaymentMethodsSectionProps = {
  canManage: boolean;
};

export function PlatformPaymentMethodsSection({
  canManage,
}: PlatformPaymentMethodsSectionProps) {
  const globalSettings = useTranslations("globalSettings");
  const common = useTranslations("common");
  const methodsQuery = useGlobalPaymentMethodsQuery();
  const updateMethods = useUpdateGlobalPaymentMethodsMutation();
  const [methods, setMethods] = useState<GlobalPaymentMethod[]>([]);

  useEffect(() => {
    setMethods(methodsQuery.data?.data ?? []);
  }, [methodsQuery.data]);

  const activeCount = useMemo(
    () => methods.filter((method) => method.isActive).length,
    [methods],
  );

  const updateMethod = (
    code: string,
    changes: Partial<Pick<GlobalPaymentMethod, "label" | "isActive">>,
  ) => {
    setMethods((current) =>
      current.map((method) =>
        method.code === code ? { ...method, ...changes } : method,
      ),
    );
  };

  return (
    <section className="overflow-hidden rounded-[18px] border border-[#EAECF0] bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-[#EAECF0] bg-gradient-to-r from-slate-50 to-white p-5 lg:flex-row lg:items-start lg:justify-between lg:p-7">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-primary/10 text-primary">
            <CreditCard size={22} aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-dark">
              {globalSettings("platformPaymentMethods")}
            </h2>
            <p className="max-w-3xl text-sm leading-6 text-gray">
              {globalSettings("paymentMethodsDescription")}
            </p>
          </div>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-2 text-sm text-gray shadow-sm">
          <CheckCircle2 size={16} className="text-primary" aria-hidden="true" />
          <span className="font-semibold text-dark">{activeCount}</span>
          {globalSettings("activeCount", { total: methods.length })}
        </div>
      </div>

      <div className="space-y-5 p-5 lg:p-7">
        <p className="rounded-[14px] border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-800">
          {globalSettings("onlinePaymentProviderHint")}
        </p>

        {methodsQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-20 animate-pulse rounded-[16px] border border-[#EAECF0] bg-[#F8FAFC]"
              />
            ))}
          </div>
        ) : methodsQuery.isError ? (
          <Alert variant="destructive" className="rounded-[14px]">
            <AlertCircle size={16} aria-hidden="true" />
            <AlertDescription>
              {globalSettings("paymentMethodsLoadFailed")}
            </AlertDescription>
          </Alert>
        ) : methods.length === 0 ? (
          <div className="rounded-[16px] border border-dashed border-[#D0D5DD] bg-[#F9FAFB] p-8 text-center text-sm text-gray">
            {globalSettings("noPaymentMethods")}
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {methods.map((method) => (
              <article
                key={method.code}
                className="rounded-[16px] border border-[#EAECF0] bg-white p-4 transition-colors hover:border-primary/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-dark">
                        {method.label}
                      </span>
                      <Badge variant="outline" className="font-mono text-xs">
                        {method.code}
                      </Badge>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`payment-method-${method.code}`}>
                        {globalSettings("displayLabel")}
                      </Label>
                      <Input
                        id={`payment-method-${method.code}`}
                        value={method.label}
                        disabled={!canManage}
                        onChange={(event) =>
                          updateMethod(method.code, {
                            label: event.target.value,
                          })
                        }
                        className="h-10 border-[#D0D5DD]"
                      />
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <Switch
                      checked={method.isActive}
                      disabled={!canManage}
                      aria-label={`${method.label}: ${
                        method.isActive ? "active" : "inactive"
                      }`}
                      onCheckedChange={(isActive) =>
                        updateMethod(method.code, { isActive })
                      }
                    />
                    <span
                      className={`text-xs font-medium ${
                        method.isActive ? "text-emerald-700" : "text-gray"
                      }`}
                    >
                      {method.isActive
                        ? globalSettings("paymentMethodActive")
                        : globalSettings("paymentMethodInactive")}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {canManage && methods.length > 0 ? (
          <div className="flex justify-end border-t border-[#EAECF0] pt-5">
            <Button
              type="button"
              variant="primary"
              onClick={() =>
                updateMethods.mutate({
                  paymentMethods: methods.map((method) => ({
                    ...method,
                    label: method.label.trim(),
                  })),
                })
              }
              disabled={
                updateMethods.isPending ||
                methods.some((method) => !method.label.trim())
              }
              className="w-full shadow-sm active:scale-[0.98] sm:w-auto"
            >
              {updateMethods.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save size={16} aria-hidden="true" />
              )}
              {updateMethods.isPending
                ? common("saving")
                : globalSettings("savePaymentMethods")}
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
