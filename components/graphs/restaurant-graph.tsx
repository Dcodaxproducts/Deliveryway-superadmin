"use client";

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
import { useTranslations } from "next-intl";

type RestaurantTrendRange = "daily" | "weekly";

type RestaurantTrendPoint = {
  label?: string;
  value?: number | string | null;
};

type RestaurantGraphProps = {
  data?: RestaurantTrendPoint[];
  isLoading?: boolean;
  range?: RestaurantTrendRange;
  onRangeChange?: (range: RestaurantTrendRange) => void;
};

const rangeOptions: RestaurantTrendRange[] = ["daily", "weekly"];

const RestaurantGraph = ({
  data = [],
  isLoading = false,
  range = "daily",
  onRangeChange,
}: RestaurantGraphProps) => {
  const dashboard = useTranslations("dashboard");
  const common = useTranslations("common");
  const chartData = data.map((item) => ({
    time: item.label || "",
    count: Number(item.value || 0),
  }));

  return (
    <Card className="lg:col-span-2 p-4 lg:p-[25.5px] border-none shadow-sm rounded-[10px] bg-white">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h3 className="text-base text-dark font-medium">{dashboard("restaurantTrend")}</h3>

        <div className="flex rounded-lg gap-[8px]">
          {rangeOptions.map((option) => {
            const isActive = range === option;

            return (
              <button
                key={option}
                type="button"
                className={`px-3 h-[32px] text-sm rounded-md transition-colors cursor-pointer ${
                  isActive
                    ? "bg-primary text-white"
                    : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => onRangeChange?.(option)}
              >
                {dashboard(`ranges.${option}`)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-[250px] w-full">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            {dashboard("loadingChart")}
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            {dashboard("noTrendData")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#F3F4F6"
              />

              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                dy={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />

              <Line
                type="monotone"
                dataKey="count"
                stroke="#CE181B"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: "#CE181B",
                  strokeWidth: 2,
                  stroke: "#fff",
                }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

export default RestaurantGraph;
