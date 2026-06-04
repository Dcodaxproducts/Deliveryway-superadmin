"use client";

type PricingModelOption = "HYBRID" | "PLAN" | "COMMISSION";
type BillingInterval = "MONTHLY" | "YEARLY" | "WEEKLY" | "DAILY";
type PayoutCycle = "DAILY" | "WEEKLY" | "MONTHLY" | "MANUAL";
type CommissionChargeType = "PERCENTAGE" | "FIXED";

type ConfigurePlanForm = {
  pricingModel: PricingModelOption;
  name: string;
  description: string;
  currency: string;
  planPrice: string;
  billingInterval: BillingInterval;

  commissionChargeType: CommissionChargeType;
  commissionPercentage: string;
  commissionFixedFee: string;
  commissionCapAmount: string;
  applyCommissionCap: boolean;

  payoutCycle: PayoutCycle;
  trialDays: string;
};

type StepConfigurePlanProps = {
  form: ConfigurePlanForm;
  onChange: <K extends keyof ConfigurePlanForm>(
    key: K,
    value: ConfigurePlanForm[K]
  ) => void;
};

const labelClass =
  "text-xs font-semibold uppercase tracking-[0.06em] text-slate-500";

export default function StepConfigurePlan({
  form,
  onChange,
}: StepConfigurePlanProps) {
  const showCommissionFields = form.pricingModel !== "PLAN";
  const isFixedCommission = form.commissionChargeType === "FIXED";

  const handleCommissionTypeChange = (value: CommissionChargeType) => {
    onChange("commissionChargeType", value);

    if (value === "FIXED") {
      onChange("applyCommissionCap", false);
    }
  };

  return (
    <div className="w-full rounded-2xl bg-white px-7 py-9 shadow-sm lg:px-10">
      <h2 className="text-2xl font-bold text-[#1F2328]">Configure Plan</h2>

      <div className="mt-8">
        <h3 className="text-base font-bold text-[#1F2328]">Plan identity</h3>
        <p className="mt-1 text-sm text-[#684848]">
          Define the naming conventions for this subscription tier.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-5">
          <div>
            <label className={labelClass}>Plan name</label>
            <input
              value={form.name}
              onChange={(event) => onChange("name", event.target.value)}
              placeholder="e.g. Enterprise Plus"
              className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-primary"
            />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={form.description}
              onChange={(event) => onChange("description", event.target.value)}
              placeholder="Short description for this package plan"
              rows={3}
              className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary"
            />
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h3 className="text-base font-bold text-[#1F2328]">Subscription</h3>
        <p className="mt-1 text-sm text-[#684848]">
          Configure plan price, currency, and billing interval.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          <div>
            <label className={labelClass}>Plan price</label>
            <input
              type="number"
              min="0"
              value={form.planPrice}
              onChange={(event) => onChange("planPrice", event.target.value)}
              placeholder="0.00"
              className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-primary"
            />
          </div>

          <div>
            <label className={labelClass}>Currency</label>
            <select
              value={form.currency}
              onChange={(event) => onChange("currency", event.target.value)}
              className="mt-2 h-12 w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-primary"
            >
              <option value="PKR">PKR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="AED">AED</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Billing cycle</label>
            <select
              value={form.billingInterval}
              onChange={(event) =>
                onChange(
                  "billingInterval",
                  event.target.value as BillingInterval
                )
              }
              className="mt-2 h-12 w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-primary"
            >
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
              <option value="WEEKLY">Weekly</option>
              <option value="DAILY">Daily</option>
            </select>
          </div>
        </div>
      </div>

      {showCommissionFields && (
        <div className="mt-10 rounded-2xl bg-slate-100 px-6 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#1F2328]">
                Commission & Limits
              </h3>
              <p className="mt-1 text-sm text-[#684848]">
                Configure flat fee or percentage-based transactional charges.
              </p>
            </div>

            <button
              type="button"
              disabled={isFixedCommission}
              onClick={() =>
                onChange("applyCommissionCap", !form.applyCommissionCap)
              }
              className={`flex items-center gap-3 ${
                isFixedCommission
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer"
              }`}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-500">
                Apply cap
              </span>

              <span
                className={`
                  flex h-7 w-12 items-center rounded-full p-1 transition
                  ${
                    form.applyCommissionCap && !isFixedCommission
                      ? "bg-primary"
                      : "bg-slate-300"
                  }
                `}
              >
                <span
                  className={`
                    size-5 rounded-full bg-white transition
                    ${
                      form.applyCommissionCap && !isFixedCommission
                        ? "translate-x-5"
                        : ""
                    }
                  `}
                />
              </span>
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className={labelClass}>Fixed Fee / % Per Order</label>

              <div className="mt-2 flex h-12 overflow-hidden rounded-lg border border-slate-200 bg-white transition focus-within:border-primary">
                <select
                  value={form.commissionChargeType}
                  onChange={(event) =>
                    handleCommissionTypeChange(
                      event.target.value as CommissionChargeType
                    )
                  }
                  className="h-full w-[140px] cursor-pointer border-r border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition hover:bg-slate-100"
                >
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED">Fixed Fee</option>
                </select>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    isFixedCommission
                      ? form.commissionFixedFee
                      : form.commissionPercentage
                  }
                  onChange={(event) => {
                    if (isFixedCommission) {
                      onChange("commissionFixedFee", event.target.value);
                      return;
                    }

                    onChange("commissionPercentage", event.target.value);
                  }}
                  placeholder={
                    isFixedCommission ? "Add fixed fee" : "Add percentage"
                  }
                  className="h-full min-w-0 flex-1 px-4 text-sm outline-none"
                />

                <div className="flex h-full min-w-14 items-center justify-center border-l px-4 text-sm font-semibold text-slate-400">
                  {isFixedCommission ? form.currency || "PKR" : "%"}
                </div>
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                {isFixedCommission
                  ? "A fixed amount will be charged on each order."
                  : "A percentage commission will be charged on each order."}
              </p>
            </div>

            <div>
              <label className={labelClass}>Max cap amount</label>
              <input
                type="number"
                min="0"
                disabled={!form.applyCommissionCap || isFixedCommission}
                value={form.commissionCapAmount}
                onChange={(event) =>
                  onChange("commissionCapAmount", event.target.value)
                }
                placeholder="500.00"
                className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              />

              <p className="mt-2 text-xs leading-5 text-slate-400">
                {isFixedCommission
                  ? "Cap is not applicable for fixed fee per order."
                  : "Optional maximum commission cap for percentage-based orders."}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className={labelClass}>Payout cycle</label>
          <select
            value={form.payoutCycle}
            onChange={(event) =>
              onChange("payoutCycle", event.target.value as PayoutCycle)
            }
            className="mt-2 h-12 w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-primary"
          >
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="MANUAL">Manual</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Trial days</label>
          <input
            type="number"
            min="0"
            value={form.trialDays}
            onChange={(event) => onChange("trialDays", event.target.value)}
            placeholder="0"
            className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-primary"
          />
        </div>
      </div>
    </div>
  );
}