"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import Container from "../../../components/container";
import Filters from "@/components/filter";
import {
  BillingCycleOption,
  InvoicingHeader,
} from "@/components/pages/invoicing/header";
import { InvoicingTable } from "@/components/tables/invoicing-table";
import {
  GenerateInvoiceModal,
  InvoiceGenerationPayload,
} from "@/components/pages/invoicing/generate-invoice-modal";
import { InvoicePreviewModal } from "@/components/pages/invoicing/invoice-preview-modal";
import { InvoiceSuccessModal } from "@/components/pages/invoicing/invoice-success-modal";
import { InvoiceDetailsModal } from "@/components/pages/invoicing/invoice-details-modal";

import { useGetAdminReportInvoices } from "@/hooks/useReports";
import type { AdminInvoice, AdminInvoicesParams } from "@/services/reports";

type InvoiceTab = "active" | "archive";

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

  const [activeTab, setActiveTab] = useState<InvoiceTab>("active");
  const [billingCycle, setBillingCycle] = useState(defaultBillingCycle);

  const [filters, setFilters] = useState<InvoiceFilters>({
    search: "",
    status: "",
    orderType: "",
    paymentStatus: "",
    kind: "",
    fromDate: defaultRange.fromDate,
    toDate: defaultRange.toDate,
  });

  const [generateOpen, setGenerateOpen] = useState(false);
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

  const updateFilter = (key: keyof InvoiceFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
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
  };

  const handlePreviewInvoice = (payload: InvoiceGenerationPayload) => {
    setPreviewPayload(payload);
    setGenerateOpen(false);
    setPreviewOpen(true);
  };

  const handleGenerateAndSend = () => {
    if (!previewPayload) return;

    setSuccessPayload(previewPayload);
    setPreviewOpen(false);
    setSuccessOpen(true);
  };

  return (
    <Container>
      <InvoicingHeader
        title={invoicing("dashboardTitle")}
        description={invoicing("dashboardDescription")}
        billingCycle={billingCycle}
        billingCycleOptions={billingCycleOptions}
        onBillingCycleChange={handleBillingCycleChange}
        onGenerateClick={() => setGenerateOpen(true)}
      />

      <div className="space-y-[32px] rounded-[14px] bg-white shadow-sm lg:p-[30px]">
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
            onViewInvoice={(invoice) => setSelectedInvoice(invoice)}
          />
        </div>
      </div>

      <GenerateInvoiceModal
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        invoices={filteredInvoices}
        billingCycle={billingCycle}
        billingCycleOptions={billingCycleOptions}
        onBillingCycleChange={handleBillingCycleChange}
        onPreview={handlePreviewInvoice}
      />

      <InvoicePreviewModal
        open={previewOpen}
        payload={previewPayload}
        onOpenChange={setPreviewOpen}
        onBack={() => {
          setPreviewOpen(false);
          setGenerateOpen(true);
        }}
        onGenerate={handleGenerateAndSend}
      />

      <InvoiceSuccessModal
        open={successOpen}
        payload={successPayload}
        onOpenChange={setSuccessOpen}
        onGenerateMore={() => {
          setSuccessOpen(false);
          setGenerateOpen(true);
        }}
      />

      <InvoiceDetailsModal
        open={!!selectedInvoice}
        invoice={selectedInvoice}
        onOpenChange={(open) => {
          if (!open) setSelectedInvoice(null);
        }}
      />
    </Container>
  );
}
