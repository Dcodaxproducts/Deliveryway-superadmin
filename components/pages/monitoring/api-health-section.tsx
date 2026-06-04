"use client";

import HealthStatCard from "@/components/cards/health-card";
import { Card } from "@/components/ui/card";
import { useGetRequestMetrics } from "@/hooks/useSystemHealth";

/**
 * ==============================
 * TYPES
 * ==============================
 */
type StatusType = "Healthy" | "Warning" | "Critical";

type StatItem = {
  title: string;
  value: string;
  percentage: number;
  status: StatusType;
};

/**
 * ==============================
 * HELPERS
 * ==============================
 */
const getStatus = (percentage: number): StatusType => {
  if (percentage < 80) return "Critical";
  if (percentage < 95) return "Warning";
  return "Healthy";
};



const ApiHealthSection = () => {
  const { data, isLoading, isFetching } = useGetRequestMetrics("hour");

  const summary = data?.summary;

  /**
   * ==============================
   * DYNAMIC STATS
   * ==============================
   */
  const stats: StatItem[] = [
    {
      title: "Success Rate",
      value: `${summary?.successRate ?? 0}%`,
      percentage: summary?.successRate ?? 0,
      status: getStatus(summary?.successRate ?? 0),
    },
    {
      title: "Failure Rate",
      value: `${summary?.failureRate ?? 0}%`,
      percentage: summary?.failureRate ?? 0,
      status:
        summary?.failureRate === 0
          ? "Healthy"
          : ("Critical" as StatusType),
    },
    {
      title: "Total Requests",
      value: `${summary?.totalRequests ?? 0}`,
      percentage: 100,
      status: "Healthy",
    },
  ];

  return (
    <section className="space-y-[20px]">
      <h3 className="text-lg font-semibold text-dark">API Health</h3>

     <div className="grid grid-cols-1 lg:grid-cols-4 gap-[24px]">
  {(isLoading || isFetching) ? (
    <>
      {[1, 2, 3].map((i) => (
        <HealthStatCard key={i} loading />
      ))}

      {/* Latency Skeleton */}
      <Card className="p-[24px] border-none shadow-sm rounded-[14px] flex flex-col justify-center bg-white animate-pulse">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-20 bg-gray-200 rounded" />
          <div className="h-3 w-28 bg-gray-200 rounded" />
          <div className="h-3 w-16 bg-gray-200 rounded" />
        </div>
      </Card>
    </>
  ) : (
    <>
      {stats.map((stat, index) => (
        <HealthStatCard key={index} {...stat} />
      ))}

      <Card
        style={{
          background: `linear-gradient(134.39deg, rgba(216, 0, 39, 0) 50.72%, rgba(216, 0, 39, 0.08) 107.74%), #FFFFFF`,
        }}
        className="p-[24px] border-none shadow-sm rounded-[14px] flex flex-col justify-center"
      >
        <h4 className="text-base text-dark mb-1">
          Average Latency
        </h4>

        <p className="text-xs text-gray mb-2">
          {summary?.averageLatencyMs ?? 0} ms
        </p>

        <p className="text-base text-gray">
          {summary?.totalRequests ?? 0} total requests
        </p>

        <p className="text-xs text-gray mt-1">
          P95: {summary?.p95LatencyMs ?? 0} ms
        </p>
      </Card>
    </>
  )}
</div>
    </section>
  );
};

export default ApiHealthSection;