"use client";

import { StatItem } from "@/types/stats";
import StatsCard from "../../cards/stats-card";
import { useTranslations } from "next-intl";
import { useGlobalCurrency } from "@/hooks/useGlobalCurrency";
import { formatMoney } from "@/lib/currency";

export default function OrderAndRevenueSection() {
  const profile = useTranslations("profile");
  const currency = useGlobalCurrency();
  const stats: StatItem[] = [
    {
      _id: "total-revenue",
      titleKey: "dashboard.totalRevenue",
      value: formatMoney(284392, currency, { maximumFractionDigits: 0 }),
      footerType: "trend",
      trendData: {
        direction: "up",
        percentage: "12.5%",
        labelKey: "dashboard.vsLastPeriod",
      },
    },
    {
      _id: "total-orders",
      titleKey: "dashboard.totalOrders",
      value: "12,458",
      footerType: "trend",
      trendData: {
        direction: "up",
        percentage: "12.5%",
        labelKey: "dashboard.vsLastPeriod",
      },
    },
  ];

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
