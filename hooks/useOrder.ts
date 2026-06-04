import { useQuery } from "@tanstack/react-query";
import { getOrders, getOrder, getOrderTrend, GetOrdersParams } from "@/services/order";


export const useGetOrders = (params?: GetOrdersParams) => {
  return useQuery({
    queryKey: [
      "orders",
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
      params?.restaurantId,
      params?.branchId,
      params?.status,
      params?.orderType,
      params?.kind,
    ],
    queryFn: () => getOrders(params),
  });
};

export const useGetOrder = (id: string) => {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrder(id),
  });
};


export const useGetOrderTrend = (params: {
  restaurantId: string;
  range: "daily" | "weekly" | "monthly";
}) => {
  return useQuery({
    queryKey: ["order-trend", params.restaurantId, params.range],
    queryFn: () => getOrderTrend(params),
    enabled: !!params.restaurantId && !!params.range,
  });
};