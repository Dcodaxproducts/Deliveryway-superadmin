import api from "@/lib/axios";
import {
  RegisterTenantValues,
  UpdateTenantValues,
  TenantListFilterValues,
} from "@/validations/tenants";

type TenantListRecord = Record<string, any>;

const getFirstString = (...values: unknown[]) =>
  values.find(
    (value): value is string => typeof value === "string" && value.length > 0,
  );

const getFirstBoolean = (...values: unknown[]) => {
  const value = values.find((item) => typeof item === "boolean");

  return typeof value === "boolean" ? value : false;
};

const getLatestSubscription = (tenant: TenantListRecord) => {
  const subscriptions = Array.isArray(tenant.tenantSubscriptions)
    ? tenant.tenantSubscriptions
    : Array.isArray(tenant.subscriptions)
      ? tenant.subscriptions
      : [];

  return (
    tenant.latestSubscription ?? tenant.subscription ?? subscriptions[0] ?? null
  );
};

const normalizeBusinessOwnerRow = (tenant: TenantListRecord) => {
  const owner =
    tenant.owner ??
    tenant.user ??
    tenant.businessAdmin ??
    tenant.businessOwner ??
    tenant.adminUser ??
    {};

  const latestSubscription = getLatestSubscription(tenant);
  const packagePlan =
    latestSubscription?.packagePlan ??
    tenant.packagePlan ??
    tenant.plan ??
    null;

  return {
    ...tenant,
    ownerId: getFirstString(
      tenant.ownerId,
      tenant.businessAdminId,
      tenant.businessOwnerId,
      tenant.userId,
      owner.id,
      owner.userId,
    ),
    isVerified: getFirstBoolean(tenant.isVerified, owner.isVerified),
    isApproved: getFirstBoolean(tenant.isApproved, owner.isApproved),
    isActive: getFirstBoolean(tenant.isActive, owner.isActive),
    latestSubscription,
    subscriptionStatus: getFirstString(
      tenant.subscriptionStatus,
      latestSubscription?.status,
    ),
    paymentStatus: getFirstString(
      tenant.paymentStatus,
      latestSubscription?.paymentStatus,
    ),
    subscriptionId: getFirstString(
      tenant.subscriptionId,
      latestSubscription?.id,
    ),
    planName: getFirstString(
      tenant.planName,
      packagePlan?.name,
      latestSubscription?.planName,
    ),
  };
};

/**
 * ==============================
 * TENANT APIS
 * ==============================
 */

/**
 * GET /tenants?search=dcodax&sortOrder=DESC&withDeleted=false&includeInactive=false
 */
export const getTenants = async (
  params?: TenantListFilterValues & {
    page?: number;
    limit?: number;
  },
) => {
  const { data } = await api.get("/tenants", { params });

  if (!Array.isArray(data?.data)) {
    return data;
  }

  return {
    ...data,
    data: data.data.map(normalizeBusinessOwnerRow),
  };
};
export type RegisterTenantResponse = {
  success?: boolean;
  message?: string;
  data?: Record<string, any>;
  subscription?: Record<string, any> | null;
};

/**
 * POST /auth/admin/register-tenant
 */
export const registerTenant = async (
  payload: RegisterTenantValues,
): Promise<RegisterTenantResponse> => {
  const { data } = await api.post("/auth/admin/register-tenant", payload);
  return data;
};

/**
 * PATCH /tenants/{id}
 */
export const updateTenant = async (
  id: string,
  payload: Partial<UpdateTenantValues>,
) => {
  const { data } = await api.patch(`/tenants/${id}`, payload);
  return data;
};

/**
 * DELETE /tenants/{id}/force
 */
export const forceDeleteTenant = async (id: string) => {
  const { data } = await api.delete(`/tenants/${id}/force`);
  return data;
};

/**
 * GET /api/v1/tenants/{id}/analytics
 * If your axios instance already has /api/v1 as baseURL, then use `/tenants/${id}/analytics`
 * Otherwise keep `/api/v1/tenants/${id}/analytics`
 */
export const getTenantAnalytics = async (id: string) => {
  const { data } = await api.get(`/tenants/${id}/analytics`);
  return data;
};

/**
 * PATCH /admin/users/business-admins/{id}/approve
 */
export const approveBusinessAdmin = async (id: string) => {
  const { data } = await api.patch(
    `/admin/users/business-admins/${id}/approve`,
  );
  return data;
};

export const getTenant = async (id: string) => {
  const { data } = await api.get(`/tenants/${id}`);
  return data;
};

export const resetBusinessOwnerPassword = async (
  tenantId: string,
  password: string,
) => {
  const { data } = await api.patch(`/tenants/${tenantId}/owner-password`, {
    password,
  });
  return data;
};

export type BusinessOwnerStats = {
  totalBusinessOwners: number;
  activeBusinessOwners: number;
  inactiveBusinessOwners: number;
};

export type BusinessOwnerStatsResponse = {
  success: boolean;
  data: BusinessOwnerStats;
  message?: string;
};

export const getBusinessOwnerStats =
  async (): Promise<BusinessOwnerStatsResponse> => {
    const { data } = await api.get("/admin/dashboard/business-owners/stats");

    return data;
  };
