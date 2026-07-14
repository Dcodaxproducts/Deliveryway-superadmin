import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  getTenants,
  registerTenant,
  updateTenant,
  forceDeleteTenant,
  getTenantAnalytics,
  approveBusinessAdmin,
  getTenant,
  getBusinessOwnerStats,
} from "@/services/tenants";

export const TENANTS_QUERY_KEY = ["tenants"] as const;
export const BUSINESS_OWNER_STATS_QUERY_KEY = [
  "admin-dashboard",
  "business-owners",
  "stats",
] as const;

/**
 * ==============================
 * TENANT HOOKS
 * ==============================
 */

export const useRegisterTenant = () => {
  const queryClient = useQueryClient();
  const toasts = useTranslations("toasts");

  return useMutation({
    mutationFn: registerTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TENANTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: BUSINESS_OWNER_STATS_QUERY_KEY });
      toast.success(toasts("tenantRegistered"));
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || toasts("tenantRegisterFailed"));
    },
  });
};

export const useGetTenants = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortOrder?: "ASC" | "DESC";
  withDeleted?: boolean;
  includeInactive?: boolean;
}) => {
  return useQuery({
    queryKey: [
      "tenants",
      params?.page,
      params?.limit,
      params?.search,
      params?.sortOrder,
      params?.withDeleted,
      params?.includeInactive,
    ],
    queryFn: () => getTenants(params),
  });
};
export const useUpdateTenant = () => {
  const queryClient = useQueryClient();
  const toasts = useTranslations("toasts");

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateTenant(id, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TENANTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: BUSINESS_OWNER_STATS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["tenant-analytics", variables.id] });
      // toast.success("Tenant updated successfully!");
    },

    onError: (err: any) => {
      toast.error(err?.response?.data?.message || toasts("tenantUpdateFailed"));
    },
  });
};

export const useDeleteTenant = () => {
  const queryClient = useQueryClient();
  const toasts = useTranslations("toasts");

  return useMutation({
    mutationFn: forceDeleteTenant,
    onSuccess: () => {
      toast.success(toasts("tenantDeleted"));
      queryClient.invalidateQueries({ queryKey: TENANTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: BUSINESS_OWNER_STATS_QUERY_KEY });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || toasts("tenantDeleteFailed"));
    },
  });
};

export const useGetTenantAnalytics = (id: string) => {
  return useQuery({
    queryKey: ["tenant-analytics", id],
    queryFn: () => getTenantAnalytics(id),
    enabled: !!id,
  });
};

export const useApproveBusinessAdmin = () => {
  const queryClient = useQueryClient();
  const toasts = useTranslations("toasts");

  return useMutation({
    mutationFn: approveBusinessAdmin,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: TENANTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: BUSINESS_OWNER_STATS_QUERY_KEY });
      toast.success(data?.message || toasts("businessAdminApproved"));
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || toasts("businessAdminApproveFailed")
      );
    },
  });
};


export const useGetTenant = (id: string) => {
  return useQuery({
    queryKey: ["tenant", id],
    queryFn: () => getTenant(id),
    enabled: !!id,
  });
};


export const useGetBusinessOwnerStats = () => {
  return useQuery({
    queryKey: BUSINESS_OWNER_STATS_QUERY_KEY,
    queryFn: getBusinessOwnerStats,
  });
};
