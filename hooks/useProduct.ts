import { useQuery } from "@tanstack/react-query";
import { getProducts, getProduct } from "@/services/product";

export const useGetProducts = (params?: { page?: number; search?: string; includeInactive?: boolean }) => {
  return useQuery({
    queryKey: ["products", params?.page, params?.search, params?.includeInactive],
    queryFn: () => getProducts(params),
  });
};

export const useGetProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
  });
};
