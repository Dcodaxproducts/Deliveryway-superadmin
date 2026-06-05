"use client";

import { Card } from "@/components/ui/card";
import RevenueGraph from "../../graphs/revenue-graph";
import { useGetDashboardSystemAlerts } from "@/hooks/useDashboard";
import { AlertCircle, Info, ShieldAlert, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";

const getSeverityStyles = (severity?: string) => {
  switch ((severity || "").toLowerCase()) {
    case "warning":
      return {
        wrapper: "bg-[#FFF7ED]",
        dot: "bg-primary",
        text: "text-[#364153]",
        icon: TriangleAlert,
        iconColor: "text-primary",
      };

    case "error":
    case "danger":
      return {
        wrapper: "bg-[#FFF7ED]",
        dot: "bg-primary",
        text: "text-[#364153]",
        icon: ShieldAlert,
        iconColor: "text-primary",
      };

    case "success":
      return {
        wrapper: "bg-[#FFF7ED]",
        dot: "bg-primary",
        text: "text-[#364153]",
        icon: AlertCircle,
        iconColor: "text-primary",
      };

    case "info":
    default:
      return {
        wrapper: "bg-[#FFF7ED]",
        dot: "bg-primary",
        text: "text-[#364153]",
        icon: Info,
        iconColor: "text-primary",
      };
  }
};

export default function RevenueAnalytics() {
  const common = useTranslations("common");
  const dashboard = useTranslations("dashboard");
  const {
    data: alertsResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetDashboardSystemAlerts();

  const alerts = alertsResponse?.data?.items || [];
  const loading = isLoading || isFetching;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px] w-full">
      <RevenueGraph />

      {/* System Alerts Card */}
      <Card className="p-4 lg:p-[24px] border-none shadow-sm rounded-[10px] bg-white">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base text-dark">{dashboard("systemAlerts")}</h3>

          <button
            type="button"
            onClick={() => refetch()}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-gray-200 text-gray-500 transition hover:border-primary hover:bg-primary/5 hover:text-primary"
            aria-label={dashboard("refreshSystemAlerts")}
            title={common("refresh")}
          >
            <svg
              className={loading ? "animate-spin" : ""}
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 2v6h-6" />
              <path d="M3 12a9 9 0 0 1 15.55-6.36L21 8" />
              <path d="M3 22v-6h6" />
              <path d="M21 12a9 9 0 0 1-15.55 6.36L3 16" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-xl border border-[#F3F4F6] bg-[#FAFAFA] p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-gray-200 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 rounded bg-gray-200 animate-pulse" />
                    <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
                  </div>
                </div>
              </div>
            ))
          ) : alerts.length > 0 ? (
            alerts.map((alert: any, index: number) => {
              const styles = getSeverityStyles(alert?.severity);
              const Icon = styles.icon;

              return (
                <div
                  key={alert?.key || index}
                  className={`rounded-xl p-4 ${styles.wrapper}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      <Icon size={18} className={styles.iconColor} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="text-sm font-semibold text-dark">
                          {alert?.title || dashboard("systemAlert")}
                        </h4>

                        {typeof alert?.count === "number" && (
                          <span className="inline-flex min-w-[24px] items-center justify-center rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-dark">
                            {alert.count}
                          </span>
                        )}
                      </div>

                      <p className={`mt-1 text-sm ${styles.text}`}>
                        {alert?.message || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
              {dashboard("noSystemAlerts")}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
