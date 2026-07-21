import { useQuery } from "@tanstack/react-query";
import { getProducts, getProduct, type ProductListParams } from "@/services/product";

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
