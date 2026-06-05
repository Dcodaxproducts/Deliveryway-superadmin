"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card } from "@/components/ui/card";
import { useGetRevenueTrend } from "@/hooks/useDashboard";
import { useTranslations } from "next-intl";

type TrendRange = "daily" | "weekly" | "monthly";

const RevenueGraph = ({ type = "home" }: { type?: string }) => {
  const common = useTranslations("common");
  const dashboard = useTranslations("dashboard");
  const [range, setRange] = useState<TrendRange>("daily");

  const {
    data: revenueTrendResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetRevenueTrend({
    range,
  });

  const trendData = revenueTrendResponse?.data;

  const revenueData = useMemo(() => {
    return (
      trendData?.points?.map((point: any) => ({
        key: point.key,
        day: point.label,
        revenue: point.value,
        cumulativeRevenue: point.cumulativeTotal,
      })) || []
    );
  }, [trendData]);

  const currency = trendData?.currency ?? "USD";
  const totalRevenueInRange = trendData?.totalRevenueInRange ?? 0;
  const loading = isLoading || isFetching;

  const formatCurrency = (value: number) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(value);
    } catch {
      return `${currency} ${Number(value).toLocaleString()}`;
    }
  };

  const formatCompactCurrency = (value: number) => {
    if (value >= 1000000) return `${currency} ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${currency} ${(value / 1000).toFixed(1)}K`;
    return `${currency} ${value}`;
  };

  return (
    <Card
      className={`lg:col-span-2 p-4 lg:p-[25.5px] ${
        type === "home" ? "border-none" : "lg:border-gray-200"
      } shadow-sm rounded-[10px] bg-white`}
    >
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-base font-medium text-dark">{dashboard("revenueTrend")}</h3>

            <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {loading ? common("loading") : formatCurrency(totalRevenueInRange)}
            </div>
          </div>

          <p className="mt-1 text-sm text-gray-400 capitalize">
            {dashboard("revenueSelectedRange", {
              range: dashboard(`ranges.${range}`),
            })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-[10px] bg-[#F3F4F6] p-1 gap-[8px]">
            {(["daily", "weekly", "monthly"] as TrendRange[]).map((item) => {
              const active = range === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setRange(item)}
                  className={`h-[32px] rounded-[10px] px-4 text-sm font-medium capitalize transition-all ${
                    active
                      ? "bg-primary text-white"
                      : "text-[#4A5565] hover:text-dark"
                  }`}
                >
                  {dashboard(`ranges.${item}`)}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-gray-200 text-gray-500 transition hover:border-primary hover:bg-primary/5 hover:text-primary"
            aria-label={dashboard("refreshRevenueTrend")}
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
      </div>

      <div className="h-[250px] w-full">
        {loading ? (
          <div className="h-full w-full animate-pulse rounded-[12px] bg-gray-100" />
        ) : revenueData.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-[12px] border border-dashed border-gray-200 text-sm text-gray-400">
            {dashboard("noRevenueTrendData")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={revenueData}
              margin={{ top: 5, right: 0, left: -20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#CE181B" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#CE181B" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={true}
                horizontal={true}
                stroke="#E5E7EB"
              />

              <XAxis
                dataKey="day"
                axisLine={{ stroke: "#E5E7EB", strokeWidth: 1 }}
                tickLine={false}
                tick={{ fill: "#8E8E8E", fontSize: 12 }}
                dy={10}
              />

              <YAxis
                axisLine={{ stroke: "#E5E7EB", strokeWidth: 1 }}
                tickLine={false}
                tickFormatter={(v) => formatCompactCurrency(Number(v))}
                tick={{ fill: "#8E8E8E", fontSize: 12 }}
                width={80}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                cursor={{ fill: "transparent" }}
                formatter={(value: number) => [
                  formatCurrency(value),
                  dashboard("revenue"),
                ]}
                labelFormatter={(label) =>
                  dashboard("periodLabel", { label })
                }
              />

              <Bar
                dataKey="revenue"
                fill="url(#barGradient)"
                radius={[4, 4, 0, 0]}
                barSize={type !== "analytics" ? 32 : 61}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

export default RevenueGraph;
