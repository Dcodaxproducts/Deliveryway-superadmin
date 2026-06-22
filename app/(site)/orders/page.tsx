"use client";

import { useCallback, useMemo, useState } from "react";
import Container from "@/components/container";
import Filters from "@/components/filter";
import RevenueGraph from "@/components/graphs/revenue-graph";
import Header from "@/components/header";
import OrdersTrendSection from "@/components/pages/orders/order-trend-section";
import StatsSection from "@/components/shared/stats-section";
import { DataTable } from "@/components/custom/data-table";
import TableSkeleton from "@/components/skeleton/table-skeleton";
import SortHeader from "@/components/tables/sort-header";
import { TableCell, TableHead } from "@/components/ui/table";
import { useGetOrders } from "@/hooks/useOrder";
import { useGetOrdersReport } from "@/hooks/useReports";
import { useDebounce } from "@/hooks/useDebounce";
import { GetOrdersParams, Order } from "@/services/order";
import { getRestaurants } from "@/services/restaurant";
import { Eye } from "lucide-react";
import OrderDetailsDialog from "@/components/dialogs/order-details-dialog";
import { StatItem } from "@/types/stats";
import { useTranslations } from "next-intl";

type SortKey =
  | "id"
  | "createdAt"
  | "totalAmount"
  | "status"
  | "orderType"
  | "kind";

type SortDir = "asc" | "desc";

const PAGE_LIMIT = 10;

const extractOrders = (response: any): Order[] => {
  if (!response) return [];

  const candidates = [
    response?.data?.items,
    response?.data?.orders,
    response?.data?.data,
    response?.items,
    response?.orders,
    response?.data,
  ];

  const raw = candidates.find((candidate) => Array.isArray(candidate));

  return Array.isArray(raw) ? raw : [];
};

const extractMeta = (response: any) => {
  return (
    response?.meta ||
    response?.pagination ||
    response?.data?.meta ||
    response?.data?.pagination ||
    response?.data?.data?.meta ||
    response?.data?.data?.pagination ||
    null
  );
};

const extractRestaurants = (response: any) => {
  const candidates = [
    response?.data?.items,
    response?.data?.restaurants,
    response?.data?.data,
    response?.items,
    response?.restaurants,
    response?.data,
  ];

  const raw = candidates.find((candidate) => Array.isArray(candidate));

  return Array.isArray(raw) ? raw : [];
};

const extractRestaurantsMeta = (response: any) => {
  return (
    response?.data?.pagination ||
    response?.data?.meta ||
    response?.pagination ||
    response?.meta ||
    {}
  );
};

const formatStatus = (status: string | undefined, filters: (key: string) => string) => {
  if (!status) return "-";

  const statusMap: Record<string, string> = {
    PLACED: "orderStatusPlaced",
    CONFIRMED: "orderStatusConfirmed",
    PREPARING: "orderStatusPreparing",
    READY_FOR_PICKUP: "orderStatusReadyForPickup",
    PICKED_UP: "orderStatusPickedUp",
    READY_TO_SERVE: "orderStatusReadyToServe",
    SERVED: "orderStatusServed",
    OUT_FOR_DELIVERY: "orderStatusOutForDelivery",
    DELIVERED: "orderStatusDelivered",
    CANCELLED: "orderStatusCancelled",
    REJECTED: "orderStatusRejected",
    DELIVERY: "orderTypeDelivery",
    TAKEAWAY: "orderTypeTakeaway",
    DINE_IN: "orderTypeDineIn",
    PENDING: "paymentStatusPending",
    PAID: "paymentStatusPaid",
    FAILED: "paymentStatusFailed",
    REFUNDED: "paymentStatusRefunded",
  };

  const key = statusMap[status.toUpperCase()];
  return key ? filters(key) : status.replaceAll("_", " ");
};

