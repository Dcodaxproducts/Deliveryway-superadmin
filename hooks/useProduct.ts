import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  deleteProduct,
  getProducts,
  getProduct,
  updateProductStatus,
  type ProductListParams,
} from "@/services/product";

type ApiError = {
  response?: { data?: { message?: string } };
};

export const useGetProducts = (params?: ProductListParams) => {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => getProducts(params),
  });
};

export const useGetProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
  });
};

export const useUpdateProductStatus = () => {
  const queryClient = useQueryClient();
  const products = useTranslations("products");

  return useMutation({
    mutationFn: updateProductStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(products("statusUpdated"));
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || products("statusUpdateFailed"));
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const products = useTranslations("products");

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(products("deleted"));
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || products("deleteFailed"));
    },
  });
};
