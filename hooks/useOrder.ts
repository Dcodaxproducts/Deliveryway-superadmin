import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  cancelOrder,
  getOrders,
  getOrder,
  getOrderTrend,
  GetOrdersParams,
  refundOrderPayment,
} from "@/services/order";


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

export const useCancelOrder = (orderId?: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cancelOrder(orderId as string),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      void queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      toast.success("Order cancelled successfully");
    },
    onError: () => toast.error("Unable to cancel order"),
  });
};

export const useRefundOrderPayment = (orderId?: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentId: string) => refundOrderPayment(paymentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      void queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      toast.success("Payment refunded successfully");
    },
    onError: () => toast.error("Unable to refund payment"),
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
