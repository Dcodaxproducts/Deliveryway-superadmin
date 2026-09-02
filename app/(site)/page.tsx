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
  const { data, isLoading } = useStats();
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
      ]
    : [];
  return (
    <Container>
      <StatsSection
        stats={statsData}
        className="xl:grid-cols-4"
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
