"use client";

import { useMemo, useState } from "react";
import Container from "../../../components/container";
import RevenueGraph from "@/components/graphs/revenue-graph";
import Header from "@/components/header";
import StatsSection from "@/components/shared/stats-section";
import OrdersGraph from "@/components/graphs/orders-graph";
import TopPerformingRestaurants from "../models/top-restaurants-section";
import Filter from "@/components/pages/analytics/filter";
import { useGetOrdersReport } from "@/hooks/useReports";
import { StatItem } from "@/types/stats";

type DateRangeValue =
  | "all-time"
  | "last-7"
  | "last-30"
  | "this-month"
  | "last-month"
  | "individual";

const formatDateForInput = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getDateRangeParams = (
  range: DateRangeValue,
  customRange?: {
    fromDate?: string;
    toDate?: string;
  }
) => {
  const today = new Date();
  const endDate = formatDateForInput(today);

  if (range === "all-time") {
    return {};
  }

  if (range === "individual") {
    return {
      fromDate: customRange?.fromDate || undefined,
      toDate: customRange?.toDate || undefined,
    };
  }

  if (range === "last-7") {
    const from = new Date(today);
    from.setDate(today.getDate() - 6);

    return {
      fromDate: formatDateForInput(from),
      toDate: endDate,
    };
  }

  if (range === "last-30") {
    const from = new Date(today);
    from.setDate(today.getDate() - 29);

    return {
      fromDate: formatDateForInput(from),
      toDate: endDate,
    };
  }

  if (range === "last-month") {
    const firstDayOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );

    const lastDayOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      0
    );

    return {
      fromDate: formatDateForInput(firstDayOfLastMonth),
      toDate: formatDateForInput(lastDayOfLastMonth),
    };
  }

  const firstDayOfCurrentMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  return {
    fromDate: formatDateForInput(firstDayOfCurrentMonth),
    toDate: endDate,
  };
};

const formatCurrency = (value: number | string | null | undefined) => {
  const numeric = Number(value ?? 0);

  if (Number.isNaN(numeric)) {
    return "$0.00";
  }

  return `$${numeric.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;
};

const AnalyticsPage = () => {
  const [dateRange, setDateRange] = useState<DateRangeValue>("all-time");

  const [customFromDate, setCustomFromDate] = useState("");
  const [customToDate, setCustomToDate] = useState("");

  const [exportType, setExportType] = useState<"orders" | "customers" | "menu">(
    "orders"
  );

  const reportParams = useMemo(() => {
    return getDateRangeParams(dateRange, {
      fromDate: customFromDate,
      toDate: customToDate,
    });
  }, [dateRange, customFromDate, customToDate]);

  const {
    data: ordersReportResponse,
    isLoading,
    isFetching,
  } = useGetOrdersReport(reportParams);

  const report = ordersReportResponse?.data;

  const statsData: StatItem[] = useMemo(() => {
    const paidCount =
      report?.paymentStatusBreakdown?.find(
        (item: any) => item.key?.toUpperCase() === "PAID"
      )?.count ?? 0;

    const pendingCount =
      report?.paymentStatusBreakdown?.find(
        (item: any) => item.key?.toUpperCase() === "PENDING"
      )?.count ?? 0;

    const deliveredCount =
      report?.statusBreakdown?.find(
        (item: any) => item.key?.toUpperCase() === "DELIVERED"
      )?.count ?? 0;

    return [
      {
        _id: "total-orders",
        title: "Total Orders",
        value: String(report?.totalOrders ?? 0),
        footerType: "trend",
        trendData: {
          direction: "up",
          percentage: String(deliveredCount),
          label: "delivered orders",
        },
      },
      {
        _id: "total-revenue",
        title: "Total Revenue",
        value: formatCurrency(report?.totalRevenue),
        footerType: "plain",
        description: "Revenue from all orders",
      },
      {
        _id: "average-order-value",
        title: "Average Order Value",
        value: formatCurrency(report?.averageOrderValue),
        footerType: "plain",
        description: "Average revenue per order",
      },
      {
        _id: "paid-orders",
        title: "Paid Orders",
        value: String(paidCount),
        footerType: "trend",
        trendData: {
          direction: pendingCount > paidCount ? "down" : "up",
          percentage: String(pendingCount),
          label: "pending payments",
        },
      },
    ];
  }, [report]);

  return (
    <Container>
      <Header
        title="Reports & Analytics"
        description="Welcome back! Here's what's happening with your platform today."
      />

      <Filter
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        customFromDate={customFromDate}
        onCustomFromDateChange={setCustomFromDate}
        customToDate={customToDate}
        onCustomToDateChange={setCustomToDate}
        exportType={exportType}
        onExportTypeChange={setExportType}
        exportParams={reportParams}
      />

      <StatsSection stats={statsData} isLoading={isLoading || isFetching} />

      <OrdersGraph />

      <RevenueGraph type="analytics" />

      <TopPerformingRestaurants />
    </Container>
  );
};

export default AnalyticsPage;