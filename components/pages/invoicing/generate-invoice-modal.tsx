"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  CalendarDays,
  CheckCircle2,
  MessageSquare,
  PlusCircle,
  ReceiptText,
  Search,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminInvoice } from "@/services/reports";
import type { BillingCycleOption } from "./header";

export type InvoiceGenerationPayload = {
  billingCycle: string;
  billingCycleLabel: string;
  invoiceDate: string;
  dueDate: string;
  invoices: AdminInvoice[];
  baseTotalAmount: number;
  additionalCharges: number;
  message: string;
  totalAmount: number;
};

type GenerateInvoiceModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoices: AdminInvoice[];
  billingCycle: string;
  billingCycleOptions: BillingCycleOption[];
  onBillingCycleChange: (value: string) => void;
  onPreview: (payload: InvoiceGenerationPayload) => void;
};

const formatInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getDefaultDueDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 14);

  return formatInputDate(date);
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

const formatSignedMoney = (value: number, currency = "EUR") => {
  const numeric = Number(value || 0);

  if (numeric > 0) {
    return `+${formatMoney(numeric, currency)}`;
  }

  if (numeric < 0) {
    return `-${formatMoney(Math.abs(numeric), currency)}`;
  }

  return formatMoney(0, currency);
};

const parseAdjustmentAmount = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed || trimmed === "-" || trimmed === "+") return 0;

  const numeric = Number(trimmed);

  return Number.isFinite(numeric) ? numeric : 0;
};

const calculateDeductions = (invoice: AdminInvoice) => {
  return (
    Number(invoice.discountAmount || 0) +
    Number(invoice.walletAppliedAmount || 0) +
    Number(invoice.loyaltyDiscountAmount || 0)
  );
};

