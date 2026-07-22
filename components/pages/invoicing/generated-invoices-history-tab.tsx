"use client";

import { useCallback, useMemo, useState } from "react";
import { FileText, Loader2, Search } from "lucide-react";

import AsyncSelect from "@/components/ui/AsyncSelect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetGeneratedInvoices } from "@/hooks/useGeneratedInvoices";
import { formatMoney } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { getRestaurants } from "@/services/restaurant";
import type {
  GeneratedInvoice,
  GeneratedInvoiceKind,
  GeneratedInvoiceStatus,
} from "@/services/generatedInvoices";

type RestaurantOption = {
  id: string;
  name?: string | null;
  restaurantName?: string | null;
  email?: string | null;
  billingEmail?: string | null;
};

type GeneratedInvoiceFilter = "ALL" | GeneratedInvoiceKind;
type GeneratedStatusFilter = "ALL" | GeneratedInvoiceStatus;

const ALL_FILTER = "ALL";
const KIND_OPTIONS = [
  { value: ALL_FILTER, label: "All kinds" },
  { value: "ORDER", label: "Order" },
  { value: "WEEKLY_PAYOUT", label: "Weekly payout" },
  { value: "MONTHLY_SUBSCRIPTION", label: "Monthly subscription" },
  { value: "SUBSCRIPTION", label: "Subscription" },
];
const STATUS_OPTIONS = [
  { value: ALL_FILTER, label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "GENERATED", label: "Generated" },
  { value: "SENT", label: "Sent" },
  { value: "PAID", label: "Paid" },
  { value: "FAILED", label: "Failed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "VOID", label: "Void" },
];

const formatDate = (value?: string | null) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

const prettyLabel = (value?: string | null) => {
  if (!value) return "-";

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const numericValue = (value?: string | number | null) => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
};

const getSnapshotName = (
  invoice: GeneratedInvoice,
  snapshotKey: "tenant" | "restaurant" | "branch",
) => {
  const snapshot = invoice[`${snapshotKey}Snapshot`];
  const live = invoice[snapshotKey];

  return snapshot?.name || live?.name || "-";
};

const getPeriodStart = (invoice: GeneratedInvoice) => {
  return (
    invoice.period?.from ||
    invoice.period?.start ||
    invoice.period?.startDate ||
    invoice.periodFrom ||
    invoice.fromDate ||
    null
  );
};

const getPeriodEnd = (invoice: GeneratedInvoice) => {
  return (
    invoice.period?.to ||
    invoice.period?.end ||
    invoice.period?.endDate ||
    invoice.periodTo ||
    invoice.toDate ||
    null
  );
};

const getLinkedId = (invoice: GeneratedInvoice) => {
  if (invoice.orderId || invoice.linkedOrderId) {
    return {
      label: "Order",
      value: invoice.orderId || invoice.linkedOrderId,
    };
  }

  if (invoice.subscriptionId || invoice.linkedSubscriptionId) {
    return {
      label: "Subscription",
      value: invoice.subscriptionId || invoice.linkedSubscriptionId,
    };
  }

  return null;
};

const getStatusClassName = (status?: string | null) => {
  const normalized = status?.toUpperCase();

  if (normalized === "PAID" || normalized === "SENT") {
    return "border-emerald-100 bg-emerald-50 text-emerald-700";
  }

  if (
    normalized === "FAILED" ||
    normalized === "CANCELLED" ||
    normalized === "VOID"
  ) {
    return "border-red-100 bg-red-50 text-red-700";
  }

  if (normalized === "DRAFT") {
    return "border-slate-200 bg-slate-50 text-slate-600";
  }

  return "border-amber-100 bg-amber-50 text-amber-700";
};

const getRestaurantLabel = (restaurant: RestaurantOption) => {
  return (
    restaurant.name ||
    restaurant.restaurantName ||
    restaurant.billingEmail ||
    restaurant.email ||
    restaurant.id
  );
};

export function GeneratedInvoicesHistoryTab() {
  const [kind, setKind] = useState<GeneratedInvoiceFilter>(ALL_FILTER);
  const [status, setStatus] = useState<GeneratedStatusFilter>(ALL_FILTER);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [restaurant, setRestaurant] = useState<RestaurantOption | null>(null);

  const params = useMemo(() => {
    return {
      kind: kind === ALL_FILTER ? undefined : kind,
      status: status === ALL_FILTER ? undefined : status,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      restaurantId: restaurant?.id,
    };
  }, [fromDate, kind, restaurant?.id, status, toDate]);

  const generatedInvoicesQuery = useGetGeneratedInvoices(params);
  const response = generatedInvoicesQuery.data;
  const invoices = response?.data ?? [];
  const total = response?.meta?.total ?? invoices.length;
  const isLoading =
    generatedInvoicesQuery.isLoading || generatedInvoicesQuery.isFetching;

  const fetchRestaurants = useCallback(
    async ({
      search,
      page: requestedPage,
    }: {
      search: string;
      page: number;
    }) => {
      const result = await getRestaurants({
        page: requestedPage,
        limit: 20,
        search: search || undefined,
        includeInactive: true,
      });

      return result;
    },
    [],
  );

  const clearFilters = () => {
    setKind(ALL_FILTER);
    setStatus(ALL_FILTER);
    setFromDate("");
    setToDate("");
    setRestaurant(null);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[#EEF0F4] bg-[#FAFBFC] p-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Search className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-dark">
              Generated invoice history
            </h2>
            <p className="text-sm text-gray-500">
              Search generated order, payout, and subscription documents without
              adding another sidebar section.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark">
              Kind
            </label>
            <Select
              value={kind}
              onValueChange={(value) =>
                setKind(value as GeneratedInvoiceFilter)
              }
            >
              <SelectTrigger className="h-11 bg-white text-sm">
                <SelectValue placeholder="Kind" />
              </SelectTrigger>
              <SelectContent>
                {KIND_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark">
              Status
            </label>
            <Select
              value={status}
              onValueChange={(value) =>
                setStatus(value as GeneratedStatusFilter)
              }
            >
              <SelectTrigger className="h-11 bg-white text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark">
              From date
            </label>
            <Input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="h-11 bg-white text-sm"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark">
              To date
            </label>
            <Input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="h-11 bg-white text-sm"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark">
              Restaurant
            </label>
            <AsyncSelect
              value={restaurant}
              onChange={setRestaurant}
              fetchOptions={fetchRestaurants}
              placeholder="All restaurants"
              searchPlaceholder="Search restaurant..."
              getOptionLabel={getRestaurantLabel}
              className="h-11 bg-white text-sm"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button type="button" variant="outline" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#EEF0F4] bg-white">
        <Table>
          <TableHeader className="bg-[#F8FAFC]">
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Kind</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tenant / Restaurant / Branch</TableHead>
              <TableHead>Linked ID</TableHead>
              <TableHead>Period</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Document</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-48 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <Loader2 className="size-5 animate-spin" />
                    Loading generated invoices...
                  </div>
                </TableCell>
              </TableRow>
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-56 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-gray-500">
                    <div className="flex size-12 items-center justify-center rounded-full bg-[#F1F5F9] text-gray-500">
                      <FileText className="size-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-dark">
                        No generated invoices found
                      </p>
                      <p className="text-sm">
                        Try changing the kind, status, date range, or restaurant
                        filter.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => {
                const linkedId = getLinkedId(invoice);
                const lastSentAt =
                  invoice.lastSent?.at ||
                  invoice.lastSent?.sentAt ||
                  invoice.lastSentAt;
                const lastSentEmail =
                  invoice.lastSent?.email ||
                  invoice.lastSent?.to ||
                  invoice.lastSentEmail;
                const totalAmount = invoice.totalAmount ?? invoice.amount;
                const documentType =
                  invoice.documentType || invoice.mimeType || "PDF";

                return (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div className="font-semibold text-dark">
                        {invoice.invoiceNumber || invoice.id}
                      </div>
                      <div className="text-xs text-gray-500">
                        Generated{" "}
                        {formatDate(invoice.generatedAt || invoice.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>{prettyLabel(invoice.kind)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "border",
                          getStatusClassName(invoice.status),
                        )}
                      >
                        {prettyLabel(invoice.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[260px] space-y-1 text-sm">
                        <div>Tenant: {getSnapshotName(invoice, "tenant")}</div>
                        <div>
                          Restaurant: {getSnapshotName(invoice, "restaurant")}
                        </div>
                        <div>Branch: {getSnapshotName(invoice, "branch")}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {linkedId ? (
                        <div>
                          <div className="text-xs text-gray-500">
                            {linkedId.label}
                          </div>
                          <div className="max-w-[160px] truncate font-medium text-dark">
                            {linkedId.value}
                          </div>
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(getPeriodStart(invoice))} —{" "}
                        {formatDate(getPeriodEnd(invoice))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-dark">
                      {formatMoney(
                        numericValue(totalAmount),
                        invoice.currency || "EUR",
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div>
                          Sent{" "}
                          {numericValue(invoice.sentCount).toLocaleString()}x ·
                          Downloaded{" "}
                          {numericValue(
                            invoice.downloadCount ?? invoice.downloadsCount,
                          ).toLocaleString()}
                          x
                        </div>
                        <div className="text-xs text-gray-500">
                          Last sent: {formatDateTime(lastSentAt)}
                          {lastSentEmail ? ` to ${lastSentEmail}` : ""}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{prettyLabel(documentType)}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <div className="border-t border-[#EEF0F4] px-4 py-3">
          <p className="text-sm text-gray-500">
            Showing {total.toLocaleString()} invoice(s)
          </p>
        </div>
      </div>
    </div>
  );
}
