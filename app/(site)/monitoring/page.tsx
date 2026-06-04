"use client"

import Header from "@/components/header";
import Container from "@/components/container";
import ServerHealthSection from "@/components/pages/monitoring/server-health-section";
import ApiHealthSection from "@/components/pages/monitoring/api-health-section";
import ApiLatencyGraphSection from "@/components/pages/monitoring/api-latency-graph-section";
import IntegrationLogsSection from "@/components/pages/monitoring/integration-logs-section";
import AlertsAndNotificationsSection from "@/components/pages/monitoring/alerts-and-notifications-section";

export default function SystemHealthPage() {
    return (
        <Container>
            <Header
                title="System Health Monitoring"
                description="Track system performance, uptime, and integrations in real time."
            />

            <ServerHealthSection />

            <ApiHealthSection />

            <ApiLatencyGraphSection />

            <IntegrationLogsSection />

            {/* <AlertsAndNotificationsSection /> */}
        </Container>
    );
}