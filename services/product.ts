import api from "@/lib/axios"

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
  variations: any[];
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  restaurantId?: string;
  includeInactive?: boolean;
  all?: boolean;
}

export const getProducts = async (params?: ProductListParams) => {
  const { data } = await api.get("/menu/items", { params });
  return data;
};

export const getProduct = async (id: string) => {
  const { data } = await api.get(`/menu/items/${id}`);
  return data.data;
};
