"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Header from "@/components/header";
import {
  useDeletePackagePlan,
  useGetPackagePlans,
} from "@/hooks/usePackagePlans";
import { PlansListingFilters } from "@/components/pages/pricing-models/plans-listing/PlansListingFilters";
import { PlansTable } from "@/components/pages/pricing-models/plans-listing/PlansTable";
import Container from "@/components/container";

type BillingModelFilter = "ALL" | "COMMISSION" | "PLAN" | "HYBRID";
type StatusFilter = "ACTIVE" | "ARCHIVED";

type PackagePlanRow = {
  id: string;
  name: string;
  description?: string | null;
  billingModel: string;
  billingInterval: string;
  planPrice: string | number;
  commissionPercentage?: string | number | null;
  commissionCapAmount?: string | number | null;
  currency?: string | null;
  features?: Record<string, boolean>;
  isActive: boolean;
  isDefault?: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  termsDocumentUrl?: string | null;
};

type PackagePlansResponse = {
  success?: boolean;
  data?: PackagePlanRow[];
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

export default function PlansListingPage() {
  const pricingModel = useTranslations("pricingModel");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [billingModel, setBillingModel] = useState<BillingModelFilter>("ALL");
  const [status, setStatus] = useState<StatusFilter>("ACTIVE");

  const debouncedSearch = useDebouncedValue(search.trim());

  const params = useMemo(() => {
    return {
      page,
      limit: DEFAULT_LIMIT,
      search: debouncedSearch || undefined,
      sortBy: "createdAt",
      sortOrder: "DESC" as const,
      billingModel: billingModel === "ALL" ? undefined : billingModel,
      includeInactive: status === "ARCHIVED",
      withDeleted: status === "ARCHIVED",
    };
  }, [page, debouncedSearch, billingModel, status]);

  const packagePlansQuery = useGetPackagePlans(params);
  const deletePackagePlan = useDeletePackagePlan();

  const response = packagePlansQuery.data as PackagePlansResponse | undefined;
  const serverPlans = useMemo(() => response?.data ?? [], [response?.data]);

  const visiblePlans = useMemo(() => {
    if (status === "ACTIVE") {
      return serverPlans.filter((plan) => plan.isActive && !plan.deletedAt);
    }

    return serverPlans.filter(
      (plan) => !plan.isActive || Boolean(plan.deletedAt)
    );
  }, [serverPlans, status]);

  const meta = response?.meta;

  const total = meta?.total ?? visiblePlans.length;
  const totalPages = meta?.totalPages ?? 1;
  const currentPage = meta?.page ?? page;

  const isSearchDebouncing = search.trim() !== debouncedSearch;

  const isTableLoading =
    packagePlansQuery.isLoading ||
    packagePlansQuery.isFetching ||
    isSearchDebouncing;

  const handleStatusChange = (nextStatus: StatusFilter) => {
    setStatus(nextStatus);
    setPage(1);
  };

  const handleBillingModelChange = (nextBillingModel: BillingModelFilter) => {
    setBillingModel(nextBillingModel);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
  };

  const handleDelete = async (id: string) => {
    await deletePackagePlan.mutateAsync(id);
  };

  return (
    <Container>
      <section className="mx-auto w-full ">
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <Header
            title={pricingModel("plansListing.title")}
            description={pricingModel("plansListing.description")}
          />

          <Link
            href="/pricing-model/create-new-plan"
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-white shadow-lg shadow-red-900/10 transition hover:opacity-90"
          >
            <Plus size={18} />
            {pricingModel("actions.createNewPlan")}
          </Link>
        </div>

        <PlansListingFilters
          search={search}
          status={status}
          billingModel={billingModel}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          onBillingModelChange={handleBillingModelChange}
        />

        <PlansTable
          plans={visiblePlans}
          loading={isTableLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          total={total}
          pageSize={DEFAULT_LIMIT}
          deletingId={
            deletePackagePlan.variables
              ? String(deletePackagePlan.variables)
              : null
          }
          onPageChange={handlePageChange}
          onDelete={handleDelete}
        />
      </section>
   </Container>
  );
}
