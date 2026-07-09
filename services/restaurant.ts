import api from "@/lib/axios";
import { RestaurantValues } from "@/validations/restaurant";
import { ApiResponse, RestaurantTrend, TopRestaurantsResponse } from "@/types/stats";

// RESTAURANT APIS
export const createRestaurant = async (payload: RestaurantValues) => {
  const { data } = await api.post("/restaurants", payload);
  return data;
};

export const getRestaurants = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  includeInactive?: boolean;
}) => {
  const { data } = await api.get("/restaurants", { params });
  return data;
};

export const getRestaurant = async (id: string) => {
  const { data } = await api.get(`/restaurants/${id}`);
  return data.data;
};

export const updateRestaurant = async (id: string, payload: RestaurantValues) => {
  const { data } = await api.patch(`/restaurants/${id}`, payload);
  return data;
};

export const deleteRestaurant = async (id: string) => {
  const { data } = await api.delete(`/restaurants/${id}`);
  return data.data;
};

export type RestaurantServiceChargePayload = {
  isEnabled?: boolean;
  type?: "PERCENTAGE" | "AMOUNT";
  value?: number;
};

export const updateRestaurantServiceCharge = async (
  id: string,
  payload: RestaurantServiceChargePayload
) => {
  const { data } = await api.patch(`/restaurants/${id}/service-charge`, payload);
  return data;
};

// BRANCH APIS
export const getRestaurantBranches = async (id: string) => {
  const { data } = await api.get(`/branches?restaurantId=${id}`);
  return data.data;
};

export const getBranch = async (id: string) => {
  const { data } = await api.get(`/branches/${id}`);
  return data.data;
};

// RESTAURANT TREND API
export const getRestaurantTrend = async (range?: "daily" | "weekly"): Promise<RestaurantTrend> => {
  const { data } = await api.get<ApiResponse<RestaurantTrend>>("/admin/dashboard/restaurants/trend", {
    params: { range }
  });
  return data.data;
};

// TOP PERFORMING RESTAURANTS API
export const getTopPerformingRestaurants = async (): Promise<TopRestaurantsResponse> => {
  const { data } = await api.get<ApiResponse<TopRestaurantsResponse>>("/admin/dashboard/restaurants/top-performing");
  return data.data;
};
