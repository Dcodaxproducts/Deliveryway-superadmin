"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  CalendarDays,
  CreditCard,
  MessageSquare,
  ReceiptText,
} from "lucide-react";

import Container from "../../../components/container";
import Filters from "@/components/filter";
import {
  BillingCycleOption,
  InvoicingHeader,
} from "@/components/pages/invoicing/header";
import { InvoicingTable } from "@/components/tables/invoicing-table";
import type { InvoiceGenerationPayload } from "@/components/pages/invoicing/generate-invoice-modal";
import { InvoicePreviewModal } from "@/components/pages/invoicing/invoice-preview-modal";
import { InvoiceSuccessModal } from "@/components/pages/invoicing/invoice-success-modal";
import { InvoiceDetailsModal } from "@/components/pages/invoicing/invoice-details-modal";
import { WeeklyPayoutInvoicePanel } from "@/components/pages/invoicing/weekly-payout-invoice-panel";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SubscriptionsFilters } from "@/components/pages/pricing-models/subscriptions/SubscriptionsFilters";
import { SubscriptionsTable } from "@/components/pages/pricing-models/subscriptions/SubscriptionsTable";
import { SubscriptionInvoiceModal } from "@/components/pages/pricing-models/subscriptions/SubscriptionInvoiceModal";

import {
  useDownloadPackageSubscriptionInvoicePdf,
  useGetPackageSubscriptions,
  useSendPackageSubscriptionInvoiceEmail,
} from "@/hooks/usePackagePlans";
import { useGetAdminReportInvoices } from "@/hooks/useReports";
import type { AdminInvoice, AdminInvoicesParams } from "@/services/reports";
import type { PackageSubscription } from "@/services/packagePlans";
import { useGlobalCurrency } from "@/hooks/useGlobalCurrency";
import { formatMoney, formatSignedMoney } from "@/lib/currency";

type InvoiceWorkspaceTab = "orders" | "subscriptions";
type InvoiceTab = "active" | "archive";
type SubscriptionStatusFilter =
  | "ALL"
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELLED"
  | "EXPIRED";

type InvoiceFilters = {
  search: string;
  status: string;
  orderType: string;
  paymentStatus: string;
  kind: string;
  fromDate: string;
  toDate: string;
};

const formatInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getCurrentBillingCycleValue = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");

  return `${year}-${month}`;
};

const getBillingCycleRange = (value: string) => {
  const [yearValue, monthValue] = value.split("-");
  const year = Number(yearValue);
  const monthIndex = Number(monthValue) - 1;

  if (Number.isNaN(year) || Number.isNaN(monthIndex)) {
    const now = new Date();
    return {
      fromDate: formatInputDate(new Date(now.getFullYear(), now.getMonth(), 1)),
      toDate: formatInputDate(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    };
  }

  return {
    fromDate: formatInputDate(new Date(year, monthIndex, 1)),
    toDate: formatInputDate(new Date(year, monthIndex + 1, 0)),
  };
};

const getDefaultDueDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 14);

  return formatInputDate(date);
};

const parseAdjustmentAmount = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed || trimmed === "-" || trimmed === "+") return 0;

  const numeric = Number(trimmed);

  return Number.isFinite(numeric) ? numeric : 0;
};

