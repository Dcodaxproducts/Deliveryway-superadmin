"use client"

import Container from "../../components/container";
import SystemStatus from "@/components/pages/dashboard/last-section";
import AnalyticsGrid from "@/components/pages/dashboard/order-trend-section";
import RevenueAnalytics from "@/components/pages/dashboard/revenue-trend-section";
import StatsSection from "@/components/shared/stats-section";
import Header from "@/components/header";
import { useStats } from "@/hooks/useStats";

export default function Home() {
    const { data, isLoading } = useStats();
    const statsData = data
        ? Object.entries(data).map(([key, details]: [string, any]) => ({
            _id: `total-${key}`,
            title: `Total ${key.charAt(0).toUpperCase() + key.slice(1)}`,
            value: details.total.toString(),
            footerType: "status",
            statusData: {
                active: details.active,
                inactive: details.inactive,
            },
        }))
        : [];
    return (
        <Container>
            <StatsSection
                stats={statsData}
                className="xl:grid-cols-4"
                isLoading={isLoading}
            />

            <Header
                title="Dashboard Overview"
                description="Welcome back! Here's what's happening with your platform today."
            />
            <AnalyticsGrid />
            <RevenueAnalytics />
            <SystemStatus />
        </Container>
    )
}
