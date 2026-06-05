"use client"

import Header from "@/components/header";
import Container from "@/components/container";
import { useTranslations } from "next-intl";
import { ServerHealthSection } from "@/components/pages/monitoring/server-health-section";
import { ApiHealthSection } from "@/components/pages/monitoring/api-health-section";
import { ApiLatencyChartSection } from "@/components/pages/monitoring/api-latency-graph-section";
import { IntegrationLogsSection } from "@/components/pages/monitoring/integration-logs-section";
import { AlertsAndNotificationsSection } from "@/components/pages/monitoring/alerts-and-notifications-section";

export default function SystemHealthPage() {
    const monitoring = useTranslations("monitoring");

    return (
        <Container>
            <Header
                title={monitoring("title")}
                description={monitoring("description")}
            />

            <ServerHealthSection />

            <ApiHealthSection />

            <ApiLatencyChartSection />

            <IntegrationLogsSection />

            {/* <AlertsAndNotificationsSection /> */}
        </Container>
    );
}
