import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  getStaffRoles,
  getStaffRoleById,
  createStaffRole,
  updateStaffRole,
  deleteStaffRole,
  getPermissionModules,
  createPermissionModule,
  updatePermissionModule,
  CreatePermissionModulePayload,
  UpdatePermissionModulePayload,
} from "@/services/rbac";

export const usePermissionModules = (
  params: { isActive?: boolean | null; limit?: number; page?: number } = {},
) => {
  const isActive = params.isActive === undefined ? true : params.isActive;
  const limit = params.limit ?? 100;
  const page = params.page;

  return useQuery({
    queryKey: ["permission-modules", isActive, limit, page],
    queryFn: () => getPermissionModules({ isActive, limit, page }),
  });
};

export const useCreatePermissionModule = () => {
  const toasts = useTranslations("toasts");
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePermissionModulePayload) => createPermissionModule(payload),
    onSuccess: () => {
      toast.success(toasts("permissionModuleSaved"));
      queryClient.invalidateQueries({ queryKey: ["permission-modules"] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || toasts("permissionModuleSaveFailed")),
  });
};

export const useUpdatePermissionModule = () => {
  const toasts = useTranslations("toasts");
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePermissionModulePayload }) => updatePermissionModule(id, payload),
    onSuccess: () => {
      toast.success(toasts("permissionModuleSaved"));
      queryClient.invalidateQueries({ queryKey: ["permission-modules"] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || toasts("permissionModuleSaveFailed")),
  });
};

export const useStaffRoles = () => {
  return useQuery({
    queryKey: ["staff-roles"],
    queryFn: getStaffRoles,
  });
};

export const useStaffRole = (id: string) => {
  return useQuery({
    queryKey: ["staff-role", id],
    queryFn: () => getStaffRoleById(id),
    enabled: !!id,
  });
};

export const useCreateStaffRole = () => {
  const toasts = useTranslations("toasts");
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStaffRole,
    onSuccess: () => {
      toast.success(toasts("roleCreated"));
      queryClient.invalidateQueries({ queryKey: ["staff-roles"] });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || toasts("roleCreateFailed");
      toast.error(message);
    },
  });
};

export const useUpdateStaffRole = () => {
  const toasts = useTranslations("toasts");
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateStaffRole(id, data),
    onSuccess: () => {
      toast.success(toasts("roleUpdated"));
      queryClient.invalidateQueries({ queryKey: ["staff-roles"] });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || toasts("roleUpdateFailed");
      toast.error(message);
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
      const message = err?.response?.data?.message || toasts("roleDeleteFailed");
      toast.error(message);
    },
  });
};
