"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";

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

type PlansTableProps = {
  plans: PackagePlanRow[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  deletingId?: string | null;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => void;
};

const billingModelLabelKeys: Record<string, string> = {
  HYBRID: "display.pricingModels.hybrid",
  PLAN: "display.pricingModels.plan",
  COMMISSION: "display.pricingModels.commission",
};

const billingIntervalLabelKeys: Record<string, string> = {
  MONTHLY: "display.billingIntervals.monthly",
  YEARLY: "display.billingIntervals.yearly",
  WEEKLY: "display.billingIntervals.weekly",
  DAILY: "display.billingIntervals.daily",
};

const formatMoney = (value: string | number, currency?: string | null) => {
  const amount = Number(value || 0);

  if (!Number.isFinite(amount)) return null;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "EUR",
    maximumFractionDigits: 2,
  }).format(amount);
};

const countEnabledFeatures = (features?: Record<string, boolean>) => {
  if (!features) return 0;
  return Object.values(features).filter(Boolean).length;
};

const getInitial = (name: string) => {
  return name?.trim()?.charAt(0)?.toUpperCase() || "P";
};

const getPlanAvatarClass = (index: number) => {
  const classes = [
    "bg-red-50 text-primary",
    "bg-gray-100 text-dark",
    "bg-black text-white",
    "bg-red-100 text-primary",
    "bg-gray-200 text-dark",
  ];

  return classes[index % classes.length];
};

const getCommissionRule = (
  plan: PackagePlanRow,
  pricingModel: ReturnType<typeof useTranslations<"pricingModel">>
) => {
  if (plan.billingModel === "PLAN") {
    return {
      title: pricingModel("display.noCommission"),
      subtitle: pricingModel("display.flatSubscription"),
    };
  }

  const commission = Number(plan.commissionPercentage || 0);
  const cap = Number(plan.commissionCapAmount || 0);

  if (plan.billingModel === "HYBRID") {
    return {
      title: pricingModel("plansListing.commissionPlusCap", { commission }),
      subtitle:
        cap > 0
          ? pricingModel("plansListing.capAmount", {
              amount:
                formatMoney(cap, plan.currency) ||
                pricingModel("display.custom"),
            })
          : pricingModel("review.noCap"),
    };
  }

  return {
    title: pricingModel("plansListing.flatRate", { commission }),
    subtitle: pricingModel("plansListing.perOrderFee"),
  };
};

const getVisiblePages = (currentPage: number, totalPages: number) => {
  const safeTotalPages = Math.max(totalPages, 1);
  const pages: number[] = [];

  const start = Math.max(1, currentPage - 1);
  const end = Math.min(safeTotalPages, currentPage + 1);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  return pages;
};

