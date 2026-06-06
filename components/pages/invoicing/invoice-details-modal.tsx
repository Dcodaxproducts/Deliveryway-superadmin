"use client";

import { Loader2, ReceiptText } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetAdminReportInvoiceDetails } from "@/hooks/useReports";
import type { AdminInvoice } from "@/services/reports";

type InvoiceDetailsModalProps = {
  open: boolean;
  invoice: AdminInvoice | null;
  onOpenChange: (open: boolean) => void;
};

const getCurrency = () => {
  return "EUR";
};

const formatMoney = (value: number, currency = "EUR") => {
  const numeric = Number(value || 0);

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numeric);
  } catch {
    return `${currency} ${numeric.toFixed(2)}`;
  }
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const prettyLabel = (value?: string) => {
  if (!value) return "-";

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export function InvoiceDetailsModal({
  open,
  invoice,
  onOpenChange,
}: InvoiceDetailsModalProps) {
  const invoicing = useTranslations("invoicing");
  const { data, isLoading, isFetching } = useGetAdminReportInvoiceDetails(
    open && invoice
      ? {
          orderId: invoice.orderId,
          restaurantId: invoice.restaurant?.id,
          branchId: invoice.branch?.id,
        }
      : undefined
  );

  const details = data?.data || invoice;
  const currency = getCurrency();
  const loading = isLoading || isFetching;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent
        className="flex max-h-[92vh] w-[calc(100vw-24px)] max-w-[900px] flex-col overflow-hidden rounded-[24px] border-0 bg-[#F7F7F7] p-0 shadow-2xl sm:w-[calc(100vw-48px)]"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader className="shrink-0 border-b border-gray-200 px-6 py-6 sm:px-8">
          <DialogTitle className="text-[26px] font-semibold text-gray-950">
            {invoicing("invoiceDetails")}
          </DialogTitle>
          <p className="text-sm text-gray-500">
            {details?.invoiceNumber || invoicing("loadingInvoice")}
          </p>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          {loading ? (
            <div className="flex min-h-[360px] items-center justify-center gap-2 text-gray-400">
              <Loader2 size={18} className="animate-spin" />
              {invoicing("loadingInvoiceDetails")}
            </div>
          ) : !details ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
              <ReceiptText size={34} className="mb-3 text-gray-300" />
              <p className="text-sm text-gray-400">
                {invoicing("invoiceNotFound")}
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-3">
                <SummaryCard label={invoicing("restaurant")} value={details.restaurant?.name} />
                <SummaryCard label={invoicing("branch")} value={details.branch?.name} />
                <SummaryCard
                  label={invoicing("customer")}
                  value={details.customer?.name || details.customer?.email}
                />
                <SummaryCard
                  label={invoicing("orderType")}
                  value={prettyLabel(details.orderType)}
                />
                <SummaryCard
                  label={invoicing("orderStatus")}
                  value={prettyLabel(details.orderStatus)}
                />
                <SummaryCard
                  label={invoicing("paymentStatus")}
                  value={prettyLabel(details.paymentStatus)}
                />
              </div>

              <div className="rounded-[14px] bg-white p-5">
                <h3 className="mb-4 text-base font-semibold text-gray-900">
                  {invoicing("amountSummary")}
                </h3>

                <div className="grid gap-3 md:grid-cols-2">
                  <AmountRow
                    label={invoicing("subtotal")}
                    value={formatMoney(details.subtotal, currency)}
                  />
                  <AmountRow
                    label={invoicing("tax")}
                    value={formatMoney(details.taxAmount, currency)}
                  />
                  <AmountRow
                    label={invoicing("deliveryFee")}
                    value={formatMoney(details.deliveryFee, currency)}
                  />
                  <AmountRow
                    label={invoicing("discount")}
                    value={`-${formatMoney(details.discountAmount, currency)}`}
                  />
                  <AmountRow
                    label={invoicing("walletApplied")}
                    value={`-${formatMoney(
                      details.walletAppliedAmount,
                      currency
                    )}`}
                  />
                  <AmountRow
                    label={invoicing("loyaltyDiscount")}
                    value={`-${formatMoney(
                      details.loyaltyDiscountAmount,
                      currency
                    )}`}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                  <span className="text-base font-semibold text-gray-900">
                    {invoicing("totalAmount")}
                  </span>
                  <span className="text-xl font-bold text-green">
                    {formatMoney(details.totalAmount, currency)}
                  </span>
                </div>
              </div>

              <div className="rounded-[14px] bg-white p-5">
                <h3 className="mb-4 text-base font-semibold text-gray-900">
                  {invoicing("dates")}
                </h3>

                <div className="grid gap-3 md:grid-cols-3">
                  <SummaryCard
                    label={invoicing("issuedAt")}
                    value={formatDateTime(details.issuedAt)}
                  />
                  <SummaryCard
                    label={invoicing("orderTime")}
                    value={formatDateTime(details.orderTime)}
                  />
                  <SummaryCard
                    label={invoicing("paidAt")}
                    value={formatDateTime(details.paidAt)}
                  />
                </div>
              </div>

              <div className="rounded-[14px] bg-white p-5">
                <h3 className="mb-4 text-base font-semibold text-gray-900">
                  {invoicing("items")}
                </h3>

                {!details.items?.length ? (
                  <div className="py-8 text-center text-sm text-gray-400">
                    {invoicing("noItemDetails")}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-sm">
                      <thead>
                        <tr className="border-b text-left text-xs text-gray-400">
                          <th className="py-3">{invoicing("item")}</th>
                          <th>{invoicing("variation")}</th>
                          <th className="text-center">{invoicing("qty")}</th>
                          <th className="text-right">{invoicing("unit")}</th>
                          <th className="text-right">{invoicing("lineTotal")}</th>
                        </tr>
                      </thead>

                      <tbody>
                        {details.items.map((item) => (
                          <tr key={item.id} className="border-b last:border-b-0">
                            <td className="py-3">
                              <p className="font-medium text-gray-900">
                                {item.menuItemName}
                              </p>
                              {item.note ? (
                                <p className="mt-1 text-xs text-gray-400">
                                  {invoicing("note")}: {item.note}
                                </p>
                              ) : null}
                            </td>
                            <td>{item.variationName || "-"}</td>
                            <td className="text-center">{item.quantity}</td>
                            <td className="text-right">
                              {formatMoney(item.unitPrice, currency)}
                            </td>
                            <td className="text-right font-semibold">
                              {formatMoney(item.lineTotal, currency)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="rounded-[14px] bg-white p-5">
                <h3 className="mb-4 text-base font-semibold text-gray-900">
                  {invoicing("transactions")}
                </h3>

                {!details.transactions?.length ? (
                  <div className="py-8 text-center text-sm text-gray-400">
                    {invoicing("noTransactions")}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {details.transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="rounded-[12px] border border-gray-100 bg-[#FAFAFA] p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {transaction.type} • {transaction.paymentMethod}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              {formatDateTime(transaction.createdAt)}
                            </p>
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="font-bold text-green">
                              {formatMoney(
                                transaction.amount,
                                transaction.currency
                              )}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              {prettyLabel(transaction.status)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-[14px] bg-white p-4">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-2 truncate text-sm font-semibold text-gray-900">
        {value || "-"}
      </p>
    </div>
  );
}

function AmountRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[10px] bg-[#FAFAFA] px-4 py-3">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}
