"use client";

import { useMemo, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { useGetOrdersTrend } from "@/hooks/useDashboard";

type TrendRange = "daily" | "weekly" | "monthly";

type OrdersGraphProps = {
  type?: string;
  title?: string;
  description?: string;
};

const OrdersGraph = ({
  title = "Orders Trend",
  description,
}: OrdersGraphProps) => {
  const [range, setRange] = useState<TrendRange>("daily");

  const {
    data: ordersTrendResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetOrdersTrend({
    range,
  });

  const trendData = ordersTrendResponse?.data;

  const chartData = useMemo(() => {
    return (
      trendData?.points?.map((item: any) => ({
        label: item.label,
        orders: item.value || 0,
        cumulativeTotal: item.cumulativeTotal || 0,
      })) || []
    );
  }, [trendData]);

  const loading = isLoading || isFetching;
  const totalOrdersInRange = trendData?.totalOrdersInRange ?? 0;
  const currentRange = trendData?.range ?? range;

  return (
    <Card className="lg:col-span-2 p-4 lg:p-[25.5px] border-none shadow-none rounded-[10px] bg-white">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-base font-medium text-dark">{title}</h3>

            <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {loading ? "Loading..." : `${totalOrdersInRange} orders`}
            </div>
          </div>

          <p className="mt-1 text-sm text-gray">
            {description ||
              `Track orders across the selected ${currentRange} range`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-[10px] bg-[#F3F4F6] p-1 gap-[8px]">
            {(["daily", "weekly", "monthly"] as TrendRange[]).map((r) => (
              <button
                key={r}
                type="button"
                className={`h-[32px] px-4 text-sm font-medium rounded-[10px] capitalize transition-all ${
                  range === r
                    ? "bg-primary text-white"
                    : "text-[#4A5565] hover:text-dark"
                }`}
                onClick={() => setRange(r)}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-gray-200 text-gray-500 transition hover:border-primary hover:bg-primary/5 hover:text-primary"
            aria-label="Refresh order trend"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="h-[250px] w-full">
        {loading ? (
          <div className="h-full w-full animate-pulse rounded-[12px] bg-gray-100" />
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-[12px] border border-dashed border-gray-200 text-sm text-gray-400">
            No order trend data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 0, left: -20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                horizontal={false}
                stroke="#BBBBBB"
              />

              <XAxis
                dataKey="label"
                axisLine={{ stroke: "#E5E7EB", strokeWidth: 1 }}
                tickLine={false}
                tick={{ fill: "#BBBBBB", fontSize: 12 }}
                dy={10}
              />

              <YAxis
                axisLine={{ stroke: "#E5E7EB", strokeWidth: 1 }}
                tickLine={false}
                tick={{ fill: "#BBBBBB", fontSize: 12 }}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                formatter={(value: number) => [`${value}`, "Orders"]}
              />

              <Line
                type="monotone"
                dataKey="orders"
                stroke="#CE181B"
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: "#CE181B",
                  strokeWidth: 2,
                  stroke: "#fff",
                }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

export default OrdersGraph;