export function PlansTable({
  plans,
  loading,
  currentPage,
  totalPages,
  total,
  pageSize,
  deletingId,
  onPageChange,
  onDelete,
}: PlansTableProps) {
  const pricingModel = useTranslations("pricingModel");
  const tables = useTranslations("tables");
  const common = useTranslations("common");
  const safeTotalPages = Math.max(totalPages, 1);
  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <TableHead>{pricingModel("tables.planName")}</TableHead>
              <TableHead>{pricingModel("tables.pricingType")}</TableHead>
              <TableHead>{pricingModel("tables.price")}</TableHead>
              <TableHead>{pricingModel("tables.commissionRule")}</TableHead>
              <TableHead>{pricingModel("tables.features")}</TableHead>
              <TableHead>{common("status")}</TableHead>
              <TableHead align="right">{common("actions")}</TableHead>
            </tr>
          </thead>

          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, index) => (
                <SkeletonRow key={index} />
              ))}

            {!loading && plans.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-14 text-center">
                  <p className="text-base font-semibold text-dark">
                    {pricingModel("plansListing.noPlansFound")}
                  </p>
                  <p className="mt-1 text-sm text-gray">
                    {pricingModel("plansListing.noPlansFoundDescription")}
                  </p>
                </td>
              </tr>
            )}

            {!loading &&
              plans.map((plan, index) => {
                const commissionRule = getCommissionRule(plan, pricingModel);
                const enabledFeaturesCount = countEnabledFeatures(plan.features);
                const isArchived = !plan.isActive || Boolean(plan.deletedAt);

                return (
                  <tr
                    key={plan.id}
                    className="border-b border-gray-100 transition hover:bg-gray-50/60 last:border-b-0"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div
                          className={`
                            flex size-10 shrink-0 items-center justify-center rounded-md text-sm font-semibold
                            ${getPlanAvatarClass(index)}
                          `}
                        >
                          {getInitial(plan.name)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-dark">
                              {plan.name}
                            </p>

                            {plan.isDefault && (
                              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                {pricingModel("display.status.default")}
                              </span>
                            )}
                          </div>

                          <p className="mt-1 line-clamp-2 max-w-[230px] text-xs leading-4 text-gray">
                            {plan.description ||
                              pricingModel("display.noDescriptionProvided")}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-2">
                        <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-dark">
                          {billingModelLabelKeys[plan.billingModel]
                            ? pricingModel(
                                billingModelLabelKeys[plan.billingModel]
                              )
                            : plan.billingModel}
                        </span>

                        <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray">
                          {billingIntervalLabelKeys[plan.billingInterval]
                            ? pricingModel(
                                billingIntervalLabelKeys[plan.billingInterval]
                              )
                            : plan.billingInterval}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <p className="text-base font-bold text-dark">
                        {formatMoney(plan.planPrice, plan.currency) ||
                          pricingModel("display.custom")}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <p className="text-sm font-semibold text-dark">
                        {commissionRule.title}
                      </p>
                      <p className="mt-1 text-xs text-gray">
                        {commissionRule.subtitle}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <span className="rounded-md bg-gray-100 px-3 py-1 text-xs font-semibold text-dark">
                        {enabledFeaturesCount}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`
                          inline-flex items-center gap-2 text-sm font-semibold
                          ${isArchived ? "text-gray" : "text-primary"}
                        `}
                      >
                        <span
                          className={`
                            size-2 rounded-full
                            ${isArchived ? "bg-gray-300" : "bg-primary"}
                          `}
                        />
                        {isArchived
                          ? pricingModel("display.status.archived")
                          : pricingModel("display.status.active")}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/pricing-model/create-new-plan?id=${plan.id}`}
                          className="inline-flex size-8 items-center justify-center rounded-lg text-gray transition hover:bg-red-50 hover:text-primary"
                          title={pricingModel("actions.editPlan")}
                        >
                          <Pencil size={16} />
                        </Link>

                        <button
                          type="button"
                          disabled={deletingId === plan.id}
                          onClick={() => onDelete(plan.id)}
                          className="inline-flex size-8 items-center justify-center rounded-lg text-gray transition hover:bg-red-50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                          title={pricingModel("actions.deletePlan")}
                        >
                          <Trash2 size={16} />
                        </button>

                    
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 border-t border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-gray">
          {tables("showingPlans", { from, to, total })}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="inline-flex size-9 items-center justify-center rounded-lg text-gray transition hover:bg-gray-100 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={18} />
          </button>

          {getVisiblePages(currentPage, safeTotalPages).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`
                inline-flex size-9 items-center justify-center rounded-lg text-sm font-semibold transition
                ${
                  page === currentPage
                    ? "bg-primary text-white"
                    : "text-gray hover:bg-gray-100 hover:text-primary"
                }
              `}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            disabled={currentPage >= safeTotalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="inline-flex size-9 items-center justify-center rounded-lg text-gray transition hover:bg-gray-100 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function TableHead({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`
        px-6 py-5 text-xs font-semibold uppercase text-gray
        ${align === "right" ? "text-right" : "text-left"}
      `}
    >
      {children}
    </th>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100 last:border-b-0">
      <td className="px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="size-10 animate-pulse rounded-md bg-gray-100" />
          <div className="space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-44 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      </td>

      <td className="px-6 py-5">
        <div className="space-y-2">
          <div className="h-6 w-20 animate-pulse rounded-full bg-gray-100" />
          <div className="h-6 w-24 animate-pulse rounded-full bg-gray-100" />
        </div>
      </td>

      <td className="px-6 py-5">
        <div className="h-5 w-24 animate-pulse rounded bg-gray-100" />
      </td>

      <td className="px-6 py-5">
        <div className="space-y-2">
          <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
          <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
        </div>
      </td>

      <td className="px-6 py-5">
        <div className="h-6 w-10 animate-pulse rounded-md bg-gray-100" />
      </td>

      <td className="px-6 py-5">
        <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
      </td>

      <td className="px-6 py-5">
        <div className="ml-auto h-8 w-24 animate-pulse rounded-lg bg-gray-100" />
      </td>
    </tr>
  );
}
