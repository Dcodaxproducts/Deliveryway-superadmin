"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import Container from "@/components/container";
import { StepSelectPricingModel } from "@/components/pages/pricing-models/create-plan/StepSelectPricingModel";
import { StepConfigurePlan } from "@/components/pages/pricing-models/create-plan/StepConfigurePlan";
import { StepFeaturesVat } from "@/components/pages/pricing-models/create-plan/StepFeaturesVat";
import { StepReviewCreatePlan } from "@/components/pages/pricing-models/create-plan/StepReviewCreatePlan";

import {
  useCreatePackagePlan,
  useGetPackagePlanDetail,
  useGetPackagePlanFeatureCatalog,
  useUpdatePackagePlan,
} from "@/hooks/usePackagePlans";
import { useGetGlobalSettings } from "@/hooks/useGlobalSettings";

import type {
  CreatePackagePlanPayload,
  UpdatePackagePlanPayload,
} from "@/services/packagePlans";

type Step = 1 | 2 | 3 | 4;

type PricingModelOption = "HYBRID" | "PLAN" | "COMMISSION";
type BillingInterval = "MONTHLY" | "YEARLY" | "WEEKLY" | "DAILY";
type PayoutCycle = "DAILY" | "WEEKLY" | "MONTHLY" | "MANUAL";
type CommissionChargeType = "PERCENTAGE" | "FIXED";