const matchesSearch = (invoice: AdminInvoice, search: string) => {
  const keyword = search.trim().toLowerCase();

  if (!keyword) return true;

  const text = [
    invoice.invoiceNumber,
    invoice.orderId,
    invoice.restaurant?.name,
    invoice.branch?.name,
    invoice.customer?.name,
    invoice.customer?.email,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return text.includes(keyword);
};

export function GenerateInvoiceModal({
  open,
  onOpenChange,
  invoices,
  billingCycle,
  billingCycleOptions,
  onBillingCycleChange,
  onPreview,
}: GenerateInvoiceModalProps) {
  const invoicing = useTranslations("invoicing");
  const common = useTranslations("common");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [invoiceDate, setInvoiceDate] = useState(formatInputDate(new Date()));
  const [dueDate, setDueDate] = useState(getDefaultDueDate());
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [additionalChargesInput, setAdditionalChargesInput] = useState("");

  const selectedCycle = useMemo(() => {
    return (
      billingCycleOptions.find((option) => option.value === billingCycle) ||
      billingCycleOptions[0]
    );
  }, [billingCycle, billingCycleOptions]);

  const visibleInvoices = useMemo(() => {
    return invoices.filter((invoice) => matchesSearch(invoice, search));
  }, [invoices, search]);

  const selectedInvoices = useMemo(() => {
    const selectedSet = new Set(selectedIds);

    return invoices.filter((invoice) => selectedSet.has(invoice.orderId));
  }, [invoices, selectedIds]);

  const baseTotalAmount = useMemo(() => {
    return selectedInvoices.reduce(
      (sum, invoice) => sum + Number(invoice.totalAmount || 0),
      0
    );
  }, [selectedInvoices]);

  const additionalCharges = useMemo(() => {
    return parseAdjustmentAmount(additionalChargesInput);
  }, [additionalChargesInput]);

  const finalTotalAmount = useMemo(() => {
    return baseTotalAmount + additionalCharges;
  }, [baseTotalAmount, additionalCharges]);

  const allVisibleSelected = useMemo(() => {
    if (visibleInvoices.length === 0) return false;

    return visibleInvoices.every((invoice) =>
      selectedIds.includes(invoice.orderId)
    );
  }, [visibleInvoices, selectedIds]);

  const currency = getCurrency();

  useEffect(() => {
    if (!open) return;

    setSelectedIds([]);
    setInvoiceDate(formatInputDate(new Date()));
    setDueDate(getDefaultDueDate());
    setSearch("");
    setMessage("");
    setAdditionalChargesInput("");
  }, [open]);

  const toggleInvoice = (orderId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(orderId)) {
        return prev.filter((id) => id !== orderId);
      }

      return [...prev, orderId];
    });
  };

  const toggleSelectAllVisible = () => {
    const visibleIds = visibleInvoices.map((invoice) => invoice.orderId);

    setSelectedIds((prev) => {
      if (allVisibleSelected) {
        return prev.filter((id) => !visibleIds.includes(id));
      }

      return Array.from(new Set([...prev, ...visibleIds]));
    });
  };

  const handlePreview = () => {
    if (selectedInvoices.length === 0) return;

    onPreview({
      billingCycle,
      billingCycleLabel: selectedCycle?.label || billingCycle,
      invoiceDate,
      dueDate,
      invoices: selectedInvoices,
      baseTotalAmount,
      additionalCharges,
      message: message.trim(),
      totalAmount: finalTotalAmount,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent
        className="flex max-h-[92vh] w-[calc(100vw-24px)] max-w-[760px] flex-col overflow-hidden rounded-[24px] border-0 bg-[#F7F7F7] p-0 shadow-2xl sm:w-[calc(100vw-48px)]"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader className="shrink-0 border-b border-gray-200 px-5 py-5 sm:px-8">
          <DialogTitle className="text-[24px] font-semibold text-gray-950">
            {invoicing("generateInvoice")}
          </DialogTitle>
          <p className="text-sm text-gray-500">
            {invoicing("invoiceGeneratedDescription")}
          </p>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-8">
          <div className="rounded-[14px] bg-white p-4">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <CalendarDays size={16} className="text-primary" />
              {invoicing("billingInformation")}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700">
                  {invoicing("billingCycle")}
                </label>

                <Select
                  value={billingCycle}
                  onValueChange={onBillingCycleChange}
                >
                  <SelectTrigger className="h-[46px] w-full cursor-pointer rounded-[12px] border border-primary/50 bg-white px-3 text-sm font-medium text-gray-900 transition hover:border-primary hover:bg-primary/[0.02] focus:ring-2 focus:ring-primary/15">
                    <SelectValue placeholder={invoicing("selectBillingCycle")} />
                  </SelectTrigger>

                  <SelectContent>
                    {billingCycleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  {invoicing("invoiceDate")}
                </label>

                <Input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="h-[46px] w-full cursor-pointer rounded-[12px] border border-primary/50 bg-white px-3 text-sm font-medium text-gray-900 transition hover:border-primary hover:bg-primary/[0.02] focus-visible:ring-2 focus-visible:ring-primary/15 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  {invoicing("dueDate")}
                </label>

                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-[46px] w-full cursor-pointer rounded-[12px] border border-primary/50 bg-white px-3 text-sm font-medium text-gray-900 transition hover:border-primary hover:bg-primary/[0.02] focus-visible:ring-2 focus-visible:ring-primary/15 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[14px] bg-white p-4">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <MessageSquare size={16} className="text-primary" />
              {invoicing("messageAdditionalCharges")}
            </div>

            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_230px]">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  {invoicing("message")}
                </label>

                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={invoicing("messagePlaceholder")}
                  rows={4}
                  className="w-full resize-none rounded-[12px] border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  {invoicing("additionalCharges")}
                </label>

                <Input
                  type="number"
                  step="0.01"
                  value={additionalChargesInput}
                  onChange={(event) =>
                    setAdditionalChargesInput(event.target.value)
                  }
                  placeholder="0.00 or -25.00"
                  className="h-[46px] rounded-[12px] border border-gray-200 bg-white px-3 text-sm font-medium text-gray-900 transition hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/15"
                />

                <p className="text-[11px] leading-5 text-gray-400">
                  {invoicing("additionalChargesHelp")}
                </p>

                <div className="rounded-[12px] border border-gray-100 bg-[#FAFAFA] p-3">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{invoicing("adjustment")}</span>
                    <span
                      className={
                        additionalCharges < 0
                          ? "font-semibold text-primary"
                          : additionalCharges > 0
                          ? "font-semibold text-green"
                          : "font-semibold text-gray-500"
                      }
                    >
                      {formatSignedMoney(additionalCharges, currency)}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-2 text-sm">
                    <span className="font-semibold text-gray-900">
                      {invoicing("final")}
                    </span>
                    <span className="font-bold text-green">
                      {formatMoney(finalTotalAmount, currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[14px] bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <ReceiptText size={16} className="text-primary" />
                {invoicing("selectInvoices")}
              </div>

              <button
                type="button"
                onClick={toggleSelectAllVisible}
                className="rounded-full px-3 py-1 text-xs font-semibold text-gray-600 transition hover:bg-primary/10 hover:text-primary"
              >
                {allVisibleSelected
                  ? invoicing("clearVisible")
                  : invoicing("selectAll")}
              </button>
            </div>

            <div className="border-b border-gray-100 p-4">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={invoicing("searchInvoicePlaceholder")}
                  className="h-[42px] rounded-[12px] border-gray-200 pl-10"
                />
              </div>
            </div>

            <div className="max-h-[360px] overflow-y-auto p-2">
              {visibleInvoices.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-400">
                  {invoicing("noInvoicesAvailable")}
                </div>
              ) : (
                <div className="space-y-2">
                  {visibleInvoices.map((invoice) => {
                    const selected = selectedIds.includes(invoice.orderId);
                    const deduction = calculateDeductions(invoice);
                    const invoiceCurrency = getCurrency();

                    return (
                      <button
                        key={invoice.orderId}
                        type="button"
                        onClick={() => toggleInvoice(invoice.orderId)}
                        className={`group flex w-full cursor-pointer items-center justify-between gap-4 rounded-[14px] border px-4 py-4 text-left transition-all duration-200 hover:-translate-y-[1px] hover:shadow-sm ${
                          selected
                            ? "border-primary/30 bg-primary/5 ring-1 ring-primary/15"
                            : "border-gray-100 bg-white hover:border-primary/25 hover:bg-primary/[0.03] hover:ring-1 hover:ring-primary/10"
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                              selected
                                ? "bg-green-100 text-green"
                                : "bg-gray-100 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary"
                            }`}
                          >
                            {selected ? (
                              <CheckCircle2 size={20} />
                            ) : (
                              <ReceiptText size={18} />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">
                              {invoice.restaurant?.name || "-"}
                            </p>

                            <p className="mt-1 truncate text-xs text-gray-500">
                              {invoice.invoiceNumber} • {invoice.branch?.name} •{" "}
                              {invoice.customer?.name ||
                                invoice.customer?.email ||
                                "-"}
                            </p>

                            <p className="mt-1 text-[11px] font-medium text-gray-400 opacity-0 transition group-hover:opacity-100">
                              {invoicing("clickToSelect", {
                                action: selected
                                  ? invoicing("unselect")
                                  : invoicing("select"),
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-xs text-gray-400">
                            {invoicing("totalAmountLabel")}
                          </p>

                          <p className="text-base font-bold text-gray-900">
                            {formatMoney(invoice.totalAmount, invoiceCurrency)}
                          </p>

                          <p className="text-xs text-primary">
                            -{formatMoney(deduction, invoiceCurrency)}{" "}
                            {invoicing("deduction")}
                          </p>

                          <p className="text-xs font-semibold text-green">
                            {invoicing("net")}{" "}
                            {formatMoney(invoice.totalAmount, invoiceCurrency)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-[10px] border border-green-200 bg-green-50 px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-green-700">
                {invoicing("invoicesSelected", {
                  count: selectedInvoices.length,
                })}
              </p>

              <p className="text-sm font-bold text-green-700">
                {invoicing("finalTotal")}:{" "}
                {formatMoney(finalTotalAmount, currency)}
              </p>
            </div>

            <div className="mt-2 grid gap-2 text-xs text-green-700 sm:grid-cols-3">
              <span>
                {invoicing("base")}: {formatMoney(baseTotalAmount, currency)}
              </span>
              <span>
                {invoicing("adjustment")}:{" "}
                {formatSignedMoney(additionalCharges, currency)}
              </span>
              <span className="font-semibold">
                {invoicing("total")}: {formatMoney(finalTotalAmount, currency)}
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0 bg-white px-5 py-4 sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-[44px] rounded-[12px]"
            >
              {common("cancel")}
            </Button>

            <div className="flex items-center justify-end gap-4">
              <div className="hidden text-right sm:block">
                <p className="text-xs text-gray-400">
                  {invoicing("finalTotal")}
                </p>
                <p className="font-bold text-green">
                  {formatMoney(finalTotalAmount, currency)}
                </p>
              </div>

              <Button
                type="button"
                variant="primary"
                disabled={selectedInvoices.length === 0}
                onClick={handlePreview}
                className="h-[48px] rounded-[14px] px-7 disabled:opacity-50"
              >
                <PlusCircle size={17} className="mr-2" />
                {invoicing("previewInvoice")}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
