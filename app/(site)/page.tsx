"use client";

import Container from "../../components/container";
import { useTranslations } from "next-intl";
import SystemStatus from "@/components/pages/dashboard/last-section";
import AnalyticsGrid from "@/components/pages/dashboard/order-trend-section";
import RevenueAnalytics from "@/components/pages/dashboard/revenue-trend-section";
import StatsSection from "@/components/shared/stats-section";
import Header from "@/components/header";
import { useStats } from "@/hooks/useStats";
import type { StatItem } from "@/types/stats";
import { formatMoney } from "@/lib/currency";

type DashboardStatDetails = {
  total: number;
  active: number;
  inactive: number;
};

const DASHBOARD_STAT_TITLE_KEYS: Record<string, string> = {
  tenants: "dashboard.activeTenants",
  restaurants: "dashboard.totalRestaurants",
  branches: "dashboard.totalBranches",
  customers: "dashboard.totalCustomers",
  orders: "dashboard.totalOrders",
  revenue: "dashboard.totalRevenue",
};

export default function Home() {
  const dashboard = useTranslations("dashboard");
  const { data, isLoading, isError } = useStats();
  const entityStats: StatItem[] = data
    ? (["tenants", "restaurants", "branches", "customers"] as const).map(
        (key) => {
          const details: DashboardStatDetails = data[key];
          return {
            _id: `total-${key}`,
            titleKey: DASHBOARD_STAT_TITLE_KEYS[key],
            title: `Total ${key.charAt(0).toUpperCase() + key.slice(1)}`,
            value: details.total.toString(),
            footerType: "status",
            statusData: {
              active: details.active,
              inactive: details.inactive,
            },
          };
        },
      )
    : [];
  const statsData: StatItem[] = data
    ? [
        ...entityStats,
        {
          _id: "total-orders",
          titleKey: DASHBOARD_STAT_TITLE_KEYS.orders,
          title: "Total Orders",
          value: data.orders.total.toString(),
          footerType: "plain",
        },
        {
          _id: "total-revenue",
          titleKey: DASHBOARD_STAT_TITLE_KEYS.revenue,
          title: "Total Revenue",
          value: formatMoney(data.orders.revenue, data.orders.currency),
          footerType: "plain",
        },
      ]
    : [];
  return (
    <Container>
      {isError ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {dashboard("overviewLoadError")}
        </div>
      ) : null}
      <StatsSection
        stats={statsData}
        className="xl:grid-cols-3"
        isLoading={isLoading}
      />

      <Header
        title={dashboard("overview")}
        description={dashboard("welcomeDescription")}
      />
      <AnalyticsGrid />
      <RevenueAnalytics />
      <SystemStatus />
    </Container>
  );
}
