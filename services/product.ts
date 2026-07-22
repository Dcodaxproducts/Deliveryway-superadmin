import api from "@/lib/axios"

export interface ProductListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface Product {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  sku: string;
  basePrice: string;
  taxTypeCode?: string | null;
  prepTimeMinutes: number;
  dietaryFlags: string[];
  allergenFlags: string[];
  isActive: boolean;
  deletedAt: null | string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
  };
  restaurant: {
    id: string;
    name: string;
  };
  variations: unknown[];
}

export interface ProductListResponse {
  data: Product[];
  meta: ProductListMeta;
  message?: string;
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  restaurantId?: string;
  includeInactive?: boolean;
  all?: boolean;
  inactive?: boolean;
}

export const getProducts = async (params?: ProductListParams): Promise<ProductListResponse> => {
  const { data } = await api.get("/menu/items", { params });
  return data;
};

export const getProduct = async (id: string) => {
  const { data } = await api.get(`/menu/items/${id}`);
  return data.data;
};

export const updateProductStatus = async ({ id, isActive }: { id: string; isActive: boolean }) => {
  const { data } = await api.patch(`/menu/items/${id}`, { isActive });
  return data;
};

export const deleteProduct = async (id: string) => {
  const { data } = await api.delete(`/menu/items/${id}`);
  return data;
};
