export type WizardStep = 1 | 2 | 3 | 4;
export type PricingModelOption = "HYBRID" | "PLAN" | "COMMISSION";
export type CommissionChargeType = "PERCENTAGE" | "FIXED";

export type PricingModelValidationKey =
  | "planPriceGreaterThanZero"
  | "fixedFeeGreaterThanZero"
  | "commissionPercentageGreaterThanZero";

export const getWizardStepState = (
  currentStep: WizardStep,
  candidateStep: WizardStep
) => ({
  isActive: currentStep === candidateStep,
  isCompleted: candidateStep < currentStep,
  isInteractive: candidateStep < currentStep,
});

export const getPricingModelFieldVisibility = (
  pricingModel: PricingModelOption
) => ({
  showSubscriptionFields: pricingModel !== "COMMISSION",
  showCommissionFields: pricingModel !== "PLAN",
});

export const getPricingModelValidationError = (input: {
  pricingModel: PricingModelOption;
  planPrice: number;
  commissionChargeType: CommissionChargeType;
  commissionPercentage: number;
  commissionFixedFee: number;
}): PricingModelValidationKey | null => {
  const { showSubscriptionFields, showCommissionFields } =
    getPricingModelFieldVisibility(input.pricingModel);

  if (showSubscriptionFields && input.planPrice <= 0) {
    return "planPriceGreaterThanZero";
  }

  if (!showCommissionFields) return null;

  if (
    input.commissionChargeType === "FIXED" &&
    input.commissionFixedFee <= 0
  ) {
    return "fixedFeeGreaterThanZero";
  }

  if (
    input.commissionChargeType === "PERCENTAGE" &&
    input.commissionPercentage <= 0
  ) {
    return "commissionPercentageGreaterThanZero";
  }

  return null;
};

export const getPricingModelPayloadAmounts = (input: {
  pricingModel: PricingModelOption;
  planPrice: number;
  commissionChargeType: CommissionChargeType;
  commissionPercentage: number;
  commissionFixedFee: number;
  commissionCapAmount: number;
  applyCommissionCap: boolean;
}) => {
  const isPlanOnly = input.pricingModel === "PLAN";
  const isCommissionOnly = input.pricingModel === "COMMISSION";
  const isFixedCommission =
    !isPlanOnly && input.commissionChargeType === "FIXED";

  return {
    planPrice: isCommissionOnly ? 0 : input.planPrice,
    commissionType: isPlanOnly
      ? ("PERCENTAGE" as const)
      : input.commissionChargeType,
    commissionPercentage:
      isPlanOnly || isFixedCommission ? 0 : input.commissionPercentage,
    commissionFixedAmount: isFixedCommission ? input.commissionFixedFee : 0,
    commissionCapAmount:
      isPlanOnly || isFixedCommission || !input.applyCommissionCap
        ? 0
        : input.commissionCapAmount,
  };
};
