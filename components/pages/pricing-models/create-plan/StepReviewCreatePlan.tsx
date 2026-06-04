"use client";

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

const pricingModelLabels: Record<PricingModelOption, string> = {
  HYBRID: "Hybrid",
  PLAN: "Monthly flat fee",
  COMMISSION: "Commission + cap",
};

const formatLabel = (value: string) => {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
};

const formatMoney = (value: string, currency: string) => {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "PKR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
};

export default function StepReviewCreatePlan({
  form,
}: StepReviewCreatePlanProps) {
  const selectedFeatures = Object.entries(form.features)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key);

  const termsPreviewUrl = form.termsDocumentPreviewUrl || form.termsDocumentUrl;

  return (
    <div className="w-full rounded-2xl bg-white px-7 py-9 shadow-sm lg:px-10">
      <div className="grid grid-cols-1 gap-y-8">
        <ReviewRow
          label="Pricing model"
          value={pricingModelLabels[form.pricingModel]}
        />

        <ReviewRow label="Plan name" value={form.name || "Not provided"} />

        <ReviewRow
          label="Billing interval"
          value={formatLabel(form.billingInterval)}
        />

        <ReviewRow
          label="Plan price"
          value={formatMoney(form.planPrice, form.currency)}
        />

        {form.pricingModel !== "PLAN" && (
          <>
            <ReviewRow
              label="Commission rate"
              value={`${form.commissionPercentage || 0}% per txn`}
              badge="danger"
            />

            <ReviewRow
              label="Cap"
              value={
                form.applyCommissionCap
                  ? `${formatMoney(
                      form.commissionCapAmount,
                      form.currency
                    )} / ${form.billingInterval.toLowerCase()}`
                  : "No cap"
              }
            />
          </>
        )}

        <ReviewRow
          label="VAT rate"
          value={
            form.vatEnabled
              ? `${form.vatPercentage || 0}% ${form.vatLabel || "Standard"}`
              : "Disabled"
          }
          badge={form.vatEnabled ? "neutral" : undefined}
        />

        <ReviewRow label="Payout cycle" value={formatLabel(form.payoutCycle)} />

        <ReviewRow
          label="Trial days"
          value={`${Number(form.trialDays || 0)} days`}
        />

        <ReviewRow label="Status" value="Active after creation" />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[220px_1fr]">
          <p className="text-base font-medium text-[#684848]">
            Included features
          </p>

          <div className="flex flex-wrap justify-start gap-3 md:justify-end">
            {selectedFeatures.length > 0 ? (
              selectedFeatures.map((feature) => (
                <span
                  key={feature}
                  className="rounded-full bg-slate-200 px-5 py-2 text-xs font-bold text-[#1F2328]"
                >
                  {formatLabel(feature)}
                </span>
              ))
            ) : (
              <span className="text-sm font-semibold text-slate-400">
                No features selected
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[220px_1fr]">
          <p className="text-base font-medium text-[#684848]">
            Terms document
          </p>

          <div className="text-left md:text-right">
            {termsPreviewUrl ? (
              <a
                href={termsPreviewUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-bold text-primary underline"
              >
                Preview uploaded PDF
              </a>
            ) : (
              <span className="text-sm font-semibold text-slate-400">
                Not uploaded
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