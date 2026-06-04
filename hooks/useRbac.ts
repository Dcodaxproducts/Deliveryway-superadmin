import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getStaffRoles, getStaffRoleById, createStaffRole, updateStaffRole, deleteStaffRole } from "@/services/rbac";

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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStaffRole,
    onSuccess: () => {
      toast.success("Role created successfully");
      queryClient.invalidateQueries({ queryKey: ["staff-roles"] });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || "Failed to create role";
      toast.error(message);
    },
  });
};

export const useUpdateStaffRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateStaffRole(id, data),
    onSuccess: () => {
      toast.success("Role updated successfully");
      queryClient.invalidateQueries({ queryKey: ["staff-roles"] });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || "Failed to update role";
      toast.error(message);
    },
  });
};

export const useDeleteStaffRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStaffRole,
    onSuccess: () => {
      toast.success("Role deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["staff-roles"] });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || "Failed to delete role";
      toast.error(message);
    },
  });
};
