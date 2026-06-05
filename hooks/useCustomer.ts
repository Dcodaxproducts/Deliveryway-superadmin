import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCustomer, getCustomerById, deleteCustomer } from "@/services/customer";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export const useGetCustomer = (params?: { page?: number; search?: string }) => {
  return useQuery({
    queryKey: ["customer", params?.page, params?.search],
    queryFn: () => getCustomer(params),
  });
};

export const useGetCustomerById = (id: string) => {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: () => getCustomerById(id),
    enabled: !!id,
  });
};

export const useDeleteCustomer = () => {
  const toasts = useTranslations("toasts");
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
       toast.success(toasts("customerDeleted"))
      queryClient.invalidateQueries({ queryKey: ["customer"] });
    },
  });
};
