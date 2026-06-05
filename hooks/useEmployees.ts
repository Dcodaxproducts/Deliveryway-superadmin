import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createStaff,
  getStaffList,
  getStaff,
  updateStaff,
  deleteStaff,
  updateStaffStatus,
  createStaffRole,
  getStaffRoles,
  getStaffRole,
  updateStaffRole,
  deleteStaffRole,
} from "@/services/employees";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

/**
 * ==============================
 * STAFF HOOKS
 * ==============================
 */

export const useCreateStaff = () => {
  const toasts = useTranslations("toasts");
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success(toasts("staffCreated"));
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || toasts("staffCreateFailed"));
    },
  });
};

export const useGetStaffList = (params?: {
  page?: number;
  search?: string;
  staffRoleId?: string;
  isActive?: boolean;
}) => {
  return useQuery({
    queryKey: [
      "staff",
      params?.page,
      params?.search,
      params?.staffRoleId,
      params?.isActive,
    ],
    queryFn: () => getStaffList(params),
  });
};

export const useGetStaff = (id: string) => {
  return useQuery({
    queryKey: ["staff", id],
    queryFn: () => getStaff(id),
    enabled: !!id,
  });
};

export const useUpdateStaff = () => {
  const toasts = useTranslations("toasts");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateStaff(id, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["staff", variables.id] });
      toast.success(toasts("staffUpdated"));
    },

    onError: (err: any) => {
      toast.error(err?.response?.data?.message || toasts("staffUpdateFailed"));
    },
  });
};

export const useDeleteStaff = () => {
  const toasts = useTranslations("toasts");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => {
      toast.success(toasts("staffDeleted"));
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || toasts("staffDeleteFailed"));
    },
  });
};

/**
 * Toggle active/inactive
 */
export const useUpdateStaffStatus = () => {
  const toasts = useTranslations("toasts");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateStaffStatus(id, isActive),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success(toasts("staffStatusUpdated"));
    },

    onError: (err: any) => {
      toast.error(err?.response?.data?.message || toasts("staffStatusUpdateFailed"));
    },
  });
};

/**
 * ==============================
 * STAFF ROLE HOOKS
 * ==============================
 */

export const useCreateStaffRole = () => {
  const toasts = useTranslations("toasts");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStaffRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-roles"] });
      toast.success(toasts("roleCreated"));
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || toasts("roleCreateFailed"));
    },
  });
};

export const useGetStaffRoles = (params?: {
  page?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["staff-roles", params?.page, params?.search],
    queryFn: () => getStaffRoles(params),
  });
};

export const useGetStaffRole = (id: string) => {
  return useQuery({
    queryKey: ["staff-role", id],
    queryFn: () => getStaffRole(id),
    enabled: !!id,
  });
};

export const useUpdateStaffRole = () => {
  const toasts = useTranslations("toasts");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateStaffRole(id, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["staff-roles"] });
      queryClient.invalidateQueries({
        queryKey: ["staff-role", variables.id],
      });
      toast.success(toasts("roleUpdated"));
    },

    onError: (err: any) => {
      toast.error(err?.response?.data?.message || toasts("roleUpdateFailed"));
    },
  });
};

export const useDeleteStaffRole = () => {
  const toasts = useTranslations("toasts");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStaffRole,
    onSuccess: () => {
      toast.success(toasts("roleDeleted"));
      queryClient.invalidateQueries({ queryKey: ["staff-roles"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || toasts("roleDeleteFailed"));
    },
  });
};
