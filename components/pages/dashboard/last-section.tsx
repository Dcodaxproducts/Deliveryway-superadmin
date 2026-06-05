"use client";

import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import {
  useGetDashboardRecentActivity,
} from "@/hooks/useDashboard";
import { useGetSystemHealthOverview } from "@/hooks/useSystemHealth";
import {
  Activity,
  CreditCard,
  Bell,
  Store,
  ShieldCheck,
  AlertTriangle,
  Server,
  Database,
} from "lucide-react";
import { useTranslations } from "next-intl";

type DashboardTranslator = ReturnType<typeof useTranslations>;

const formatTimeAgo = (dateString: string | undefined, dashboard: DashboardTranslator) => {
  if (!dateString) return "-";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (Number.isNaN(diffMs)) return "-";

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return dashboard("justNow");
  if (minutes < 60) return dashboard("minutesAgo", { count: minutes });
  if (hours < 24) return dashboard("hoursAgo", { count: hours });
  return dashboard("daysAgo", { count: days });
};

const getActivityStyles = (type?: string) => {
  switch ((type || "").toUpperCase()) {
    case "PAYMENT":
      return {
        icon: CreditCard,
        bg: "bg-[#FFF7ED]",
        color: "text-primary",
      };
    case "ORDER":
      return {
        icon: Activity,
        bg: "bg-[#EEF2FF]",
        color: "text-[#6366F1]",
      };
    case "RESTAURANT":
      return {
        icon: Store,
        bg: "bg-[#ECFDF3]",
        color: "text-[#16A34A]",
      };
    case "NOTIFICATION":
      return {
        icon: Bell,
        bg: "bg-[#F5F3FF]",
        color: "text-[#7C3AED]",
      };
    default:
      return {
        icon: Activity,
        bg: "bg-[#F3F4F6]",
        color: "text-[#6B7280]",
      };
  }
};

const formatUptime = (seconds?: number) => {
  if (!seconds || seconds < 0) return "-";

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);

  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
};

export default function SystemStatus() {
  const common = useTranslations("common");
  const dashboard = useTranslations("dashboard");
  const router = useRouter();

  const {
    data: activityResponse,
    isLoading: activityLoading,
    isFetching: activityFetching,
    refetch: refetchActivity,
  } = useGetDashboardRecentActivity({ limit: 6 });

  const {
    data: healthResponse,
    isLoading: healthLoading,
    isFetching: healthFetching,
    refetch: refetchHealth,
  } = useGetSystemHealthOverview();

  const activities = activityResponse?.data?.items || [];
  const health = healthResponse;

  const loadingActivity = activityLoading || activityFetching;
  const loadingHealth = healthLoading || healthFetching;

  const systemHealth = [
    {
      label: dashboard("systemStatus"),
      value: health?.status === "healthy" ? dashboard("healthy") : health?.status || "-",
      status: health?.status === "healthy" ? "success" : "warning",
      icon: ShieldCheck,
    },
    {
      label: dashboard("database"),
      value: health?.database?.status === "up" ? dashboard("connected") : dashboard("issue"),
      status: health?.database?.status === "up" ? "success" : "warning",
      icon: Database,
    },
    {
      label: dashboard("memoryUsage"),
      value:
        typeof health?.server?.memory?.usedPercent === "number"
          ? `${health.server.memory.usedPercent.toFixed(1)}%`
          : "-",
      status:
        (health?.server?.memory?.usedPercent ?? 0) < 80 ? "success" : "warning",
      icon: Server,
    },
    {
      label: dashboard("diskUsage"),
      value:
        typeof health?.server?.disk?.usedPercent === "number"
          ? `${health.server.disk.usedPercent.toFixed(1)}%`
          : "-",
      status:
        (health?.server?.disk?.usedPercent ?? 0) < 85 ? "success" : "warning",
      icon: AlertTriangle,
    },
    {
      label: dashboard("apiSuccessRate"),
      value:
        typeof health?.api?.successRate === "number"
          ? `${health.api.successRate}%`
          : "-",
      status:
        (health?.api?.successRate ?? 0) >= 95 ? "success" : "warning",
      icon: Activity,
    },
    {
      label: dashboard("serverUptime"),
      value: formatUptime(health?.server?.uptimeSeconds),
      status: "success",
      icon: Server,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px] w-full">
      {/* System Health Card */}
      <Card
        onClick={() => router.push("/monitoring")}
        className="cursor-pointer p-4 lg:p-[24px] border-none shadow-sm rounded-[10px] bg-white transition hover:shadow-md"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base text-dark">{dashboard("systemHealth")}</h3>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              refetchHealth();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-gray-200 text-gray-500 transition hover:border-primary hover:bg-primary/5 hover:text-primary"
            aria-label={dashboard("refreshSystemHealth")}
            title={common("refresh")}
          >
            <svg
              className={loadingHealth ? "animate-spin" : ""}
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

        <div className="space-y-5">
          {loadingHealth ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4"
              >
                <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
                <div className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
              </div>
            ))
          ) : (
            systemHealth.map((item, index) => {
              const Icon = item.icon;
              const isSuccess = item.status === "success";

              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex size-7 items-center justify-center rounded-full ${
                        isSuccess
                          ? "bg-green/10 text-green"
                          : "bg-[#FFF7ED] text-primary"
                      }`}
                    >
                      <Icon size={14} />
                    </div>

                    <span className="text-base text-[#364153] truncate">
                      {item.label}
                    </span>
                  </div>

                  <span
                    className={`text-sm lg:text-base font-medium ${
                      isSuccess ? "text-green" : "text-primary"
                    }`}
                  >
                    {item.value}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Recent Activity Card */}
      <Card className="lg:col-span-2 p-4 lg:p-[24px] border-none shadow-sm rounded-[10px] bg-white">
        <div className="mb-[16px] flex items-center justify-between">
          <h3 className="text-base text-dark">{dashboard("recentActivity")}</h3>

          <button
            type="button"
            onClick={() => refetchActivity()}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-gray-200 text-gray-500 transition hover:border-primary hover:bg-primary/5 hover:text-primary"
            aria-label={dashboard("refreshRecentActivity")}
            title={common("refresh")}
          >
            <svg
              className={loadingActivity ? "animate-spin" : ""}
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

        <div className="flex flex-col gap-[12px]">
          {loadingActivity ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-gray-200 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-52 rounded bg-gray-200 animate-pulse" />
                  <div className="h-3 w-24 rounded bg-gray-200 animate-pulse" />
                </div>
              </div>
            ))
          ) : activities.length > 0 ? (
            activities.map((activity: any) => {
              const styles = getActivityStyles(activity?.type);
              const Icon = styles.icon;

              return (
                <div key={activity.id} className="flex items-start gap-4">
                  <div
                    className={`p-2 rounded-lg shrink-0 ${styles.bg} ${styles.color}`}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base text-dark">
                      {activity.title || dashboard("activity")}
                    </p>
                    <p className="text-sm text-gray line-clamp-1">
                      {activity.description || "-"}
                    </p>
                    <p className="text-sm text-gray mt-1">
                      {formatTimeAgo(activity.occurredAt, dashboard)}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
              {dashboard("noRecentActivity")}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