const formatCurrency = (value: any, currency: string) => {
  const numeric = Number(value ?? 0);

  if (Number.isNaN(numeric)) {
    return `${currency} 0.00`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
};

const getCustomerName = (order: any) => {
  return (
    order?.customer?.fullName ||
    order?.customer?.name ||
    `${order?.customer?.firstName || ""} ${
      order?.customer?.lastName || ""
    }`.trim() ||
    "Guest"
  );
};

const getRestaurantName = (order: any) => {
  return (
    order?.restaurant?.name ||
    order?.branch?.restaurant?.name ||
    order?.restaurantName ||
    "-"
  );
};

const getOrderDate = (order: any) => {
  const rawDate = order?.createdAt || order?.orderTime || order?.placedAt;

  if (!rawDate) return "-";

  const date = new Date(rawDate);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString();
};

const OrdersPage = () => {
  const common = useTranslations("common");
  const ordersText = useTranslations("orders");
  const customersText = useTranslations("customers");
  const filters = useTranslations("filters");
  const [page, setPage] = useState(1);
  const [limit] = useState(PAGE_LIMIT);

  const [search, setSearch] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [orderType, setOrderType] = useState("");
  const [kind, setKind] = useState("");

  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 500);

  const restaurantId = selectedRestaurant?.id
    ? String(selectedRestaurant.id)
    : undefined;

  const orderQueryParams = useMemo<GetOrdersParams>(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      restaurantId,
      status: status || undefined,
      orderType: orderType || undefined,
      kind: kind || undefined,
      sortBy: sortKey,
      sortOrder: sortDir === "asc" ? ("ASC" as const) : ("DESC" as const),
    }),
    [
      page,
      limit,
      debouncedSearch,
      restaurantId,
      status,
      orderType,
      kind,
      sortKey,
      sortDir,
    ]
  );

  const reportQueryParams = useMemo(
    () => ({
      restaurantId,
      status: status || undefined,
      orderType: orderType || undefined,
      kind: kind || undefined,
    }),
    [restaurantId, status, orderType, kind]
  );

  const {
    data,
    isLoading,
    isFetching,
    isError,
  } = useGetOrders(orderQueryParams);

  const {
    data: ordersReportResponse,
    isLoading: statsLoading,
    isFetching: statsFetching,
  } = useGetOrdersReport(reportQueryParams);

  const fetchRestaurantOptions = useCallback(
    async ({ search, page }: { search: string; page: number }) => {
      const response = await getRestaurants({
        page,
        search: search || undefined,
        includeInactive: true,
      });

      return {
        data: extractRestaurants(response),
        meta: extractRestaurantsMeta(response),
      };
    },
    []
  );

  const report = ordersReportResponse?.data;
  const reportCurrency = report?.currency || "PKR";

  const stats: StatItem[] = useMemo(() => {
    const paidCount =
      report?.paymentStatusBreakdown?.find(
        (item: any) => item.key?.toUpperCase() === "PAID"
      )?.count ?? 0;

    const deliveredCount =
      report?.statusBreakdown?.find(
        (item: any) => item.key?.toUpperCase() === "DELIVERED"
      )?.count ?? 0;

    const deliveryCount =
      report?.orderTypeBreakdown?.find(
        (item: any) => item.key?.toUpperCase() === "DELIVERY"
      )?.count ?? 0;

    const takeawayCount =
      report?.orderTypeBreakdown?.find(
        (item: any) => item.key?.toUpperCase() === "TAKEAWAY"
      )?.count ?? 0;

    const topItem = report?.topItems?.[0];

    return [
      {
        _id: "total-orders",
        titleKey: "orders.totalOrders",
        value: String(report?.totalOrders ?? 0),
        footerType: "trend",
        trendData: {
          direction: "up",
          percentage: String(paidCount),
          labelKey: "orders.paidOrders",
        },
      },
      {
        _id: "total-revenue",
        titleKey: "orders.totalRevenue",
        value: formatCurrency(report?.totalRevenue ?? 0, reportCurrency),
        footerType: "plain",
        description: ordersText("avgPerOrder", {
          amount: formatCurrency(report?.averageOrderValue ?? 0, reportCurrency),
        }),
      },
      {
        _id: "order-channels",
        titleKey: "orders.deliveryVsPickup",
        value: `${deliveryCount}/${takeawayCount}`,
        footerType: "trend",
        trendData: {
          direction: "up",
          percentage: String(deliveredCount),
          labelKey: "orders.deliveredOrders",
        },
      },
      {
        _id: "top-selling-item",
        titleKey: "orders.topSellingItem",
        value: topItem?.menuItemName || "-",
        footerType: "plain",
        description: topItem
          ? `${topItem.quantity} sold | ${formatCurrency(
              topItem.revenue ?? 0,
              reportCurrency
            )}`
          : ordersText("noItemSalesYet"),
      },
    ];
  }, [ordersText, report, reportCurrency]);

  const orders = useMemo(() => extractOrders(data), [data]);
  const rawMeta = useMemo(() => extractMeta(data), [data]);

  const pagination = useMemo(() => {
    if (!rawMeta) return undefined;

    const currentPage = Number(rawMeta?.page ?? page);
    const pageSize = Number(rawMeta?.limit ?? limit);
    const total = Number(rawMeta?.total ?? orders.length ?? 0);

    const totalPages = Number(
      rawMeta?.totalPages ??
        rawMeta?.pages ??
        (pageSize > 0 ? Math.ceil(total / pageSize) : 1)
    );

    return {
      page: currentPage,
      limit: pageSize || limit,
      total,
      totalPages: totalPages || 1,
      hasNext:
        typeof rawMeta?.hasNext === "boolean"
          ? rawMeta.hasNext
          : currentPage < (totalPages || 1),
      hasPrevious:
        typeof rawMeta?.hasPrevious === "boolean"
          ? rawMeta.hasPrevious
          : typeof rawMeta?.hasPrev === "boolean"
          ? rawMeta.hasPrev
          : currentPage > 1,
      onPageChange: setPage,
    };
  }, [rawMeta, page, limit, orders.length]);

  const handleSort = (key: SortKey) => {
    setPage(1);

    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir("asc");
  };

  const resetOrdersFilters = () => {
    setSearch("");
    setSelectedRestaurant(null);
    setStatus("");
    setOrderType("");
    setKind("");
    setPage(1);
  };

  if (isError) {
    return (
      <p className="py-6 text-center text-sm text-red-500">
        {common("somethingWentWrong")}
      </p>
    );
  }

  return (
    <Container>
      <Header
        title={ordersText("performanceTitle")}
        description={ordersText("performanceDescription")}
      />

      <StatsSection
        stats={stats}
        className="md:grid-cols-2"
        isLoading={statsLoading || statsFetching}
      />

      <div className="space-y-[30px] rounded-[14px] bg-white lg:p-[30px]">
        <OrdersTrendSection type="orders" />

        <div>
          <RevenueGraph type="orders" />
        </div>
      </div>

      <div className="mt-8 space-y-[30px] rounded-[14px] bg-white lg:p-[30px]">
        <Filters
          type="orders"
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          restaurant={selectedRestaurant}
          onRestaurantChange={(restaurant) => {
            setSelectedRestaurant(restaurant);
            setPage(1);
          }}
          fetchRestaurantOptions={fetchRestaurantOptions}
          status={status}
          onStatusChange={(val) => {
            setStatus(val);
            setPage(1);
          }}
          orderType={orderType}
          onOrderTypeChange={(val) => {
            setOrderType(val);
            setPage(1);
          }}
          kind={kind}
          onKindChange={(val) => {
            setKind(val);
            setPage(1);
          }}
          onReset={resetOrdersFilters}
        />

        {isLoading ? (
          <TableSkeleton cols={8} rows={10} />
        ) : (
          <DataTable
            data={orders}
            headers={
              <>
                <SortHeader
                  label={ordersText("orderId")}
                  sortKey="id"
                  activeKey={sortKey}
                  direction={sortDir}
                  onSort={handleSort}
                />

                <SortHeader
                  label={ordersText("date")}
                  sortKey="createdAt"
                  activeKey={sortKey}
                  direction={sortDir}
                  onSort={handleSort}
                />

                <TableHead>{customersText("customerName")}</TableHead>

                <TableHead>{ordersText("restaurantName")}</TableHead>

                <SortHeader
                  label={ordersText("orderStatus")}
                  sortKey="status"
                  activeKey={sortKey}
                  direction={sortDir}
                  onSort={handleSort}
                />

                <SortHeader
                  label={filters("orderType")}
                  sortKey="orderType"
                  activeKey={sortKey}
                  direction={sortDir}
                  onSort={handleSort}
                />

                <SortHeader
                  label={ordersText("amount")}
                  sortKey="totalAmount"
                  activeKey={sortKey}
                  direction={sortDir}
                  onSort={handleSort}
                />

                <TableHead className="text-center">{common("actions")}</TableHead>
              </>
            }
            row={(order: Order) => (
              <>
                <TableCell className="max-w-[280px]">
                  <span className="block break-all font-mono text-xs text-gray-700">
                    {order.id}
                  </span>
                </TableCell>

                <TableCell>{getOrderDate(order)}</TableCell>

                <TableCell className="capitalize">
                  {getCustomerName(order)}
                </TableCell>

                <TableCell className="capitalize">
                  {getRestaurantName(order)}
                </TableCell>

                <TableCell>{formatStatus(order.status, filters)}</TableCell>

                <TableCell>{formatStatus((order as any).orderType, filters)}</TableCell>

                <TableCell className="text-green">
                  {formatCurrency(
                    (order as any).totalAmount,
                    (order as any).currency || reportCurrency
                  )}
                </TableCell>

                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-4 text-[#A3A3A3]">
                    <button
                      type="button"
                      onClick={() => setSelectedOrderId(order.id)}
                      className="cursor-pointer transition-colors hover:text-dark"
                      aria-label={ordersText("viewOrderDetails")}
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                </TableCell>
              </>
            )}
            pagination={pagination}
          />
        )}

        {isFetching && !isLoading ? (
          <div className="pb-4 text-center text-xs text-gray-400">
            {ordersText("refreshingOrders")}
          </div>
        ) : null}
      </div>

      <OrderDetailsDialog
        open={!!selectedOrderId}
        onOpenChange={(open) => !open && setSelectedOrderId(null)}
        orderId={selectedOrderId}
      />
    </Container>
  );
};

export default OrdersPage;
