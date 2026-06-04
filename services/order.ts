import api from "@/lib/axios"

export interface Order {
  id: string;
  tenantId: string;
  restaurantId: string;
  branchId: string;
  customerId: string;
  customer: {
    fullName: string
  }
  couponId: string;
  deliveryAddressId: string;
  deliverymanId: string;
  orderType: "DELIVERY" | "PICKUP";
  paymentMethod: "COD" | "CARD" | "WALLET";
  status: "PLACED" | "PREPARING" | "READY" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";
  subtotal: string;
  taxAmount: string;
  deliveryFee: string;
  discountAmount: string;
  totalAmount: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  paidAt: null | string;
  assignedAt: null | string;
  deliveredAt: null | string;
  customerNote: string;
  cancelledAt: null | string;
  cancelledByUserId: null | string;
  createdAt: string;
  updatedAt: string;
  branch: {
    id: string;
    name: string;
  };
  restaurant: {
    id: string;
    name: string;
  };
  coupon?: {
    id: string;
    code: string;
    title: string;
  };
}

export type OrderStatus =
  | "PLACED"
  | "CONFIRMED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "PICKED_UP"
  | "READY_TO_SERVE"
  | "SERVED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "REJECTED";

export type OrderType = "DELIVERY" | "TAKEAWAY" | "DINE_IN";

export type OrderKind = "order" | "group-orders";

export type OrderSortOrder = "ASC" | "DESC";

export type GetOrdersParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: OrderSortOrder;
  restaurantId?: string;
  branchId?: string;
  status?: OrderStatus | string;
  orderType?: OrderType | string;
  kind?: OrderKind | string;
};

const cleanParams = <T extends Record<string, any>>(params?: T) => {
  if (!params) return undefined;

  const cleaned = Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      return value !== undefined && value !== null && value !== "";
    })
  );

  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
};

export const getOrders = async (params?: GetOrdersParams) => {
  const { data } = await api.get("/orders", {
    params: cleanParams(params),
  });

  return data;
};

export const getOrder = async (id: string) => {
  const { data } = await api.get(`/orders/${id}`);
  return data.data;
};


export const getOrderTrend = async (params: {
  restaurantId: string;
  range: "daily" | "weekly" | "monthly";
}) => {
  const { data } = await api.get("/admin/dashboard/orders/trend", {
    params,
  });
  return data;
};