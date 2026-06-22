"use client";

import { useTranslations } from "next-intl";
import { useGlobalCurrency } from "@/hooks/useGlobalCurrency";
import { formatMoney } from "@/lib/currency";

type PricingModelOption = "HYBRID" | "PLAN" | "COMMISSION";
type BillingInterval = "MONTHLY" | "YEARLY" | "WEEKLY" | "DAILY";
type PayoutCycle = "DAILY" | "WEEKLY" | "MONTHLY" | "MANUAL";

type ReviewPlanForm = {
  pricingModel: PricingModelOption;
  name: string;
  description: string;
  currency: string;
  planPrice: string;
  billingInterval: BillingInterval;
  commissionPercentage: string;
  commissionCapAmount: string;
  applyCommissionCap: boolean;
  vatEnabled: boolean;
  vatPercentage: string;
  vatLabel: string;
  payoutCycle: PayoutCycle;
  termsDocumentUrl: string;
  termsDocumentPreviewUrl: string;
  trialDays: string;
  features: Record<string, boolean>;
  isActive: boolean;
  isDefault: boolean;
};

type StepReviewCreatePlanProps = {
  form: ReviewPlanForm;
};

const pricingModelLabelKeys: Record<PricingModelOption, string> = {
  HYBRID: "display.pricingModels.hybrid",
  PLAN: "display.pricingModels.monthlyFlatFee",
  COMMISSION: "display.pricingModels.commissionCap",
};

const billingIntervalLabelKeys: Record<BillingInterval, string> = {
  MONTHLY: "display.billingIntervals.monthly",
  YEARLY: "display.billingIntervals.yearly",
  WEEKLY: "display.billingIntervals.weekly",
  DAILY: "display.billingIntervals.daily",
};

const payoutCycleLabelKeys: Record<PayoutCycle, string> = {
  DAILY: "display.payoutCycles.daily",
  WEEKLY: "display.payoutCycles.weekly",
  MONTHLY: "display.payoutCycles.monthly",
  MANUAL: "display.payoutCycles.manual",
};

const featureLabelKeys: Record<string, string> = {
  orderManagement: "features.orderManagement",
  customerAnalytics: "features.customerAnalytics",
  posCashRegister: "features.posCashRegister",
  multiBranches: "features.multiBranches",
  tableBooking: "features.tableBooking",
  mobileApp: "features.mobileApp",
  prioritySupport: "features.prioritySupport",
  selfDelivery: "features.selfDelivery",
  chat: "features.chat",
  takeAway: "features.takeAway",
  adminDelivery: "features.adminDelivery",
};

export function StepReviewCreatePlan({
  form,
}: StepReviewCreatePlanProps) {
  const pricingModel = useTranslations("pricingModel");
  const currency = useGlobalCurrency();
  const selectedFeatures = Object.entries(form.features)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key);

  const termsPreviewUrl = form.termsDocumentPreviewUrl || form.termsDocumentUrl;

  return (
    <div className="w-full rounded-2xl bg-white px-7 py-9 shadow-sm lg:px-10">
      <div className="grid grid-cols-1 gap-y-8">
        <ReviewRow
          label={pricingModel("review.pricingModel")}
          value={pricingModel(pricingModelLabelKeys[form.pricingModel])}
        />

        <ReviewRow
          label={pricingModel("fields.planName")}
          value={form.name || pricingModel("review.notProvided")}
        />

        <ReviewRow
          label={pricingModel("review.billingInterval")}
          value={pricingModel(billingIntervalLabelKeys[form.billingInterval])}
        />

        <ReviewRow
          label={pricingModel("fields.planPrice")}
          value={formatMoney(form.planPrice, currency)}
        />

        {form.pricingModel !== "PLAN" && (
          <>
            <ReviewRow
              label={pricingModel("review.commissionRate")}
              value={pricingModel("review.percentPerTransaction", {
                percent: form.commissionPercentage || 0,
              })}
              badge="danger"
            />

            <ReviewRow
              label={pricingModel("review.cap")}
              value={
                form.applyCommissionCap
                  ? pricingModel("review.amountPerInterval", {
                      amount: formatMoney(
                        form.commissionCapAmount,
                        currency
                      ),
                      interval: pricingModel(
                        billingIntervalLabelKeys[form.billingInterval]
                      ),
                    })
                  : pricingModel("review.noCap")
              }
            />
          </>
        )}

        <ReviewRow
          label={pricingModel("fields.vatRate")}
          value={
            form.vatEnabled
              ? pricingModel("review.vatRateValue", {
                  percent: form.vatPercentage || 0,
                  label: form.vatLabel || pricingModel("review.standard"),
                })
              : pricingModel("display.status.disabled")
          }
          badge={form.vatEnabled ? "neutral" : undefined}
        />

        <ReviewRow
          label={pricingModel("fields.payoutCycle")}
          value={pricingModel(payoutCycleLabelKeys[form.payoutCycle])}
        />

        <ReviewRow
          label={pricingModel("fields.trialDays")}
          value={pricingModel("review.days", {
            count: Number(form.trialDays || 0),
          })}
        />

        <ReviewRow
          label={pricingModel("review.status")}
          value={pricingModel("review.activeAfterCreation")}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[220px_1fr]">
          <p className="text-base font-medium text-[#684848]">
            {pricingModel("fields.includedFeatures")}
          </p>

          <div className="flex flex-wrap justify-start gap-3 md:justify-end">
            {selectedFeatures.length > 0 ? (
              selectedFeatures.map((feature) => (
                <span
                  key={feature}
                  className="rounded-full bg-slate-200 px-5 py-2 text-xs font-bold text-[#1F2328]"
                >
                  {featureLabelKeys[feature]
                    ? pricingModel(featureLabelKeys[feature])
                    : feature}
                </span>
              ))
            ) : (
              <span className="text-sm font-semibold text-slate-400">
                {pricingModel("review.noFeaturesSelected")}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[220px_1fr]">
          <p className="text-base font-medium text-[#684848]">
            {pricingModel("review.termsDocument")}
          </p>

          <div className="text-left md:text-right">
            {termsPreviewUrl ? (
              <a
                href={termsPreviewUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-bold text-primary underline"
              >
                {pricingModel("actions.previewUploadedPdf")}
              </a>
            ) : (
              <span className="text-sm font-semibold text-slate-400">
                {pricingModel("review.notUploaded")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewRow({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge?: "danger" | "neutral";
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[220px_1fr]">
      <p className="text-base font-medium text-[#684848]">{label}</p>

      <div className="text-left md:text-right">
        {badge ? (
          <span
            className={`
              inline-flex rounded-full px-4 py-2 text-sm font-bold
              ${
                badge === "danger"
                  ? "bg-red-100 text-primary"
                  : "bg-slate-200 text-[#1F2328]"
              }
            `}
          >
            {value}
          </span>
        ) : (
          <p className="text-base font-bold text-[#1F2328]">{value}</p>
        )}
      </div>
    </div>
  );
}
