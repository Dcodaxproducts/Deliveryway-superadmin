import api from "@/lib/axios";
import {
  RegisterTenantValues,
  UpdateTenantValues,
  TenantListFilterValues,
} from "@/validations/tenants";

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
  }
) => {
  const { data } = await api.get("/tenants", { params });
  return data;
};
/**
 * POST /auth/register-tenant
 */
export const registerTenant = async (payload: RegisterTenantValues) => {
  const { data } = await api.post("/auth/register-tenant", payload);
  return data;
};

/**
 * PATCH /tenants/{id}
 */
export const updateTenant = async (
  id: string,
  payload: Partial<UpdateTenantValues>
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
  const { data } = await api.patch(`/admin/users/business-admins/${id}/approve`);
  return data;
};


export const getTenant = async (id: string) => {
  const { data } = await api.get(`/tenants/${id}`);
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
    const { data } = await api.get(
      "/admin/dashboard/business-owners/stats"
    );

    return data;
  };