"use client";

import { Card } from "@/components/ui/card";
import OrdersGraph from "../../graphs/orders-graph";
import { useGetOrdersStats, useGetOrdersTrend } from "@/hooks/useDashboard";
import { useTranslations } from "next-intl";

type TrendRange = "daily" | "weekly" | "monthly";

export default function OrdersTrendSection({
  type = "home",
}: {
  type: string;
}) {
  const common = useTranslations("common");
  const orders = useTranslations("orders");
  const range: TrendRange = "daily";

  const {
    data: ordersStatsResponse,
    isLoading: statsLoading,
    isFetching: statsFetching,
  } = useGetOrdersStats();

  const {
    data: ordersTrendResponse,
    isLoading: trendLoading,
    isFetching: trendFetching,
  } = useGetOrdersTrend({
    range,
  });

  const report = ordersStatsResponse?.data;
  const trend = ordersTrendResponse?.data;

  const loading = statsLoading || statsFetching || trendLoading || trendFetching;

  const peakPoint =
    trend?.points?.reduce((max: any, item: any) => {
      if (!max || item.value > max.value) return item;
      return max;
    }, null) || null;

  const paidOrders =
    report?.paymentStatusBreakdown?.find(
      (item: any) => item.status?.toUpperCase() === "PAID"
    )?.count ?? 0;

  const pendingOrders =
    report?.paymentStatusBreakdown?.find(
      (item: any) => item.status?.toUpperCase() === "PENDING"
    )?.count ?? 0;

  const deliveredOrders =
    report?.statusBreakdown?.find(
      (item: any) => item.status?.toUpperCase() === "DELIVERED"
    )?.count ?? 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px] w-full">
      <OrdersGraph type={type} />

      <div className="flex flex-col gap-[24px] pr-2 lg:pr-0">
        <MetricCard
          title={orders("paidOrders")}
          value={loading ? "..." : String(paidOrders)}
          subtitle={
            loading
              ? common("loading")
              : orders("deliveredOrdersCount", { count: deliveredOrders })
          }
        />

        <MetricCard
          title={orders("peakDay")}
          value={loading ? "..." : peakPoint?.label || "-"}
          subtitle={
            loading
              ? common("loading")
              : orders("ordersInSelectedRange", {
                  count: peakPoint?.value ?? 0,
                })
          }
        />

        <MetricCard
          title={orders("pendingOrders")}
          value={loading ? "..." : String(pendingOrders)}
          subtitle={orders("awaitingPaymentCompletion")}
        />
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <Card
      style={{
        background:
          "linear-gradient(134.39deg, rgba(216, 0, 39, 0) 50.72%, rgba(216, 0, 39, 0.12) 107.74%), #FFFFFF",
      }}
      className="flex flex-col justify-center p-[24px] border-none shadow-none rounded-[10px] h-full"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1 min-w-0">
          <p className="text-gray text-base">{title}</p>
          <p className="text-gray text-base truncate">{subtitle}</p>
        </div>
        <p className="text-green text-lg font-semibold text-right break-words max-w-[45%]">
          {value}
        </p>
      </div>
    </Card>
  );
}