const createBillingCycleOptions = (): BillingCycleOption[] => {
  const now = new Date();

  return Array.from({ length: 18 }).map((_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const value = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(
      2,
      "0"
    )}`;

    const range = getBillingCycleRange(value);

    return {
      value,
      label: date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      fromDate: range.fromDate,
      toDate: range.toDate,
    };
  });
};

const useDebouncedValue = <T,>(value: T, delay = 400) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      window.clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

const isArchivedInvoice = (invoice: AdminInvoice) => {
  const paymentStatus = invoice.paymentStatus;
  const orderStatus = invoice.orderStatus;

  return (
    ["PAID", "REFUNDED", "CANCELLED"].includes(paymentStatus) ||
    ["DELIVERED", "SERVED", "CANCELLED", "REJECTED"].includes(orderStatus)
  );
};

const matchesSearch = (invoice: AdminInvoice, search: string) => {
  const keyword = search.trim().toLowerCase();

  if (!keyword) return true;

  const searchableText = [
    invoice.invoiceNumber,
    invoice.orderId,
    invoice.restaurant?.name,
    invoice.restaurant?.slug,
    invoice.branch?.name,
    invoice.customer?.name,
    invoice.customer?.email,
    invoice.customer?.phone,
    invoice.orderType,
    invoice.orderStatus,
    invoice.paymentStatus,
    invoice.paymentMethod,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchableText.includes(keyword);
};

export default function InvoicingPage() {
  const invoicing = useTranslations("invoicing");
  const billingCycleOptions = useMemo(() => createBillingCycleOptions(), []);
  const defaultBillingCycle = getCurrentBillingCycleValue();
  const defaultRange = getBillingCycleRange(defaultBillingCycle);

  const [workspaceTab, setWorkspaceTab] =
    useState<InvoiceWorkspaceTab>("orders");
  const [activeTab, setActiveTab] = useState<InvoiceTab>("active");
  const [billingCycle, setBillingCycle] = useState(defaultBillingCycle);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [invoiceDate, setInvoiceDate] = useState(formatInputDate(new Date()));
  const [dueDate, setDueDate] = useState(getDefaultDueDate());
  const [message, setMessage] = useState("");
  const [additionalChargesInput, setAdditionalChargesInput] = useState("");
  const [subscriptionPage, setSubscriptionPage] = useState(1);
  const [subscriptionSearch, setSubscriptionSearch] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatusFilter>("ALL");
  const [subscriptionInvoiceData, setSubscriptionInvoiceData] =
    useState<PackageSubscription | null>(null);
  const [downloadingSubscriptionInvoiceId, setDownloadingSubscriptionInvoiceId] =
    useState<string | null>(null);
  const [sendingSubscriptionInvoiceId, setSendingSubscriptionInvoiceId] =
    useState<string | null>(null);

  const [filters, setFilters] = useState<InvoiceFilters>({
    search: "",
    status: "",
    orderType: "",
    paymentStatus: "",
    kind: "",
    fromDate: defaultRange.fromDate,
    toDate: defaultRange.toDate,
  });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [previewPayload, setPreviewPayload] =
    useState<InvoiceGenerationPayload | null>(null);
  const [successPayload, setSuccessPayload] =
    useState<InvoiceGenerationPayload | null>(null);

  const [selectedInvoice, setSelectedInvoice] = useState<AdminInvoice | null>(
    null
  );

  const apiParams = useMemo<AdminInvoicesParams>(
    () => ({
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
      status: filters.status || undefined,
      orderType: filters.orderType || undefined,
      paymentStatus: filters.paymentStatus || undefined,
      kind: filters.kind || undefined,
    }),
    [
      filters.fromDate,
      filters.toDate,
      filters.status,
      filters.orderType,
      filters.paymentStatus,
      filters.kind,
    ]
  );

  const {
    data: invoicesResponse,
    isLoading,
    isFetching,
  } = useGetAdminReportInvoices(apiParams);

  const invoices = useMemo(() => {
    return invoicesResponse?.data || [];
  }, [invoicesResponse]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const archive = isArchivedInvoice(invoice);
      const tabMatch = activeTab === "archive" ? archive : !archive;

      return tabMatch && matchesSearch(invoice, filters.search);
    });
  }, [invoices, activeTab, filters.search]);

  const selectedInvoices = useMemo(() => {
    const selectedSet = new Set(selectedInvoiceIds);

    return invoices.filter((invoice) => selectedSet.has(invoice.orderId));
  }, [invoices, selectedInvoiceIds]);

  const baseTotalAmount = useMemo(() => {
    return selectedInvoices.reduce(
      (sum, invoice) => sum + Number(invoice.totalAmount || 0),
      0
    );
  }, [selectedInvoices]);

  const additionalCharges = useMemo(() => {
    return parseAdjustmentAmount(additionalChargesInput);
  }, [additionalChargesInput]);

  const finalTotalAmount = baseTotalAmount + additionalCharges;

  const activeCount = useMemo(() => {
    return invoices.filter((invoice) => !isArchivedInvoice(invoice)).length;
  }, [invoices]);

  const archiveCount = useMemo(() => {
    return invoices.filter(isArchivedInvoice).length;
  }, [invoices]);

  const selectedBillingCycleOption = useMemo(() => {
    return (
      billingCycleOptions.find((option) => option.value === billingCycle) ||
      billingCycleOptions[0]
    );
  }, [billingCycle, billingCycleOptions]);

  const debouncedSubscriptionSearch = useDebouncedValue(
    subscriptionSearch.trim()
  );

  const subscriptionParams = useMemo(() => {
    return {
      page: subscriptionPage,
      limit: 10,
      search: debouncedSubscriptionSearch || undefined,
      sortBy: "createdAt",
      sortOrder: "DESC" as const,
      status: subscriptionStatus === "ALL" ? undefined : subscriptionStatus,
      includeInactive: subscriptionStatus !== "ACTIVE",
      withDeleted: false,
    };
  }, [debouncedSubscriptionSearch, subscriptionPage, subscriptionStatus]);

  const subscriptionsQuery = useGetPackageSubscriptions(subscriptionParams);
  const downloadSubscriptionInvoiceMutation =
    useDownloadPackageSubscriptionInvoicePdf();
  const sendSubscriptionInvoiceEmailMutation =
    useSendPackageSubscriptionInvoiceEmail();
  const subscriptionsResponse = subscriptionsQuery.data as
    | {
        data?: PackageSubscription[];
        meta?: {
          page?: number;
          limit?: number;
          total?: number;
          totalPages?: number;
        };
      }
    | undefined;
  const subscriptions = subscriptionsResponse?.data ?? [];
  const subscriptionsMeta = subscriptionsResponse?.meta;
  const isSubscriptionSearchDebouncing =
    subscriptionSearch.trim() !== debouncedSubscriptionSearch;
  const isSubscriptionsLoading =
    subscriptionsQuery.isLoading ||
    subscriptionsQuery.isFetching ||
    isSubscriptionSearchDebouncing;

  const updateFilter = (key: keyof InvoiceFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const buildPayload = (invoiceList: AdminInvoice[]): InvoiceGenerationPayload => {
    const payloadBaseTotal = invoiceList.reduce(
      (sum, invoice) => sum + Number(invoice.totalAmount || 0),
      0
    );
    const payloadTotal = payloadBaseTotal + additionalCharges;

    return {
      billingCycle,
      billingCycleLabel: selectedBillingCycleOption?.label || billingCycle,
      invoiceDate,
      dueDate,
      invoices: invoiceList,
      baseTotalAmount: payloadBaseTotal,
      additionalCharges,
      message: message.trim(),
      totalAmount: payloadTotal,
    };
  };

  const previewInvoices = (invoiceList: AdminInvoice[]) => {
    if (invoiceList.length === 0) return;

    setPreviewPayload(buildPayload(invoiceList));
    setPreviewOpen(true);
  };

  const toggleInvoice = (orderId: string) => {
    setSelectedInvoiceIds((prev) => {
      if (prev.includes(orderId)) {
        return prev.filter((id) => id !== orderId);
      }

      return [...prev, orderId];
    });
  };

  const toggleAllVisibleInvoices = () => {
    const visibleIds = filteredInvoices.map((invoice) => invoice.orderId);
    const allVisibleSelected = visibleIds.every((id) =>
      selectedInvoiceIds.includes(id)
    );

    setSelectedInvoiceIds((prev) => {
      if (allVisibleSelected) {
        return prev.filter((id) => !visibleIds.includes(id));
      }

      return Array.from(new Set([...prev, ...visibleIds]));
    });
  };

  const handleBillingCycleChange = (value: string) => {
    const selectedCycle = billingCycleOptions.find(
      (option) => option.value === value
    );

    setBillingCycle(value);

    if (selectedCycle) {
      setFilters((prev) => ({
        ...prev,
        fromDate: selectedCycle.fromDate,
        toDate: selectedCycle.toDate,
      }));
    }
  };

  const handleResetFilters = () => {
    const range = getBillingCycleRange(billingCycle);

    setFilters({
      search: "",
      status: "",
      orderType: "",
      paymentStatus: "",
      kind: "",
      fromDate: range.fromDate,
      toDate: range.toDate,
    });
    setSelectedInvoiceIds([]);
  };

  const handleGenerateAndSend = () => {
    if (!previewPayload) return;

    setSuccessPayload(previewPayload);
    setPreviewOpen(false);
    setSuccessOpen(true);
  };

  const handleSubscriptionStatusChange = (value: SubscriptionStatusFilter) => {
    setSubscriptionStatus(value);
    setSubscriptionPage(1);
  };

  const handleSubscriptionSearchChange = (value: string) => {
    setSubscriptionSearch(value);
    setSubscriptionPage(1);
  };

  const handleDownloadSubscriptionInvoice = (subscriptionId: string) => {
    setDownloadingSubscriptionInvoiceId(subscriptionId);

    downloadSubscriptionInvoiceMutation.mutate(subscriptionId, {
      onSettled: () => {
        setDownloadingSubscriptionInvoiceId(null);
      },
    });
  };

  const handleSendSubscriptionInvoiceEmail = (
    subscriptionId: string,
    email?: string
  ) => {
    setSendingSubscriptionInvoiceId(subscriptionId);

    sendSubscriptionInvoiceEmailMutation.mutate(
      {
        id: subscriptionId,
        payload: email ? { email } : undefined,
      },
      {
        onSettled: () => {
          setSendingSubscriptionInvoiceId(null);
        },
      }
    );
  };

  return (
    <Container>
      <InvoicingHeader
        title={invoicing("dashboardTitle")}
        description={invoicing("dashboardDescription")}
        billingCycle={billingCycle}
        billingCycleOptions={billingCycleOptions}
        onBillingCycleChange={handleBillingCycleChange}
      />

      <div className="space-y-[32px] rounded-[14px] bg-white shadow-sm lg:p-[30px]">
        <div className="flex flex-col gap-3 px-4 pt-4 sm:flex-row lg:px-0 lg:pt-0">
          <InvoiceWorkspaceButton
            active={workspaceTab === "orders"}
            title={invoicing("orderInvoices")}
            description={invoicing("orderInvoicesDescription")}
            count={invoices.length}
            onClick={() => setWorkspaceTab("orders")}
          />
          <InvoiceWorkspaceButton
            active={workspaceTab === "subscriptions"}
            title={invoicing("businessOwnerSubscriptions")}
            description={invoicing("businessOwnerSubscriptionsDescription")}
            count={subscriptionsMeta?.total ?? subscriptions.length}
            onClick={() => setWorkspaceTab("subscriptions")}
          />
        </div>

        {workspaceTab === "orders" ? (
          <>
            <Filters
              type="invoices"
              search={filters.search}
              onSearchChange={(value) => updateFilter("search", value)}
              status={filters.status}
              onStatusChange={(value) => updateFilter("status", value)}
              orderType={filters.orderType}
              onOrderTypeChange={(value) => updateFilter("orderType", value)}
              paymentStatus={filters.paymentStatus}
              onPaymentStatusChange={(value) =>
                updateFilter("paymentStatus", value)
              }
              kind={filters.kind}
              onKindChange={(value) => updateFilter("kind", value)}
              fromDate={filters.fromDate}
              onFromDateChange={(value) => updateFilter("fromDate", value)}
              toDate={filters.toDate}
              onToDateChange={(value) => updateFilter("toDate", value)}
              onReset={handleResetFilters}
            />

            <InvoiceGenerationPanel
              billingCycle={billingCycle}
              billingCycleOptions={billingCycleOptions}
              invoiceDate={invoiceDate}
              dueDate={dueDate}
              message={message}
              additionalChargesInput={additionalChargesInput}
              selectedCount={selectedInvoices.length}
              baseTotalAmount={baseTotalAmount}
              additionalCharges={additionalCharges}
              finalTotalAmount={finalTotalAmount}
              onBillingCycleChange={handleBillingCycleChange}
              onInvoiceDateChange={setInvoiceDate}
              onDueDateChange={setDueDate}
              onMessageChange={setMessage}
              onAdditionalChargesChange={setAdditionalChargesInput}
              onPreview={() => previewInvoices(selectedInvoices)}
            />

            <div className="flex flex-col gap-3 px-4 lg:flex-row lg:items-center lg:gap-8 lg:pl-6">
              <button
                type="button"
                onClick={() => setActiveTab("active")}
                className={`h-[44px] rounded-[14px] px-5 text-base font-semibold transition ${
                  activeTab === "active"
                    ? "bg-primary text-white"
                    : "bg-transparent text-gray hover:bg-gray-50"
                }`}
              >
                {invoicing("activeInvoices")} ({activeCount})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("archive")}
                className={`h-[44px] rounded-[14px] px-5 text-base font-semibold transition ${
                  activeTab === "archive"
                    ? "bg-primary text-white"
                    : "bg-transparent text-gray hover:bg-gray-50"
                }`}
              >
                {invoicing("archiveInvoices")} ({archiveCount})
              </button>
            </div>

            <div className="px-2 lg:px-0">
              <InvoicingTable
                invoices={filteredInvoices}
                isLoading={isLoading}
                isFetching={isFetching}
                selectedInvoiceIds={selectedInvoiceIds}
                onToggleInvoice={toggleInvoice}
                onToggleAllVisible={toggleAllVisibleInvoices}
                onViewInvoice={(invoice) => setSelectedInvoice(invoice)}
                onGenerateInvoice={(invoice) => previewInvoices([invoice])}
              />
            </div>
          </>
        ) : (
          <div className="space-y-5 px-4 pb-4 lg:px-0 lg:pb-0">
            <WeeklyPayoutInvoicePanel />

            <SubscriptionsFilters
              search={subscriptionSearch}
              status={subscriptionStatus}
              onSearchChange={handleSubscriptionSearchChange}
              onStatusChange={handleSubscriptionStatusChange}
            />

            <SubscriptionsTable
              subscriptions={subscriptions}
              loading={isSubscriptionsLoading}
              currentPage={subscriptionsMeta?.page ?? subscriptionPage}
              totalPages={subscriptionsMeta?.totalPages ?? 1}
              total={subscriptionsMeta?.total ?? subscriptions.length}
              pageSize={subscriptionsMeta?.limit ?? 10}
              onPageChange={setSubscriptionPage}
              onViewInvoice={setSubscriptionInvoiceData}
              onDownloadInvoice={handleDownloadSubscriptionInvoice}
              onSendInvoiceEmail={(subscription) =>
                handleSendSubscriptionInvoiceEmail(subscription.id)
              }
              downloadingInvoiceId={downloadingSubscriptionInvoiceId}
              sendingInvoiceId={sendingSubscriptionInvoiceId}
            />
          </div>
        )}
      </div>

      <InvoicePreviewModal
        open={previewOpen}
        payload={previewPayload}
        onOpenChange={setPreviewOpen}
        onBack={() => setPreviewOpen(false)}
        onGenerate={handleGenerateAndSend}
      />

      <InvoiceSuccessModal
        open={successOpen}
        payload={successPayload}
        onOpenChange={setSuccessOpen}
        onGenerateMore={() => {
          setSuccessOpen(false);
        }}
      />

      <InvoiceDetailsModal
        open={!!selectedInvoice}
        invoice={selectedInvoice}
        onOpenChange={(open) => {
          if (!open) setSelectedInvoice(null);
        }}
      />

      <SubscriptionInvoiceModal
        open={!!subscriptionInvoiceData}
        subscription={subscriptionInvoiceData}
        downloading={
          !!subscriptionInvoiceData?.id &&
          downloadingSubscriptionInvoiceId === subscriptionInvoiceData.id
        }
        sending={
          !!subscriptionInvoiceData?.id &&
          sendingSubscriptionInvoiceId === subscriptionInvoiceData.id
        }
        onOpenChange={(open) => {
          if (!open) setSubscriptionInvoiceData(null);
        }}
        onDownload={handleDownloadSubscriptionInvoice}
        onSendEmail={handleSendSubscriptionInvoiceEmail}
      />
    </Container>
  );
}

function InvoiceWorkspaceButton({
  active,
  title,
  description,
  count,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[92px] flex-1 items-center justify-between gap-4 rounded-[14px] border px-5 py-4 text-left transition ${
        active
          ? "border-primary bg-primary/[0.04] shadow-sm"
          : "border-gray-100 bg-white hover:border-primary/30 hover:bg-primary/[0.02]"
      }`}
    >
      <div className="min-w-0">
        <p className="text-base font-semibold text-gray-950">{title}</p>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
      <span
        className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-bold ${
          active ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function InvoiceGenerationPanel({
  billingCycle,
  billingCycleOptions,
  invoiceDate,
  dueDate,
  message,
  additionalChargesInput,
  selectedCount,
  baseTotalAmount,
  additionalCharges,
  finalTotalAmount,
  onBillingCycleChange,
  onInvoiceDateChange,
  onDueDateChange,
  onMessageChange,
  onAdditionalChargesChange,
  onPreview,
}: {
  billingCycle: string;
  billingCycleOptions: BillingCycleOption[];
  invoiceDate: string;
  dueDate: string;
  message: string;
  additionalChargesInput: string;
  selectedCount: number;
  baseTotalAmount: number;
  additionalCharges: number;
  finalTotalAmount: number;
  onBillingCycleChange: (value: string) => void;
  onInvoiceDateChange: (value: string) => void;
  onDueDateChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onAdditionalChargesChange: (value: string) => void;
  onPreview: () => void;
}) {
  const invoicing = useTranslations("invoicing");
  const currency = useGlobalCurrency();

  return (
    <div className="grid gap-4 px-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:px-0">
      <div className="rounded-[14px] border border-gray-100 bg-white p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
          <CalendarDays size={16} className="text-primary" />
          {invoicing("billingInformation")}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700">
              {invoicing("billingCycle")}
            </label>
            <Select value={billingCycle} onValueChange={onBillingCycleChange}>
              <SelectTrigger className="h-[46px] rounded-[12px] bg-white">
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
              onChange={(event) => onInvoiceDateChange(event.target.value)}
              className="h-[46px] rounded-[12px] bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700">
              {invoicing("dueDate")}
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(event) => onDueDateChange(event.target.value)}
              className="h-[46px] rounded-[12px] bg-white"
            />
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
              <MessageSquare size={14} className="text-primary" />
              {invoicing("message")}
            </label>
            <Textarea
              value={message}
              onChange={(event) => onMessageChange(event.target.value)}
              placeholder={invoicing("messagePlaceholder")}
              className="min-h-[92px] resize-none rounded-[12px] bg-white"
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
                onAdditionalChargesChange(event.target.value)
              }
              placeholder="0.00 or -25.00"
              className="h-[46px] rounded-[12px] bg-white"
            />
            <p className="text-[11px] leading-5 text-gray-400">
              {invoicing("additionalChargesHelp")}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[14px] border border-green-200 bg-green-50 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-white text-green">
              <CreditCard size={18} />
            </div>
            <p className="text-sm font-semibold text-green-800">
              {invoicing("invoicesSelected", { count: selectedCount })}
            </p>
            <p className="mt-1 text-xs text-green-700">
              {invoicing("selectRowsToGenerate")}
            </p>
          </div>
          <ReceiptText className="text-green-600" size={24} />
        </div>

        <div className="mt-5 space-y-2 text-sm text-green-800">
          <div className="flex justify-between">
            <span>{invoicing("base")}</span>
            <span className="font-semibold">{formatMoney(baseTotalAmount, currency)}</span>
          </div>
          <div className="flex justify-between">
            <span>{invoicing("adjustment")}</span>
            <span className="font-semibold">
              {formatSignedMoney(additionalCharges, currency)}
            </span>
          </div>
          <div className="flex justify-between border-t border-green-200 pt-3 text-base">
            <span className="font-semibold">{invoicing("finalTotal")}</span>
            <span className="font-bold">{formatMoney(finalTotalAmount, currency)}</span>
          </div>
        </div>

        <Button
          type="button"
          variant="primary"
          disabled={selectedCount === 0}
          onClick={onPreview}
          className="mt-5 h-[48px] w-full rounded-[14px]"
        >
          <ReceiptText size={17} />
          {invoicing("previewSelected")}
        </Button>
      </div>
    </div>
  );
}
