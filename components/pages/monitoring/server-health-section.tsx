"use client";

import HealthCard from "@/components/cards/health-card";
import { serverHealthStats } from "@/constants/monitoring";
import { useGetSystemHealthOverview } from "@/hooks/useSystemHealth";
import { useTranslations } from "next-intl";

/**
 * ==============================
 * TYPES
 * ==============================
 */
type StatusType = "Healthy" | "Warning" | "Critical";

type StatType = {
  title: string;
  value: string;
  subValue?: string;
  percentage: number;
  status: StatusType;
};

/**
 * ==============================
 * HELPERS
 * ==============================
 */
const getStatus = (percentage: number): StatusType => {
  if (percentage > 90) return "Critical";
  if (percentage > 70) return "Warning";
  return "Healthy";
};

const formatBytes = (bytes: number) => {
  if (!bytes) return "0 GB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
};

const formatUptime = (seconds: number) => {
  if (!seconds) return "0h";
  const hours = Math.floor(seconds / 3600);
  return `${hours}h`;
};


export const ServerHealthSection = () => {
  const monitoring = useTranslations("monitoring");
  const { data, isLoading, isFetching } = useGetSystemHealthOverview();

  /**
   * ==============================
   * DYNAMIC DATA
   * ==============================
   */
  const dynamicStats: StatType[] = [
    {
      title: monitoring("cpuUsage"),
      value: `${data?.server?.cpu?.estimatedUsagePercent ?? 0}%`,
      percentage: data?.server?.cpu?.estimatedUsagePercent ?? 0,
      status: getStatus(data?.server?.cpu?.estimatedUsagePercent ?? 0),
    },
    {
      title: monitoring("memoryUsage"),
      value: formatBytes(data?.server?.memory?.usedBytes ?? 0),
      subValue: formatBytes(data?.server?.memory?.totalBytes ?? 0),
      percentage: data?.server?.memory?.usedPercent ?? 0,
      status: getStatus(data?.server?.memory?.usedPercent ?? 0),
    },
    {
      title: monitoring("diskUsage"),
      value: formatBytes(data?.server?.disk?.usedBytes ?? 0),
      subValue: formatBytes(data?.server?.disk?.totalBytes ?? 0),
      percentage: data?.server?.disk?.usedPercent ?? 0,
      status: getStatus(data?.server?.disk?.usedPercent ?? 0),
    },
    {
      title: monitoring("uptime"),
      value: formatUptime(data?.server?.uptimeSeconds ?? 0),
      percentage: 100,
      status: "Healthy",
    },
  ];

  /**
   * ==============================
   * FALLBACK MERGE
   * ==============================
   */
  const finalStats: StatType[] = dynamicStats.map((stat, index) => {
    const fallback = serverHealthStats[index];

    return {
      title: stat.title || fallback.title,
      value: stat.value || fallback.value,
      subValue: stat.subValue || fallback.subValue,
      percentage: stat.percentage ?? fallback.percentage,
      status: stat.status ?? (fallback.status as StatusType),
    };
  });

  return (
    <section className="space-y-[20px]">
      <h3 className="text-lg font-semibold text-dark">
        {monitoring("serverHealth")}
      </h3>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
  {(isLoading || isFetching)
    ? [1, 2, 3, 4].map((i) => <HealthCard key={i} loading />)
    : finalStats.map((stat, index) => (
        <HealthCard key={index} {...stat} />
      ))}
</div>

    </section>
  );
};
