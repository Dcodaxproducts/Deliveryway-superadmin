"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useCreatePackagePlanCharge,
  useGetPackagePlanCharges,
  useUpdatePackagePlanCharge,
} from "@/hooks/usePackagePlans";
import type {
  CreatePackagePlanChargePayload,
  PackagePlanCharge,
  PackageSubscription,
} from "@/services/packagePlans";
import { useGlobalCurrency } from "@/hooks/useGlobalCurrency";
import { formatMoney } from "@/lib/currency";

type ChargeFormState = {
  type: "ONE_TIME" | "RECURRING";
  direction: "CHARGE" | "CREDIT";
  source: "CUSTOM" | "MODULE";
  moduleCode: string;
  title: string;
  description: string;
  amount: string;
  currency: string;
  appliesFrom: string;
};

type SubscriptionChargesModalProps = {
  open: boolean;
  subscription: PackageSubscription | null;
  onOpenChange: (open: boolean) => void;
};

const defaultForm: ChargeFormState = {
  type: "ONE_TIME",
  direction: "CHARGE",
  source: "CUSTOM",
  moduleCode: "",
  title: "",
  description: "",
  amount: "",
  currency: "PKR",
  appliesFrom: "",
};

const toIsoOrUndefined = (value: string) => {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00.000`);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const prettyLabel = (value?: string | null) =>
  String(value || "N/A")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

export function SubscriptionChargesModal({
  open,
  subscription,
  onOpenChange,
}: SubscriptionChargesModalProps) {
  const pricingModel = useTranslations("pricingModel");
  const common = useTranslations("common");
  const currency = useGlobalCurrency();
  const [form, setForm] = useState<ChargeFormState>(defaultForm);

  const chargesQuery = useGetPackagePlanCharges({
    subscriptionId: open ? subscription?.id : undefined,
    restaurantId: open && !subscription?.id ? subscription?.restaurantId || undefined : undefined,
    tenantId: open && !subscription?.id ? subscription?.tenantId || undefined : undefined,
    page: 1,
    limit: 100,
    sortBy: "createdAt",
    sortOrder: "DESC",
  });
  const createCharge = useCreatePackagePlanCharge();
  const updateCharge = useUpdatePackagePlanCharge();

  const charges = useMemo(() => {
    const response = chargesQuery.data;
    return Array.isArray(response?.data) ? response.data : [];
  }, [chargesQuery.data]);

  const isSubmitting = createCharge.isPending || updateCharge.isPending;

  useEffect(() => {
    if (!open) return;
    setForm({
      ...defaultForm,
      currency: subscription?.packagePlan?.currency || "PKR",
    });
  }, [open, subscription?.packagePlan?.currency]);

  const updateForm = <K extends keyof ChargeFormState>(key: K, value: ChargeFormState[K]) => {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === "source" && value === "MODULE") {
        next.direction = "CHARGE";
        if (!next.moduleCode) next.moduleCode = "POS";
        if (!next.title) next.title = "POS Module";
        if (!next.type) next.type = "RECURRING";
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!subscription) return;

    const payload: CreatePackagePlanChargePayload = {
      tenantId: subscription.tenantId || undefined,
      restaurantId: subscription.restaurantId || undefined,
      subscriptionId: subscription.id,
      type: form.type,
      direction: form.source === "MODULE" ? "CHARGE" : form.direction,
      source: form.source,
      moduleCode: form.source === "MODULE" ? form.moduleCode.trim().toUpperCase() : undefined,
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      amount: Number(form.amount),
      currency: form.currency.trim() || "PKR",
      appliesFrom: toIsoOrUndefined(form.appliesFrom),
    };

    await createCharge.mutateAsync(payload);
    setForm({ ...defaultForm, currency: form.currency });
  };

  if (!open) return null;

  const submitDisabled =
    isSubmitting ||
    !subscription ||
    !form.title.trim() ||
    !form.amount ||
    Number(form.amount) <= 0 ||
    (form.source === "MODULE" && !form.moduleCode.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex shrink-0 items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-dark">
              {pricingModel("charges.title")}
            </h2>
            <p className="mt-1 text-sm text-gray">
              {subscription?.restaurant?.name || subscription?.tenant?.name || subscription?.id}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex size-9 items-center justify-center rounded-lg text-gray transition hover:bg-gray-100 hover:text-primary"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <h3 className="text-base font-semibold text-dark">
                {pricingModel("charges.createTitle")}
              </h3>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label={pricingModel("charges.type")}>
                  <select value={form.type} onChange={(event) => updateForm("type", event.target.value as ChargeFormState["type"])} className="h-11 w-full rounded-lg border border-gray-100 bg-white px-4 text-sm text-dark outline-none transition focus:border-primary ">
                    <option value="ONE_TIME">{pricingModel("charges.oneTime")}</option>
                    <option value="RECURRING">{pricingModel("charges.recurring")}</option>
                  </select>
                </Field>
                <Field label={pricingModel("charges.source")}>
                  <select value={form.source} onChange={(event) => updateForm("source", event.target.value as ChargeFormState["source"])} className="h-11 w-full rounded-lg border border-gray-100 bg-white px-4 text-sm text-dark outline-none transition focus:border-primary ">
                    <option value="CUSTOM">{pricingModel("charges.custom")}</option>
                    <option value="MODULE">{pricingModel("charges.module")}</option>
                  </select>
                </Field>
                <Field label={pricingModel("charges.direction")}>
                  <select value={form.direction} onChange={(event) => updateForm("direction", event.target.value as ChargeFormState["direction"])} disabled={form.source === "MODULE"} className="h-11 w-full rounded-lg border border-gray-100 bg-white px-4 text-sm text-dark outline-none transition focus:border-primary  disabled:cursor-not-allowed disabled:opacity-60">
                    <option value="CHARGE">{pricingModel("charges.charge")}</option>
                    <option value="CREDIT">{pricingModel("charges.credit")}</option>
                  </select>
                </Field>
                <Field label={pricingModel("charges.moduleCode")}>
                  <input value={form.moduleCode} onChange={(event) => updateForm("moduleCode", event.target.value.toUpperCase())} disabled={form.source !== "MODULE"} placeholder="POS" className="h-11 w-full rounded-lg border border-gray-100 bg-white px-4 text-sm text-dark outline-none transition focus:border-primary  disabled:cursor-not-allowed disabled:opacity-60" />
                </Field>
                <Field label={pricingModel("charges.titleField")} className="sm:col-span-2">
                  <input value={form.title} onChange={(event) => updateForm("title", event.target.value)} className="h-11 w-full rounded-lg border border-gray-100 bg-white px-4 text-sm text-dark outline-none transition focus:border-primary " />
                </Field>
                <Field label={pricingModel("charges.amount")}>
                  <input type="number" min="0" value={form.amount} onChange={(event) => updateForm("amount", event.target.value)} className="h-11 w-full rounded-lg border border-gray-100 bg-white px-4 text-sm text-dark outline-none transition focus:border-primary " />
                </Field>
                <Field label={pricingModel("charges.currency")}>
                  <input value={form.currency} onChange={(event) => updateForm("currency", event.target.value.toUpperCase())} className="h-11 w-full rounded-lg border border-gray-100 bg-white px-4 text-sm text-dark outline-none transition focus:border-primary " />
                </Field>
                <Field label={pricingModel("charges.appliesFrom")}>
                  <input type="date" value={form.appliesFrom} onChange={(event) => updateForm("appliesFrom", event.target.value)} className="h-11 w-full rounded-lg border border-gray-100 bg-white px-4 text-sm text-dark outline-none transition focus:border-primary " />
                </Field>
                <Field label={pricingModel("charges.description")} className="sm:col-span-2">
                  <textarea value={form.description} onChange={(event) => updateForm("description", event.target.value)} rows={3} className="h-11 w-full rounded-lg border border-gray-100 bg-white px-4 text-sm text-dark outline-none transition focus:border-primary  h-auto py-3" />
                </Field>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitDisabled}
                className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {pricingModel("charges.save")}
              </button>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <h3 className="text-base font-semibold text-dark">
                {pricingModel("charges.activeCharges")}
              </h3>
              <div className="mt-4 space-y-3">
                {chargesQuery.isLoading || chargesQuery.isFetching ? (
                  <div className="flex items-center gap-2 py-10 text-sm text-gray">
                    <Loader2 size={16} className="animate-spin" />
                    {common("loading")}
                  </div>
                ) : charges.length === 0 ? (
                  <p className="py-8 text-sm text-gray">{pricingModel("charges.noCharges")}</p>
                ) : (
                  charges.map((charge) => (
                    <ChargeRow
                      key={charge.id}
                      charge={charge}
                      currency={currency}
                      cancelling={updateCharge.isPending}
                      onCancel={(id) => updateCharge.mutate({ id, payload: { status: "CANCELLED" } })}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, className = "", children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-semibold text-gray">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function ChargeRow({
  charge,
  currency,
  cancelling,
  onCancel,
}: {
  charge: PackagePlanCharge;
  currency: string;
  cancelling: boolean;
  onCancel: (id: string) => void;
}) {
  const pricingModel = useTranslations("pricingModel");
  const amount = Number(charge.amount || 0);
  const signedAmount = charge.direction === "CREDIT" ? -Math.abs(amount) : amount;

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-dark">{charge.title}</p>
          <p className="mt-1 text-xs text-gray">
            {prettyLabel(charge.source)} · {prettyLabel(charge.type)} · {prettyLabel(charge.direction)}
            {charge.moduleCode ? ` · ${charge.moduleCode}` : ""}
          </p>
          {charge.description ? <p className="mt-2 text-xs text-gray">{charge.description}</p> : null}
        </div>
        <div className="text-right">
          <p className={`text-sm font-bold ${charge.direction === "CREDIT" ? "text-green" : "text-dark"}`}>
            {formatMoney(signedAmount, charge.currency || currency)}
          </p>
          <p className="mt-1 text-xs text-gray">{prettyLabel(charge.status)}</p>
        </div>
      </div>
      {charge.status !== "CANCELLED" ? (
        <button
          type="button"
          disabled={cancelling}
          onClick={() => onCancel(charge.id)}
          className="mt-3 text-xs font-semibold text-primary transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pricingModel("charges.cancel")}
        </button>
      ) : null}
    </div>
  );
}
