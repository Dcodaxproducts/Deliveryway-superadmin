import { StatItem } from "@/types/stats";

export const stats: StatItem[] = [
    {
        _id: "total-orders",
        titleKey: "orders.totalOrders",
        value: "12,458",
        footerType: "trend",
        trendData: { direction: "up", percentage: "12.5%", labelKey: "dashboard.vsLastPeriod" },
    },
    {
        _id: "total-revenue",
        titleKey: "orders.totalRevenue",
        value: "$284,392",
        footerType: "trend",
        trendData: { direction: "up", percentage: "12.5%", labelKey: "dashboard.vsLastPeriod" },
    }
];

export const orders = [
  {
    id: "#5552375",
    date: "12/13/2025 07:01 PM",
    customer: "Laura White",
    restaurant: "Dragon Wok",
    statusKey: "filters.orderStatusDelivered",
    amount: "$27.99",
  },
  {
    id: "#5552375",
    date: "12/13/2025 07:01 PM",
    customer: "Laura White",
    restaurant: "Dragon Wok",
    statusKey: "filters.orderStatusDelivered",
    amount: "$27.99",
  },
  {
    id: "#5552375",
    date: "12/13/2025 07:01 PM",
    customer: "Laura White",
    restaurant: "Dragon Wok",
    statusKey: "filters.orderStatusDelivered",
    amount: "$27.99",
  },
  {
    id: "#5552375",
    date: "12/13/2025 07:01 PM",
    customer: "Laura White",
    restaurant: "Dragon Wok",
    statusKey: "filters.orderStatusDelivered",
    amount: "$27.99",
  },
  {
    id: "#5552375",
    date: "12/13/2025 07:01 PM",
    customer: "Laura White",
    restaurant: "Dragon Wok",
    statusKey: "filters.orderStatusDelivered",
    amount: "$27.99",
  },
];
