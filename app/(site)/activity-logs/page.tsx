"use client";

import Container from "@/components/container";
import Header from "@/components/header";
import { StaffActivityLogsPanel } from "@/components/pages/activity-logs/staff-activity-logs-panel";
import { useTranslations } from "next-intl";

export default function ActivityLogsPage() {
  const activityLogs = useTranslations("activityLogs");

  return (
    <Container>
      <div className="w-full space-y-7">
        <Header
          title={activityLogs("title")}
          description={activityLogs("description")}
        />

        <StaffActivityLogsPanel />
      </div>
    </Container>
  );
}
