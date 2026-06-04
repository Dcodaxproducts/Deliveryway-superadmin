import { StatItem } from "@/types/stats";

export const statsData: StatItem[] = [
  {
    _id: "total-restaurants",
    title: "Total Restaurants",
    value: "247",
    footerType: "status",
    statusData: { active: 189, inactive: 58 },
  },
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
  },
  {
    _id: "active-tenants",
    title: "Active Tenants",
    value: "189",
    footerType: "trend",
    trendData: { direction: "down", percentage: "2.1%", label: "vs last period" },
  },
];
