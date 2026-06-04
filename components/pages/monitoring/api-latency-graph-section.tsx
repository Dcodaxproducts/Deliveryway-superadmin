"use client";

import { useState } from "react";
import OrdersGraph from "@/components/graphs/orders-graph";
import { useGetRequestMetrics } from "@/hooks/useSystemHealth";

const ApiLatencyChartSection = () => {
  const [range, setRange] = useState<"hour" | "day" | "week">("hour");
  const { data, isLoading, refetch } = useGetRequestMetrics(range);

  const handleRangeChange = (newRange: "hour" | "day" | "week") => {
    setRange(newRange);
    refetch?.();
  };

  return (
    <section className="space-y-[20px]">
      <OrdersGraph
        title="API Latency Over Time"
        description="Monitor real-time API reliability and response times"
        data={data?.buckets || []}
        isLoading={isLoading}
        range={range}
        onRangeChange={handleRangeChange}
      />
    </section>
  );
};

export default ApiLatencyChartSection;