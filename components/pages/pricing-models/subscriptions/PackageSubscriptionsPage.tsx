"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Container from "@/components/container";
import Header from "@/components/header";
import { useGetPackageSubscriptions } from "@/hooks/usePackagePlans";
import { SubscriptionModal } from "./SubscriptionModal";
import { SubscriptionsFilters } from "./SubscriptionsFilters";
import { SubscriptionsTable } from "./SubscriptionsTable";

type SubscriptionStatusFilter =
  | "ALL"
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELLED"
  | "EXPIRED";

type PackageSubscriptionRow = {
  id: string;
  tenantId?: string | null;
  restaurantId?: string | null;
  packagePlanId: string;
  paymentStatus?: string | null;
  status: string;
  startsAt?: string | null;
  endsAt?: string | null;
  nextBillingAt?: string | null;
  note?: string | null;
  createdAt?: string;
  updatedAt?: string;
  packagePlan?: {
    id: string;
    name: string;
    billingModel?: string;
    billingInterval?: string;
    planPrice?: string | number;
    currency?: string;
  } | null;
  tenant?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
  restaurant?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
};

type PackageSubscriptionsResponse = {
  success?: boolean;
  data?: PackageSubscriptionRow[];
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

export function PackageSubscriptionsPage() {
  const pricingModel = useTranslations("pricingModel");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SubscriptionStatusFilter>("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<PackageSubscriptionRow | null>(null);

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

  const response = subscriptionsQuery.data as PackageSubscriptionsResponse | undefined;

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

  const handleCreate = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const handleEdit = (item: PackageSubscriptionRow) => {
    setEditData(item);
    setModalOpen(true);
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
      <div className="w-full">
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <Header
            title={pricingModel("subscriptions.title")}
            description={pricingModel("subscriptions.description")}
          />

          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-white shadow-lg shadow-red-900/10 transition hover:opacity-90"
          >
            <Plus size={18} />
            {pricingModel("actions.assignSubscription")}
          </button>
        </div>

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
        />

        <SubscriptionModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          initialData={editData}
        />
      </div>
    </Container>
  );
}
