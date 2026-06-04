import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCustomer, getCustomerById, deleteCustomer } from "@/services/customer";
import { toast } from "sonner";

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
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
       toast.success("Customer deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["customer"] });
    },
  });
};