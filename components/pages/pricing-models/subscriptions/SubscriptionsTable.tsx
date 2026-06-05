"use client";

import type { ReactNode } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Pencil,
} from "lucide-react";
import { useTranslations } from "next-intl";

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

type SubscriptionsTableProps = {
  subscriptions: PackageSubscriptionRow[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onEdit: (subscription: PackageSubscriptionRow) => void;
};

const formatDate = (value?: string | null) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatMoney = (value?: string | number, currency?: string | null) => {
  const amount = Number(value || 0);

  if (!Number.isFinite(amount)) return null;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "PKR",
    maximumFractionDigits: 2,
  }).format(amount);
};

const statusLabelKeys: Record<string, string> = {
  TRIALING: "display.status.trialing",
  ACTIVE: "display.status.active",
  PAST_DUE: "display.status.pastDue",
  CANCELLED: "display.status.cancelled",
  EXPIRED: "display.status.expired",
  PENDING: "display.paymentStatus.pending",
  PAID: "display.paymentStatus.paid",
  FAILED: "display.paymentStatus.failed",
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

const getStatusClass = (status?: string | null) => {
  if (status === "ACTIVE") return "bg-red-50 text-primary";
  if (status === "TRIALING") return "bg-red-50 text-primary";
  if (status === "PAST_DUE") return "bg-red-50 text-primary";
  if (status === "EXPIRED") return "bg-gray-100 text-gray";
  if (status === "CANCELLED") return "bg-gray-100 text-gray";

  return "bg-gray-100 text-dark";
};

const getPaymentClass = (status?: string | null) => {
  if (status === "PAID") return "bg-red-50 text-primary";
  if (status === "PENDING") return "bg-gray-100 text-dark";
  if (status === "FAILED") return "bg-red-50 text-primary";
  if (status === "CANCELLED") return "bg-gray-100 text-gray";

  return "bg-gray-100 text-gray";
};

const getOwnerName = (item: PackageSubscriptionRow) => {
  return (
    item.restaurant?.name ||
    item.tenant?.name ||
    item.restaurantId ||
    item.tenantId ||
    null
  );
};

const getOwnerMeta = (item: PackageSubscriptionRow) => {
  return (
    item.restaurant?.email ||
    item.tenant?.email ||
    item.restaurantId ||
    item.tenantId ||
    ""
  );
};

export function SubscriptionsTable({
  subscriptions,
  loading,
  currentPage,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onEdit,
}: SubscriptionsTableProps) {
  const pricingModel = useTranslations("pricingModel");
  const common = useTranslations("common");
  const tables = useTranslations("tables");
  const safeTotalPages = Math.max(totalPages, 1);
  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <TableHead>{pricingModel("tables.owner")}</TableHead>
              <TableHead>{pricingModel("tables.packagePlan")}</TableHead>
              <TableHead>{pricingModel("tables.billing")}</TableHead>
              <TableHead>{pricingModel("tables.subscriptionDates")}</TableHead>
              <TableHead>{pricingModel("tables.payment")}</TableHead>
              <TableHead>{common("status")}</TableHead>
              <TableHead align="right">{common("actions")}</TableHead>
            </tr>
          </thead>

          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, index) => (
                <SkeletonRow key={index} />
              ))}

            {!loading && subscriptions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-14 text-center">
                  <p className="text-base font-semibold text-dark">
                    {pricingModel("subscriptions.noSubscriptionsFound")}
                  </p>
                  <p className="mt-1 text-sm text-gray">
                    {pricingModel(
                      "subscriptions.noSubscriptionsFoundDescription"
                    )}
                  </p>
                </td>
              </tr>
            )}

            {!loading &&
              subscriptions.map((item) => {
                const plan = item.packagePlan;
                const paymentStatus = item.paymentStatus || "N/A";
                const subscriptionStatus = item.status || "N/A";

                return (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 transition hover:bg-gray-50/60 last:border-b-0"
                  >
                    <td className="px-6 py-5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-dark">
                          {getOwnerName(item) ||
                            pricingModel("subscriptions.unknownOwner")}
                        </p>
                        <p className="mt-1 max-w-[220px] truncate text-xs text-gray">
                          {getOwnerMeta(item)}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <p className="text-sm font-semibold text-dark">
                        {plan?.name || item.packagePlanId}
                      </p>
                      <p className="mt-1 text-xs text-gray">
                        {plan?.billingModel &&
                        billingModelLabelKeys[plan.billingModel]
                          ? pricingModel(
                              billingModelLabelKeys[plan.billingModel]
                            )
                          : pricingModel("subscriptions.packagePlanFallback")}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-red-50 text-primary">
                          <CreditCard size={17} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-dark">
                            {formatMoney(plan?.planPrice, plan?.currency) ||
                              pricingModel("display.custom")}
                          </p>
                          <p className="text-xs text-gray">
                            {plan?.billingInterval &&
                            billingIntervalLabelKeys[plan.billingInterval]
                              ? pricingModel(
                                  billingIntervalLabelKeys[
                                    plan.billingInterval
                                  ]
                                )
                              : pricingModel("subscriptions.intervalNotSet")}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-start gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-gray-100 text-gray">
                          <CalendarDays size={17} />
                        </div>

                        <div>
                          <p className="text-xs text-gray">
                            {pricingModel("subscriptions.start")}{" "}
                            <span className="font-semibold text-dark">
                              {formatDate(item.startsAt) ||
                                pricingModel("subscriptions.notSet")}
                            </span>
                          </p>
                          <p className="mt-1 text-xs text-gray">
                            {pricingModel("subscriptions.next")}{" "}
                            <span className="font-semibold text-dark">
                              {formatDate(item.nextBillingAt) ||
                                pricingModel("subscriptions.notSet")}
                            </span>
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`
                          inline-flex rounded-full px-3 py-1 text-xs font-semibold
                          ${getPaymentClass(paymentStatus)}
                        `}
                      >
                        {statusLabelKeys[paymentStatus]
                          ? pricingModel(statusLabelKeys[paymentStatus])
                          : common("notAvailable")}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`
                          inline-flex rounded-full px-3 py-1 text-xs font-semibold
                          ${getStatusClass(subscriptionStatus)}
                        `}
                      >
                        {statusLabelKeys[subscriptionStatus]
                          ? pricingModel(statusLabelKeys[subscriptionStatus])
                          : common("notAvailable")}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className="inline-flex size-8 items-center justify-center rounded-lg text-gray transition hover:bg-red-50 hover:text-primary"
                          title={pricingModel("actions.updateSubscription")}
                        >
                          <Pencil size={16} />
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
          {tables("showingSubscriptions", { from, to, total })}
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
      {Array.from({ length: 7 }).map((_, index) => (
        <td key={index} className="px-6 py-5">
          <div className="h-5 w-full max-w-[130px] animate-pulse rounded bg-gray-100" />
        </td>
      ))}
    </tr>
  );
}
