import api from "@/lib/axios";
import type {
  Cuisine,
  CuisineListParams,
  CuisinePayload,
  CuisineReorderItem,
  CuisinesResponse,
} from "@/types/cuisine";

export const getCuisines = async (params?: CuisineListParams): Promise<CuisinesResponse> => {
  const { data } = await api.get<CuisinesResponse>("/menu/cuisines", { params });
  return data;
};

export const createCuisine = async (payload: CuisinePayload) => {
  const { data } = await api.post<{ data: Cuisine; message?: string }>("/menu/cuisines", payload);
  return data;
};

export const updateCuisine = async (id: string, payload: CuisinePayload) => {
  const { data } = await api.patch<{ data: Cuisine; message?: string }>(`/menu/cuisines/${id}`, payload);
  return data;
};

export const deleteCuisine = async (id: string) => {
  const { data } = await api.delete<{ data: Cuisine; message?: string }>(`/menu/cuisines/${id}`);
  return data;
};

export const bulkCreateCuisines = async (items: CuisinePayload[]) => {
  const { data } = await api.post<{ data: { count: number }; message?: string }>("/menu/cuisines/bulk", {
    items,
  });
  return data;
};

export const reorderCuisines = async (items: CuisineReorderItem[]) => {
  const { data } = await api.patch<{ data: { count: number }; message?: string }>("/menu/cuisines/reorder", {
    items,
  });
  return data;
};
