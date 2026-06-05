"use client";

import OrdersGraph from "@/components/graphs/orders-graph";
import { useTranslations } from "next-intl";

export const ApiLatencyChartSection = () => {
  const monitoring = useTranslations("monitoring");

  return (
    <section className="space-y-[20px]">
      <OrdersGraph
        title={monitoring("apiLatencyOverTime")}
        description={monitoring("apiLatencyDescription")}
      />
    </section>
  );
};
