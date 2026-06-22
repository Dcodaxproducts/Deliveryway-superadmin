"use client";

import { useState } from "react";
import {
  Download,
  Eye,
  Loader2,
  Mail,
  ReceiptText,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { AdminInvoice } from "@/services/reports";
import { useSendAdminInvoiceEmail } from "@/hooks/useReports";
import { useGlobalCurrency } from "@/hooks/useGlobalCurrency";
import { formatMoney } from "@/lib/currency";

type InvoicingTableProps = {
  invoices: AdminInvoice[];
  isLoading?: boolean;
  isFetching?: boolean;
  onViewInvoice?: (invoice: AdminInvoice) => void;
  onDownloadInvoice?: (invoice: AdminInvoice) => void;
  onSendInvoice?: (invoice: AdminInvoice) => void;
  selectedInvoiceIds?: string[];
  onToggleInvoice?: (orderId: string) => void;
  onToggleAllVisible?: () => void;
  onGenerateInvoice?: (invoice: AdminInvoice) => void;
};

const getInitials = (name?: string) => {
  if (!name) return "IN";

  const parts = name.trim().split(" ").filter(Boolean);

  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const prettyLabel = (value?: string) => {
  if (!value) return "-";

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getPaymentStatusClass = (status?: string) => {
  switch (status) {
    case "PAID":
      return "bg-green-50 text-green";
    case "PENDING":
      return "bg-yellow-50 text-yellow-700";
    case "FAILED":
    case "CANCELLED":
      return "bg-red-50 text-primary";
    case "REFUNDED":
      return "bg-blue-50 text-blue-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const getOrderStatusClass = (status?: string) => {
  switch (status) {
    case "DELIVERED":
    case "SERVED":
      return "text-green";
    case "CANCELLED":
    case "REJECTED":
      return "text-primary";
    case "PLACED":
    case "CONFIRMED":
    case "PREPARING":
      return "text-blue-600";
    default:
      return "text-gray-600";
  }
};

const SkeletonRow = ({ selectable }: { selectable: boolean }) => (
  <TableRow className="border-none h-[70px]">
    <TableCell colSpan={selectable ? 9 : 8}>
      <div className="flex animate-pulse items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-gray-200" />
        <div className="h-4 w-[180px] rounded bg-gray-200" />
        <div className="h-4 w-[120px] rounded bg-gray-100" />
        <div className="h-4 w-[90px] rounded bg-gray-100" />
      </div>
    </TableCell>
  </TableRow>
);

export function InvoicingTable({
  invoices,
  isLoading,
  isFetching,
  onViewInvoice,
  onDownloadInvoice,
  onSendInvoice,
  selectedInvoiceIds = [],
  onToggleInvoice,
  onToggleAllVisible,
  onGenerateInvoice,
}: InvoicingTableProps) {
  const invoicing = useTranslations("invoicing");
  const common = useTranslations("common");
  const globalCurrency = useGlobalCurrency();
  const loading = isLoading || (isFetching && invoices.length === 0);

  const [sendingOrderId, setSendingOrderId] = useState<string | null>(null);
  const selectable = Boolean(onToggleInvoice);
  const selectedSet = new Set(selectedInvoiceIds);
  const allVisibleSelected =
    selectable &&
    invoices.length > 0 &&
    invoices.every((invoice) => selectedSet.has(invoice.orderId));
  const someVisibleSelected =
    selectable && invoices.some((invoice) => selectedSet.has(invoice.orderId));

  const { mutate: sendInvoiceEmail, isPending: isSendingInvoiceEmail } =
    useSendAdminInvoiceEmail();

  const handleSendInvoiceEmail = (invoice: AdminInvoice) => {
    if (!invoice.orderId || isSendingInvoiceEmail) return;

    setSendingOrderId(invoice.orderId);

    sendInvoiceEmail(
      {
        orderId: invoice.orderId,
        restaurantId: invoice.restaurant?.id,
        branchId: invoice.branch?.id,
      },
      {
        onSuccess: () => {
          onSendInvoice?.(invoice);
        },
        onSettled: () => {
          setSendingOrderId(null);
        },
      }
    );
  };

  return (
    <div className="rounded-[14px] bg-white">
      <Table className="min-w-[1020px] table-fixed">
        <TableHeader>
          <TableRow className="border-none">
            {selectable ? (
              <TableHead className="w-[48px] pl-4 pr-1">
                <Checkbox
                  checked={
                    allVisibleSelected
                      ? true
                      : someVisibleSelected
                      ? "indeterminate"
                      : false
                  }
                  onCheckedChange={onToggleAllVisible}
                  aria-label={invoicing("selectAll")}
                />
              </TableHead>
            ) : null}
            <TableHead className="w-[218px] font-normal">
              {invoicing("invoiceRestaurant")}
            </TableHead>
            <TableHead className="w-[156px]">
              {invoicing("customer")}
            </TableHead>
            <TableHead className="w-[100px]">{invoicing("orderType")}</TableHead>
            <TableHead className="w-[140px]">{invoicing("orderStatus")}</TableHead>
            <TableHead className="w-[116px]">{invoicing("payment")}</TableHead>
            <TableHead className="w-[92px] text-right">{invoicing("total")}</TableHead>
            <TableHead className="w-[100px]">{invoicing("issued")}</TableHead>
            <TableHead className="w-[150px] text-center">{common("actions")}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <SkeletonRow key={index} selectable={selectable} />
            ))
          ) : invoices.length === 0 ? (
            <TableRow className="border-none">
              <TableCell colSpan={selectable ? 9 : 8}>
                <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ReceiptText size={26} />
                  </div>

                  <h3 className="text-base font-semibold text-gray-900">
                    {invoicing("noInvoicesFound")}
                  </h3>

                  <p className="mt-1 max-w-[420px] text-sm text-gray-500">
                    {invoicing("noInvoicesDescription")}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((invoice) => {
              const currency = globalCurrency;
              const restaurantName = invoice.restaurant?.name || "-";
              const branchName = invoice.branch?.name || "-";
              const customerName =
                invoice.customer?.name ||
                `${invoice.customer?.firstName || ""} ${
                  invoice.customer?.lastName || ""
                }`.trim() ||
                "-";

              const isPaid = invoice.paymentStatus === "PAID";
              const isSelected = selectedSet.has(invoice.orderId);
              const isCurrentInvoiceSending =
                sendingOrderId === invoice.orderId && isSendingInvoiceEmail;

              return (
                <TableRow
                  key={invoice.orderId}
                  className="h-[74px] border-none hover:bg-gray-50"
                >
                  {selectable ? (
                    <TableCell className="pl-4 pr-1">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleInvoice?.(invoice.orderId)}
                        aria-label={invoicing("selectInvoice")}
                      />
                    </TableCell>
                  ) : null}

                  <TableCell className="pr-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {getInitials(restaurantName)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-gray-900">
                          {restaurantName}
                        </p>
                        <p className="mt-1 truncate text-xs text-gray-400">
                          {invoice.invoiceNumber} • {branchName}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="pr-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-800">
                        {customerName}
                      </p>
                      <p className="mt-1 truncate text-xs text-gray-400">
                        {invoice.customer?.email || "-"}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="block truncate">
                      {prettyLabel(invoice.orderType)}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span
                      className={cn(
                        "block truncate text-sm font-medium",
                        getOrderStatusClass(invoice.orderStatus)
                      )}
                    >
                      {prettyLabel(invoice.orderStatus)}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex max-w-full rounded-full px-2 py-1 text-xs font-medium",
                        getPaymentStatusClass(invoice.paymentStatus)
                      )}
                    >
                      <span className="truncate">
                        {prettyLabel(invoice.paymentStatus)}
                      </span>
                    </span>
                  </TableCell>

                  <TableCell className="text-right font-semibold text-green">
                    {formatMoney(invoice.totalAmount, currency)}
                  </TableCell>

                  <TableCell>{formatDate(invoice.issuedAt)}</TableCell>

                  <TableCell className="pr-4">
                    <div className="flex items-center justify-center gap-1 text-gray">
                      <button
                        type="button"
                        className="rounded-full p-2 transition hover:bg-gray-100 hover:text-primary"
                        onClick={() => onViewInvoice?.(invoice)}
                        title={invoicing("viewInvoice")}
                      >
                        <Eye size={18} />
                      </button>

                      {isPaid ? (
                        <button
                          type="button"
                          className="rounded-full p-2 transition hover:bg-gray-100 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                          onClick={() => onDownloadInvoice?.(invoice)}
                          disabled={!onDownloadInvoice}
                          title={invoicing("downloadInvoice")}
                        >
                          <Download size={18} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="rounded-full p-2 transition hover:bg-gray-100 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                          onClick={() => handleSendInvoiceEmail(invoice)}
                          disabled={isSendingInvoiceEmail}
                          title={invoicing("sendInvoiceToCustomerEmail")}
                        >
                          {isCurrentInvoiceSending ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Mail size={18} />
                          )}
                        </button>
                      )}

                      {onGenerateInvoice ? (
                        <button
                          type="button"
                          className="rounded-full p-2 transition hover:bg-gray-100 hover:text-primary"
                          onClick={() => onGenerateInvoice(invoice)}
                          title={invoicing("previewInvoice")}
                        >
                          <ReceiptText size={18} />
                        </button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}

          {isFetching && invoices.length > 0 ? (
            <TableRow className="border-none">
              <TableCell colSpan={selectable ? 9 : 8}>
                <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-400">
                  <Loader2 size={16} className="animate-spin" />
                  {invoicing("refreshingInvoices")}
                </div>
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
