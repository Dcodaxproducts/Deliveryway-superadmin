import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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

/**
 * ==============================
 * TENANT HOOKS
 * ==============================
 */

export const useRegisterTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      toast.success("Tenant registered successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to register tenant");
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

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateTenant(id, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-analytics", variables.id] });
      // toast.success("Tenant updated successfully!");
    },

    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update tenant");
    },
  });
};

export const useDeleteTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: forceDeleteTenant,
    onSuccess: () => {
      toast.success("Tenant deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete tenant");
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

  return useMutation({
    mutationFn: approveBusinessAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      toast.success("Business admin approved successfully!");
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || "Failed to approve business admin"
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
    queryKey: ["admin-dashboard", "business-owners", "stats"],
    queryFn: getBusinessOwnerStats,
  });
};