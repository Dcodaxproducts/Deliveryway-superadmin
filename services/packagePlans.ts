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
  tenant?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
  restaurant?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
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

export type PackageSubscriptionInvoiceParty = {
  id?: string;
  name?: string | null;
  email?: string | null;
  slug?: string | null;
};

export type PackageSubscriptionInvoicePlan = {
  id?: string;
  name?: string | null;
  billingModel?: BillingModel | null;
  billingInterval?: BillingInterval | null;
  planPrice?: string | number | null;
  currency?: string | null;
  commissionPercentage?: string | number | null;
  commissionCapAmount?: string | number | null;
  vatPercentage?: string | number | null;
};

export type PackageSubscriptionInvoice = {
  id?: string;
  invoiceNumber?: string | null;
  subscriptionId?: string | null;
  tenantId?: string | null;
  restaurantId?: string | null;
  tenant?: PackageSubscriptionInvoiceParty | null;
  restaurant?: PackageSubscriptionInvoiceParty | null;
  servicePeriodStart?: string | null;
  servicePeriodEnd?: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  packagePlan?: PackageSubscriptionInvoicePlan | null;
  plan?: PackageSubscriptionInvoicePlan | null;
  billingModel?: BillingModel | null;
  billingInterval?: BillingInterval | null;
  commissionPercentage?: string | number | null;
  commissionCapAmount?: string | number | null;
  vatPercentage?: string | number | null;
  subtotal?: string | number | null;
  vatAmount?: string | number | null;
  taxAmount?: string | number | null;
  totalAmount?: string | number | null;
  amountDue?: string | number | null;
  currency?: string | null;
  paymentStatus?: SubscriptionPaymentStatus | null;
  subscriptionStatus?: SubscriptionStatus | null;
  status?: string | null;
  issuedAt?: string | null;
  dueAt?: string | null;
  paidAt?: string | null;
  createdAt?: string | null;
};

export type PackageSubscriptionInvoiceResponse = {
  success?: boolean;
  data?: PackageSubscriptionInvoice;
  message?: string;
};

export type SendPackageSubscriptionInvoiceEmailPayload = {
  email?: string;
};

export type SendPackageSubscriptionInvoiceEmailResponse = {
  success?: boolean;
  message?: string;
};

export type WeeklyPayoutInvoiceParams = {
  restaurantId: string;
  fromDate: string;
  toDate: string;
};

export type WeeklyPayoutInvoiceEmailPayload = WeeklyPayoutInvoiceParams & {
  email?: string;
};

export type WeeklyPayoutInvoiceLineItem = {
  orderId?: string | null;
  grossAmount?: string | number | null;
  platformCommissionAmount?: string | number | null;
  restaurantPayoutAmount?: string | number | null;
};

export type WeeklyPayoutInvoice = {
  invoiceNumber?: string | null;
  restaurant?: {
    id?: string;
    name?: string | null;
    billingEmail?: string | null;
  } | null;
  subscription?: {
    billingInterval?: BillingInterval | null;
    payoutCycle?: PayoutCycle | null;
  } | null;
  period?: {
    from?: string | null;
    to?: string | null;
  } | null;
  lineItems?: WeeklyPayoutInvoiceLineItem[];
  totals?: {
    ordersCount?: string | number | null;
    grossAmount?: string | number | null;
    platformCommissionAmount?: string | number | null;
    restaurantPayoutAmount?: string | number | null;
    currency?: string | null;
  } | null;
};

export type WeeklyPayoutInvoiceResponse = {
  success?: boolean;
  data?: WeeklyPayoutInvoice;
  message?: string;
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

/**
 * ==============================
 * PACKAGE SUBSCRIPTION INVOICE APIS
 * ==============================
 */

export const getPackageSubscriptionInvoice = async (
  id: string
): Promise<PackageSubscriptionInvoiceResponse> => {
  const { data } = await api.get(
    `/admin/package-plans/subscriptions/${id}/invoice`
  );

  return data;
};

export const downloadPackageSubscriptionInvoicePdf = async (id: string) => {
  const response = await api.get<Blob>(
    `/admin/package-plans/subscriptions/${id}/invoice/pdf`,
    {
      responseType: "blob",
    }
  );

  return response.data;
};

export const sendPackageSubscriptionInvoiceEmail = async (
  id: string,
  payload?: SendPackageSubscriptionInvoiceEmailPayload
): Promise<SendPackageSubscriptionInvoiceEmailResponse> => {
  const { data } = await api.post(
    `/admin/package-plans/subscriptions/${id}/invoice/send-email`,
    payload?.email ? payload : undefined
  );

  return data;
};

/**
 * ==============================
 * WEEKLY PAYOUT INVOICE APIS
 * ==============================
 */

export const getWeeklyPayoutInvoice = async (
  params: WeeklyPayoutInvoiceParams
): Promise<WeeklyPayoutInvoiceResponse> => {
  const { data } = await api.get(
    "/admin/package-plans/payouts/weekly-invoice",
    { params }
  );

  return data;
};

export const downloadWeeklyPayoutInvoicePdf = async (
  params: WeeklyPayoutInvoiceParams
) => {
  const response = await api.get<Blob>(
    "/admin/package-plans/payouts/weekly-invoice/pdf",
    {
      params,
      responseType: "blob",
    }
  );

  return response.data;
};

export const sendWeeklyPayoutInvoiceEmail = async (
  payload: WeeklyPayoutInvoiceEmailPayload
): Promise<SendPackageSubscriptionInvoiceEmailResponse> => {
  const { data } = await api.post(
    "/admin/package-plans/payouts/weekly-invoice/send-email",
    payload
  );

  return data;
};