type PlanFormState = {
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

type ConfigurePlanForm = Pick<
  PlanFormState,
  | "pricingModel"
  | "name"
  | "description"
  | "currency"
  | "planPrice"
  | "billingInterval"
  | "commissionChargeType"
  | "commissionPercentage"
  | "commissionFixedFee"
  | "commissionCapAmount"
  | "applyCommissionCap"
  | "payoutCycle"
  | "trialDays"
>;

type FeaturesVatForm = Pick<
  PlanFormState,
  | "features"
  | "vatEnabled"
  | "vatPercentage"
  | "vatLabel"
  | "payoutCycle"
  | "termsDocumentUrl"
  | "termsDocumentPreviewUrl"
>;

type PackagePlanDetail = {
  id?: string;
  name?: string | null;
  description?: string | null;
  billingModel?: string | null;
  billingInterval?: string | null;
  planPrice?: string | number | null;

  commissionType?: string | null;
  commissionPercentage?: string | number | null;
  commissionFixedAmount?: string | number | null;
  commissionCapAmount?: string | number | null;

  vatPercentage?: string | number | null;
  payoutCycle?: string | null;
  termsDocumentUrl?: string | null;
  currency?: string | null;
  trialDays?: string | number | null;
  features?: Record<string, boolean> | null;
  isActive?: boolean | null;
  isDefault?: boolean | null;
};

type ExtendedPackagePlanPayload = (
  | CreatePackagePlanPayload
  | UpdatePackagePlanPayload
) & {
  commissionType?: CommissionChargeType;
  commissionFixedAmount?: number;
};

const steps = [
  { value: 1, labelKey: "steps.selectType" },
  { value: 2, labelKey: "steps.configure" },
  { value: 3, labelKey: "steps.featuresVat" },
  { value: 4, labelKey: "steps.review" },
] as const;

const defaultFeatures: Record<string, boolean> = {
  orderManagement: true,
  customerAnalytics: false,
  posCashRegister: false,
  multiBranches: false,
  tableBooking: false,
  mobileApp: false,
  prioritySupport: true,
  selfDelivery: false,
  chat: false,
  takeAway: false,
  adminDelivery: false,
};

const defaultForm: PlanFormState = {
  pricingModel: "HYBRID",
  name: "",
  description: "",
  currency: "PKR",
  planPrice: "0",
  billingInterval: "MONTHLY",

  commissionChargeType: "PERCENTAGE",
  commissionPercentage: "2.5",
  commissionFixedFee: "0",
  commissionCapAmount: "500",
  applyCommissionCap: true,

  vatEnabled: true,
  vatPercentage: "20",
  vatLabel: "Standard Rate",
  payoutCycle: "MONTHLY",
  termsDocumentUrl: "",
  termsDocumentPreviewUrl: "",
  trialDays: "0",
  features: defaultFeatures,
  isActive: true,
  isDefault: false,
};

const toNumber = (value: string, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toSafeString = (value: unknown, fallback = "") => {
  if (value === undefined || value === null) return fallback;
  return String(value);
};

const scrollToTop = () => {
  if (typeof window === "undefined") return;

  window.requestAnimationFrame(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
};

const normalizePricingModel = (value?: string | null): PricingModelOption => {
  if (value === "COMMISSION") return "COMMISSION";

  if (value === "PLAN" || value === "FIXED" || value === "FIXED_MONTHLY") {
    return "PLAN";
  }

  return "HYBRID";
};

const normalizeBillingInterval = (value?: string | null): BillingInterval => {
  if (value === "YEARLY") return "YEARLY";
  if (value === "WEEKLY") return "WEEKLY";
  if (value === "DAILY") return "DAILY";

  return "MONTHLY";
};

const normalizePayoutCycle = (value?: string | null): PayoutCycle => {
  if (value === "DAILY") return "DAILY";
  if (value === "WEEKLY") return "WEEKLY";
  if (value === "MANUAL") return "MANUAL";

  return "MONTHLY";
};

const normalizeCommissionChargeType = (
  value?: string | null,
  fixedAmountValue?: string | number | null
): CommissionChargeType => {
  if (value === "FIXED") return "FIXED";
  if (value === "PERCENTAGE") return "PERCENTAGE";

  const fixedAmount = Number(fixedAmountValue ?? 0);

  if (Number.isFinite(fixedAmount) && fixedAmount > 0) {
    return "FIXED";
  }

  return "PERCENTAGE";
};

const unwrapPackagePlanDetail = (
  response: unknown
): PackagePlanDetail | null => {
  if (!response || typeof response !== "object") return null;

  const record = response as Record<string, unknown>;

  if (
    record.data &&
    typeof record.data === "object" &&
    !Array.isArray(record.data)
  ) {
    return record.data as PackagePlanDetail;
  }

  return record as PackagePlanDetail;
};

const mapPackagePlanToForm = (plan: PackagePlanDetail): PlanFormState => {
  const commissionCapAmount = toSafeString(plan.commissionCapAmount, "0");
  const vatPercentage = toSafeString(plan.vatPercentage, "0");
  const fixedAmountValue = plan.commissionFixedAmount ?? "0";

  return {
    pricingModel: normalizePricingModel(plan.billingModel),
    name: toSafeString(plan.name),
    description: toSafeString(plan.description),
    currency: toSafeString(plan.currency, "PKR"),
    planPrice: toSafeString(plan.planPrice, "0"),
    billingInterval: normalizeBillingInterval(plan.billingInterval),

    commissionChargeType: normalizeCommissionChargeType(
      plan.commissionType,
      fixedAmountValue
    ),
    commissionPercentage: toSafeString(plan.commissionPercentage, "0"),
    commissionFixedFee: toSafeString(fixedAmountValue, "0"),
    commissionCapAmount,
    applyCommissionCap: toNumber(commissionCapAmount) > 0,

    vatEnabled: toNumber(vatPercentage) > 0,
    vatPercentage,
    vatLabel: "Standard Rate",
    payoutCycle: normalizePayoutCycle(plan.payoutCycle),
    termsDocumentUrl: toSafeString(plan.termsDocumentUrl),
    termsDocumentPreviewUrl: "",
    trialDays: toSafeString(plan.trialDays, "0"),
    features: {
      ...defaultFeatures,
      ...(plan.features || {}),
    },
    isActive: Boolean(plan.isActive),
    isDefault: Boolean(plan.isDefault),
  };
};

function CreatePackagePlanContent() {
  const pricingModel = useTranslations("pricingModel");
  const validation = useTranslations("validation");
  const common = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();

  const planId = searchParams.get("id");
  const isEditMode = Boolean(planId);

  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<PlanFormState>(defaultForm);
  const [hydratedPlanId, setHydratedPlanId] = useState<string | null>(null);

  const createPackagePlan = useCreatePackagePlan();
  const updatePackagePlan = useUpdatePackagePlan();
  const globalSettingsQuery = useGetGlobalSettings();
  const featureCatalogQuery = useGetPackagePlanFeatureCatalog();
  const packagePlanDetailQuery = useGetPackagePlanDetail(planId || undefined);

  const selectedFeaturesCount = useMemo(() => {
    return Object.values(form.features).filter(Boolean).length;
  }, [form.features]);

  const isSubmitting =
    createPackagePlan.isPending || updatePackagePlan.isPending;

  useEffect(() => {
    const detail = unwrapPackagePlanDetail(packagePlanDetailQuery.data);

    if (!isEditMode || !planId || !detail || hydratedPlanId === planId) {
      return;
    }

    setForm(mapPackagePlanToForm(detail));
    setHydratedPlanId(planId);
  }, [hydratedPlanId, isEditMode, packagePlanDetailQuery.data, planId]);

  useEffect(() => {
    const defaultCurrency = globalSettingsQuery.data?.defaultCurrency;
    if (!isEditMode && defaultCurrency && form.currency === "PKR") {
      setForm((current) => ({ ...current, currency: defaultCurrency }));
    }
  }, [form.currency, globalSettingsQuery.data?.defaultCurrency, isEditMode]);

  useEffect(() => {
    return () => {
      if (form.termsDocumentPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(form.termsDocumentPreviewUrl);
      }
    };
  }, [form.termsDocumentPreviewUrl]);

  const updateForm = <K extends keyof PlanFormState>(
    key: K,
    value: PlanFormState[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateConfigureForm = <K extends keyof ConfigurePlanForm>(
    key: K,
    value: ConfigurePlanForm[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateFeaturesVatForm = <K extends keyof FeaturesVatForm>(
    key: K,
    value: FeaturesVatForm[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const goToStep = (nextStep: Step) => {
    setStep(nextStep);
    scrollToTop();
  };

  const buildPayload = (isActive: boolean): ExtendedPackagePlanPayload => {
    const isPlanOnly = form.pricingModel === "PLAN";
    const isFixedCommission =
      form.pricingModel === "COMMISSION" &&
      form.commissionChargeType === "FIXED";

    return {
      name: form.name.trim(),
      description: form.description.trim(),
      billingModel: form.pricingModel,
      billingInterval: form.billingInterval,
      planPrice: toNumber(form.planPrice),

      commissionType: isPlanOnly ? "PERCENTAGE" : form.commissionChargeType,
      commissionPercentage:
        isPlanOnly || isFixedCommission
          ? 0
          : toNumber(form.commissionPercentage),
      commissionFixedAmount: isFixedCommission
        ? toNumber(form.commissionFixedFee)
        : 0,
      commissionCapAmount:
        isPlanOnly || isFixedCommission || !form.applyCommissionCap
          ? 0
          : toNumber(form.commissionCapAmount),

      vatPercentage: form.vatEnabled ? toNumber(form.vatPercentage) : 0,
      payoutCycle: form.payoutCycle,
      termsDocumentUrl: form.termsDocumentUrl,
      currency: form.currency || globalSettingsQuery.data?.defaultCurrency || "PKR",
      trialDays: toNumber(form.trialDays),
      features: form.features,
      isActive,
      isDefault: form.isDefault,
    };
  };

  const validateStep = () => {
    if (step === 2 && !form.name.trim()) {
      toast.error(validation("planNameRequired"));
      return false;
    }

    if (
      step === 2 &&
      form.pricingModel === "COMMISSION" &&
      form.commissionChargeType === "FIXED" &&
      toNumber(form.commissionFixedFee) <= 0
    ) {
      toast.error(validation("fixedFeeGreaterThanZero"));
      return false;
    }

    if (
      step === 2 &&
      form.pricingModel !== "PLAN" &&
      form.commissionChargeType === "PERCENTAGE" &&
      toNumber(form.commissionPercentage) < 0
    ) {
      toast.error(validation("commissionPercentageNonNegative"));
      return false;
    }

    if (step === 3 && selectedFeaturesCount === 0) {
      toast.error(validation("selectAtLeastOneFeature"));
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;

    if (step < 4) {
      goToStep((step + 1) as Step);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      router.push("/pricing-model/plans-listing");
      return;
    }

    goToStep((step - 1) as Step);
  };

  const handleSubmitPlan = async (isDraft: boolean) => {
    if (!form.name.trim()) {
      toast.error(validation("planNameRequired"));
      goToStep(2);
      return;
    }

    if (
      form.pricingModel === "COMMISSION" &&
      form.commissionChargeType === "FIXED" &&
      toNumber(form.commissionFixedFee) <= 0
    ) {
      toast.error(validation("fixedFeeGreaterThanZero"));
      goToStep(2);
      return;
    }

    if (selectedFeaturesCount === 0) {
      toast.error(validation("selectAtLeastOneFeature"));
      goToStep(3);
      return;
    }

    try {
      const payload = buildPayload(!isDraft);

      if (isEditMode && planId) {
        await updatePackagePlan.mutateAsync({
          id: planId,
          payload,
        });
      } else {
        await createPackagePlan.mutateAsync(
          payload as CreatePackagePlanPayload
        );
      }

      router.push("/pricing-model/plans-listing");
    } catch {
      // Error toast is already handled inside mutation hooks.
    }
  };

  const title =
    step === 1
      ? pricingModel("create.steps.selectPricingModelTitle")
      : step === 2
      ? isEditMode
        ? pricingModel("actions.updatePlan")
        : pricingModel("create.configurePlan")
      : step === 3
      ? pricingModel("steps.featuresVat")
      : isEditMode
      ? pricingModel("create.steps.reviewUpdateTitle")
      : pricingModel("create.steps.reviewConfirmTitle");

  const description =
    step === 1
      ? pricingModel("create.steps.selectPricingModelDescription")
      : step === 2
      ? pricingModel("create.steps.configureDescription")
      : step === 3
      ? pricingModel("create.steps.featuresVatDescription")
      : "";

  const stepModeLabel =
    step === 1
      ? pricingModel("create.steps.stepOneOfFour")
      : isEditMode
      ? pricingModel("create.steps.editMode")
      : pricingModel("create.steps.configurationMode");

  if (isEditMode && packagePlanDetailQuery.isLoading) {
    return (
      <main className="min-h-screen bg-[#F4F4F5] px-5 py-8 lg:px-10 w-full">
        <section className="mx-auto w-full max-w-[1120px]">
          <div className="mb-8">
            <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-9 w-64 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-5 w-[420px] max-w-full animate-pulse rounded bg-slate-200" />
          </div>

          <div className="h-[420px] w-full max-w-[980px] animate-pulse rounded-2xl bg-white" />
        </section>
      </main>
    );
  }

  if (isEditMode && packagePlanDetailQuery.isError) {
    return (
      <main className="min-h-screen bg-[#F4F4F5] px-5 py-8 lg:px-10">
        <section className="mx-auto w-full max-w-[1120px]">
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-[#1F2328]">
              {pricingModel("create.failedToLoadPackagePlan")}
            </h1>

            <p className="mt-2 text-sm text-[#684848]">
              {pricingModel("create.failedToLoadPackagePlanDescription")}
            </p>

            <button
              type="button"
              onClick={() => router.push("/pricing-model/plans-listing")}
              className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white"
            >
              {pricingModel("actions.backToPlansListing")}
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <Container>
      <section className="mx-auto w-full">
        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase text-primary">
            {stepModeLabel}
          </p>

          <h1 className="text-[30px] font-bold leading-tight text-[#1F2328]">
            {title}
          </h1>

          {description && (
            <p className="mt-2 max-w-4xl text-sm leading-6 text-[#684848]">
              {description}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {steps.map((item) => {
              const isActive = step === item.value;
              const isCompleted = step > item.value;

              return (
                <div
                  key={item.value}
                  className={`
                    flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all
                    ${
                      isActive
                        ? "bg-primary text-white shadow-sm"
                        : isCompleted
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-transparent text-slate-400"
                    }
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <span>{item.value}.</span>
                  )}

                  <span>{pricingModel(item.labelKey)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {step === 1 && (
          <StepSelectPricingModel
            value={form.pricingModel}
            onChange={(value) => updateForm("pricingModel", value)}
          />
        )}

        {step === 2 && (
          <StepConfigurePlan form={form} onChange={updateConfigureForm} />
        )}

        {step === 3 && (
          <StepFeaturesVat
            form={form}
            featureCatalogData={featureCatalogQuery.data}
            onChange={updateFeaturesVatForm}
          />
        )}

        {step === 4 && <StepReviewCreatePlan form={form} />}

        <div className="mt-10 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="text-sm font-semibold text-[#7A4B4B] transition-colors hover:text-primary"
          >
            {step === 1
              ? pricingModel("actions.cancelSetup")
              : pricingModel("actions.backToConfiguration")}
          </button>

          <div className="flex items-center gap-4">
            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="min-w-[160px] rounded-xl bg-primary px-8 py-4 text-sm font-bold text-white shadow-lg shadow-red-900/10 transition hover:opacity-90"
              >
                {step === 3
                  ? pricingModel("actions.continueToReview")
                  : common("next")}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmitPlan(true)}
                  className="min-w-[150px] rounded-xl border border-primary bg-white px-6 py-4 text-sm font-bold text-primary transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pricingModel("actions.saveAsDraft")}
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmitPlan(false)}
                  className="min-w-[170px] rounded-xl bg-primary px-8 py-4 text-sm font-bold text-white shadow-lg shadow-red-900/10 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? isEditMode
                      ? pricingModel("actions.updating")
                      : pricingModel("actions.creating")
                    : isEditMode
                    ? pricingModel("actions.updatePlan")
                    : pricingModel("actions.createPlan")}
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </Container>
  );
}

export default function CreatePackagePlanPage() {
  return (
    <Suspense
      fallback={
        <Container>
          <section className="mx-auto w-full">
            <div className="mb-8">
              <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-9 w-64 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-5 w-[420px] max-w-full animate-pulse rounded bg-slate-200" />
            </div>
            <div className="h-[420px] w-full max-w-[980px] animate-pulse rounded-2xl bg-white" />
          </section>
        </Container>
      }
    >
      <CreatePackagePlanContent />
    </Suspense>
  );
}
