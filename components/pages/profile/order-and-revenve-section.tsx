"use client";

import { StatItem } from "@/types/stats";
import StatsCard from "../../cards/stats-card";
import { useTranslations } from "next-intl";

const stats:StatItem[] = [
  {
    _id: "total-revenue",
    titleKey: "dashboard.totalRevenue",
    value: "$284,392",
    footerType: "trend",
    trendData: { direction: "up", percentage: "12.5%", labelKey: "dashboard.vsLastPeriod" },
  },
    {
    _id: "total-orders",
    titleKey: "dashboard.totalOrders",
    value: "12,458",
    footerType: "trend",
    trendData: { direction: "up", percentage: "12.5%", labelKey: "dashboard.vsLastPeriod" },
  },
];

export default function OrderAndRevenueSection() {
  const profile = useTranslations("profile");
  return (
    <div className="space-y-[32px]">
      <h3 className="text-lg font-semibold text-dark">{profile("ordersRevenueSummary")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[32px]">
        {stats.map((stat) => (
          <StatsCard data={stat} />
        ))}
      </div>
    </div>
  );
}
