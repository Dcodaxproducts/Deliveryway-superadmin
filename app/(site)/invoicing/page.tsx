"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import Container from "../../../components/container";
import Header from "@/components/header";
import { WeeklyPayoutInvoicePanel } from "@/components/pages/invoicing/weekly-payout-invoice-panel";
import { SubscriptionChargesModal } from "@/components/pages/pricing-models/subscriptions/SubscriptionChargesModal";
import { SubscriptionsFilters } from "@/components/pages/pricing-models/subscriptions/SubscriptionsFilters";
import { SubscriptionInvoiceModal } from "@/components/pages/pricing-models/subscriptions/SubscriptionInvoiceModal";
import { SubscriptionModal } from "@/components/pages/pricing-models/subscriptions/SubscriptionModal";
import { SubscriptionsTable } from "@/components/pages/pricing-models/subscriptions/SubscriptionsTable";
import {
  useDownloadPackageSubscriptionInvoicePdf,
  useGetPackageSubscriptions,
  useSendPackageSubscriptionInvoiceEmail,
} from "@/hooks/usePackagePlans";
import type { PackageSubscription } from "@/services/packagePlans";

type SubscriptionStatusFilter =
  "ALL" | "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELLED" | "EXPIRED";

type PackageSubscriptionsResponse = {
  success?: boolean;
  data?: PackageSubscription[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
  };
};

const DEFAULT_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 400;

const useDebouncedValue = <T,>(value: T, delay = SEARCH_DEBOUNCE_MS) => {
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

export default function InvoicingPage() {
  const invoicing = useTranslations("invoicing");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SubscriptionStatusFilter>("ALL");
  const [editData, setEditData] = useState<PackageSubscription | null>(null);
  const [invoiceData, setInvoiceData] = useState<PackageSubscription | null>(
    null,
  );
  const [chargesData, setChargesData] = useState<PackageSubscription | null>(
    null,
  );
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<
    string | null
  >(null);
  const [sendingInvoiceId, setSendingInvoiceId] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search.trim());

  const params = useMemo(() => {
    return {
      page,
      limit: DEFAULT_LIMIT,
      search: debouncedSearch || undefined,
      sortBy: "createdAt",
      sortOrder: "DESC" as const,
      status: status === "ALL" ? undefined : status,
      includeInactive: status !== "ACTIVE",
      withDeleted: false,
    };
  }, [page, debouncedSearch, status]);

  const subscriptionsQuery = useGetPackageSubscriptions(params);
  const downloadInvoiceMutation = useDownloadPackageSubscriptionInvoicePdf();
  const sendInvoiceEmailMutation = useSendPackageSubscriptionInvoiceEmail();

  const response = subscriptionsQuery.data as
    PackageSubscriptionsResponse | undefined;

  const subscriptions = response?.data ?? [];
  const meta = response?.meta;

  const total = meta?.total ?? subscriptions.length;
  const totalPages = meta?.totalPages ?? 1;
  const currentPage = meta?.page ?? page;
  const isSearchDebouncing = search.trim() !== debouncedSearch;
  const isTableLoading =
    subscriptionsQuery.isLoading ||
    subscriptionsQuery.isFetching ||
    isSearchDebouncing;

  const handleEdit = (item: PackageSubscription) => {
    setEditData(item);
  };

  const handleDownloadInvoice = (subscriptionId: string) => {
    setDownloadingInvoiceId(subscriptionId);

    downloadInvoiceMutation.mutate(subscriptionId, {
      onSettled: () => {
        setDownloadingInvoiceId(null);
      },
    });
  };

  const handleSendInvoiceEmail = (subscriptionId: string, email?: string) => {
    setSendingInvoiceId(subscriptionId);

    sendInvoiceEmailMutation.mutate(
      {
        id: subscriptionId,
        payload: email ? { email } : undefined,
      },
      {
        onSettled: () => {
          setSendingInvoiceId(null);
        },
      },
    );
  };

  const handleStatusChange = (value: SubscriptionStatusFilter) => {
    setStatus(value);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <Container>
      <div className="w-full space-y-7">
        <Header
          title={invoicing("dashboardTitle")}
          description={invoicing("dashboardDescription")}
        />

        <div className="space-y-5 rounded-[14px] bg-white p-4 shadow-sm lg:p-[30px]">
          <WeeklyPayoutInvoicePanel />

          <SubscriptionsFilters
            search={search}
            status={status}
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusChange}
          />

          <SubscriptionsTable
            subscriptions={subscriptions}
            loading={isTableLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            total={total}
            pageSize={DEFAULT_LIMIT}
            onPageChange={setPage}
            onEdit={handleEdit}
            onManageCharges={setChargesData}
            onViewInvoice={setInvoiceData}
            onDownloadInvoice={handleDownloadInvoice}
            onSendInvoiceEmail={(item) => handleSendInvoiceEmail(item.id)}
            downloadingInvoiceId={downloadingInvoiceId}
            sendingInvoiceId={sendingInvoiceId}
          />
        </div>

        <SubscriptionModal
          open={!!editData}
          onOpenChange={(open) => {
            if (!open) setEditData(null);
          }}
          initialData={editData}
        />

        <SubscriptionInvoiceModal
          open={!!invoiceData}
          subscription={invoiceData}
          downloading={
            !!invoiceData?.id && downloadingInvoiceId === invoiceData.id
          }
          sending={!!invoiceData?.id && sendingInvoiceId === invoiceData.id}
          onOpenChange={(open) => {
            if (!open) setInvoiceData(null);
          }}
          onDownload={handleDownloadInvoice}
          onSendEmail={handleSendInvoiceEmail}
        />

        <SubscriptionChargesModal
          open={!!chargesData}
          subscription={chargesData}
          onOpenChange={(open) => {
            if (!open) setChargesData(null);
          }}
        />
      </div>
    </Container>
  );
}
