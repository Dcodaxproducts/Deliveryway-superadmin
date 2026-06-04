import { StatItem } from "@/types/stats";

export const stats: StatItem[] = [
    {
        _id: "total-orders",
        title: "Total Orders",
        value: "12,458",
        footerType: "trend",
        trendData: { direction: "up", percentage: "12.5%", label: "vs last period" },
    },
    {
        _id: "total-revenue",
        title: "Total Revenue",
        value: "$284,392",
        footerType: "trend",
        trendData: { direction: "up", percentage: "12.5%", label: "vs last period" },
    }
];

export const orders = [
  {
    id: "#5552375",
    date: "12/13/2025 07:01 PM",
    customer: "Laura White",
    restaurant: "Dragon Wok",
    status: "Delivered",
    amount: "$27.99",
  },
  {
    id: "#5552375",
    date: "12/13/2025 07:01 PM",
    customer: "Laura White",
    restaurant: "Dragon Wok",
    status: "Delivered",
    amount: "$27.99",
  },
  {
    id: "#5552375",
    date: "12/13/2025 07:01 PM",
    customer: "Laura White",
    restaurant: "Dragon Wok",
    status: "Delivered",
    amount: "$27.99",
  },
  {
    id: "#5552375",
    date: "12/13/2025 07:01 PM",
    customer: "Laura White",
    restaurant: "Dragon Wok",
    status: "Delivered",
    amount: "$27.99",
  },
  {
    id: "#5552375",
    date: "12/13/2025 07:01 PM",
    customer: "Laura White",
    restaurant: "Dragon Wok",
    status: "Delivered",
    amount: "$27.99",
  },
];
