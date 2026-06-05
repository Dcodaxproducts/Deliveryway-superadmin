"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useTranslations } from "next-intl";

type SubscriptionStatusFilter =
  | "ALL"
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELLED"
  | "EXPIRED";

type SubscriptionsFiltersProps = {
  search: string;
  status: SubscriptionStatusFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: SubscriptionStatusFilter) => void;
};

const statusOptions: Array<{
  labelKey: string;
  value: SubscriptionStatusFilter;
}> = [
  { labelKey: "display.status.all", value: "ALL" },
  { labelKey: "display.status.trialing", value: "TRIALING" },
  { labelKey: "display.status.active", value: "ACTIVE" },
  { labelKey: "display.status.pastDue", value: "PAST_DUE" },
  { labelKey: "display.status.cancelled", value: "CANCELLED" },
  { labelKey: "display.status.expired", value: "EXPIRED" },
];

export function SubscriptionsFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: SubscriptionsFiltersProps) {
  const pricingModel = useTranslations("pricingModel");
  const filters = useTranslations("filters");
  const common = useTranslations("common");
  const hasActiveFilters = search.trim() || status !== "ALL";

  const handleReset = () => {
    onSearchChange("");
    onStatusChange("ALL");
  };

  return (
    <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex w-full gap-2 overflow-x-auto rounded-lg bg-gray-100 p-1 xl:w-fit">
          {statusOptions.map((option) => {
            const isActive = status === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onStatusChange(option.value)}
                className={`
                  h-10 shrink-0 rounded-md px-5 text-sm font-semibold transition
                  ${
                    isActive
                      ? "bg-white text-primary shadow-sm"
                      : "text-gray hover:text-primary"
                  }
                `}
              >
                {pricingModel(option.labelKey)}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray"
            />

            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={filters("searchSubscriptionsPlaceholder")}
              className="
                h-10 w-full rounded-lg border border-transparent bg-gray-100
                pl-9 pr-3 text-sm text-dark outline-none transition
                placeholder:text-gray focus:border-primary focus:bg-white
                sm:w-[260px]
              "
            />
          </div>

          <button
            type="button"
            className="
              inline-flex h-10 w-10 items-center justify-center rounded-lg
              bg-gray-100 text-gray transition hover:bg-red-50 hover:text-primary
            "
            title={filters("filter")}
          >
            <SlidersHorizontal size={18} />
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="
                inline-flex h-10 items-center justify-center gap-2 rounded-lg
                border border-gray-100 bg-white px-4 text-sm font-semibold text-gray
                transition hover:border-primary hover:bg-red-50 hover:text-primary
              "
            >
              <X size={15} />
              {common("reset")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
