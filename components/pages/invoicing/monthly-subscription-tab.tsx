"use client";

import { useEffect, useMemo, useState } from "react";

import { SubscriptionChargesModal } from "@/components/pages/pricing-models/subscriptions/SubscriptionChargesModal";
import { SubscriptionsFilters } from "@/components/pages/pricing-models/subscriptions/SubscriptionsFilters";
import { SubscriptionModal } from "@/components/pages/pricing-models/subscriptions/SubscriptionModal";
import { SubscriptionsTable } from "@/components/pages/pricing-models/subscriptions/SubscriptionsTable";
import { useGetPackageSubscriptions } from "@/hooks/usePackagePlans";
import type { PackageSubscription } from "@/services/packagePlans";

type SubscriptionStatusFilter =
  | "ALL"
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELLED"
  | "EXPIRED";

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

export function MonthlySubscriptionTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SubscriptionStatusFilter>("ALL");
  const [editData, setEditData] = useState<PackageSubscription | null>(null);
  const [chargesData, setChargesData] = useState<PackageSubscription | null>(
    null,
  );

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

  const response = subscriptionsQuery.data as
    | PackageSubscriptionsResponse
    | undefined;

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

  const handleStatusChange = (value: SubscriptionStatusFilter) => {
    setStatus(value);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="space-y-5">
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
        onEdit={setEditData}
        onManageCharges={setChargesData}
      />

      <SubscriptionModal
        open={!!editData}
        onOpenChange={(open) => {
          if (!open) setEditData(null);
        }}
        initialData={editData}
      />

      <SubscriptionChargesModal
        open={!!chargesData}
        subscription={chargesData}
        onOpenChange={(open) => {
          if (!open) setChargesData(null);
        }}
      />
    </div>
  );
}
