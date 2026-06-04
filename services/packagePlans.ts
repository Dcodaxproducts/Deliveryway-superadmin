import api from "@/lib/axios";

/**
 * ==============================
 * TYPES
 * ==============================
 */

export type BillingModel = "COMMISSION" | "PLAN" | "HYBRID" | string;

export type BillingInterval =
  | "MONTHLY"
  | "YEARLY"
  | "WEEKLY"
  | "DAILY"
  | string;

export type PayoutCycle =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "MANUAL"
  | string;

export type SubscriptionPaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | string;

export type SubscriptionStatus =
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELLED"
  | "EXPIRED"
  | string;

export type PackagePlanFeatures = Record<string, any>;

export type PackagePlan = {
  id: string;
  name: string;
  description?: string | null;
  billingModel: BillingModel;
  billingInterval: BillingInterval;
  planPrice: number | string;
  commissionPercentage?: number | string | null;
  commissionCapAmount?: number | string | null;
  vatPercentage?: number | string | null;
  payoutCycle?: PayoutCycle | null;
  termsDocumentUrl?: string | null;
  currency?: string;
  trialDays?: number;
  features?: PackagePlanFeatures;
  isActive: boolean;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreatePackagePlanPayload = {
  name: string;
  description?: string;
  billingModel: BillingModel;
  billingInterval: BillingInterval;
  planPrice: number;
  commissionPercentage?: number;
  commissionCapAmount?: number;
  vatPercentage?: number;
  payoutCycle?: PayoutCycle;
  termsDocumentUrl?: string;
  currency?: string;
  trialDays?: number;
  features?: PackagePlanFeatures;
  isActive?: boolean;
  isDefault?: boolean;
};

export type UpdatePackagePlanPayload = Partial<CreatePackagePlanPayload>;

export type PackagePlansParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  withDeleted?: boolean;
  includeInactive?: boolean;
  billingModel?: "COMMISSION" | "PLAN" | "HYBRID" | string;
};

export type PackageSubscription = {
  id: string;
  tenantId?: string | null;
  restaurantId?: string | null;
  packagePlanId: string;
  paymentStatus?: SubscriptionPaymentStatus;
  status: SubscriptionStatus;
  startsAt?: string | null;
  endsAt?: string | null;
  nextBillingAt?: string | null;
  note?: string | null;
  packagePlan?: PackagePlan;
  createdAt?: string;
  updatedAt?: string;
};

export type CreatePackageSubscriptionPayload = {
  tenantId?: string;
  restaurantId?: string;
  packagePlanId: string;
  paymentStatus?: SubscriptionPaymentStatus;
  status: SubscriptionStatus;
  startsAt?: string;
  endsAt?: string;
  nextBillingAt?: string;
  note?: string;
};

export type UpdatePackageSubscriptionPayload =
  Partial<CreatePackageSubscriptionPayload>;

export type PackageSubscriptionsParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  withDeleted?: boolean;
  includeInactive?: boolean;
  tenantId?: string;
  restaurantId?: string;
  status?: "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELLED" | "EXPIRED" | string;
};

export type PackagePlanFeatureCatalogItem = {
  code?: string;
  key?: string;
  name?: string;
  label?: string;
  description?: string;
  module?: string;
  enabled?: boolean;
  supportsLimit?: boolean;
  [key: string]: any;
};

/**
 * ==============================
 * PACKAGE PLAN APIS
 * ==============================
 */

export const createPackagePlan = async (
  payload: CreatePackagePlanPayload
) => {
  const { data } = await api.post("/admin/package-plans", payload);
  return data;
};

export const getPackagePlans = async (params?: PackagePlansParams) => {
  const { data } = await api.get("/admin/package-plans", { params });
  return data;
};

export const getPackagePlanDetail = async (id: string) => {
  const { data } = await api.get(`/admin/package-plans/${id}`);
  return data;
};

export const updatePackagePlan = async (
  id: string,
  payload: UpdatePackagePlanPayload
) => {
  const { data } = await api.patch(`/admin/package-plans/${id}`, payload);
  return data;
};

export const deletePackagePlan = async (id: string) => {
  const { data } = await api.delete(`/admin/package-plans/${id}`);
  return data;
};

/**
 * ==============================
 * PACKAGE PLAN FEATURE CATALOG API
 * ==============================
 */

export const getPackagePlanFeatureCatalog = async () => {
  const { data } = await api.get("/admin/package-plans/features/catalog");
  return data;
};

/**
 * ==============================
 * PACKAGE SUBSCRIPTION APIS
 * ==============================
 */

export const getPackageSubscriptions = async (
  params?: PackageSubscriptionsParams
) => {
  const { data } = await api.get("/admin/package-plans/subscriptions", {
    params,
  });
  return data;
};

export const createPackageSubscription = async (
  payload: CreatePackageSubscriptionPayload
) => {
  const { data } = await api.post(
    "/admin/package-plans/subscriptions",
    payload
  );
  return data;
};

export const updatePackageSubscription = async (
  id: string,
  payload: UpdatePackageSubscriptionPayload
) => {
  const { data } = await api.patch(
    `/admin/package-plans/subscriptions/${id}`,
    payload
  );
  return data;
};