"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";

type BillingModelFilter = "ALL" | "COMMISSION" | "PLAN" | "HYBRID";
type StatusFilter = "ACTIVE" | "ARCHIVED";

type PlansListingFiltersProps = {
  search: string;
  status: StatusFilter;
  billingModel: BillingModelFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onBillingModelChange: (value: BillingModelFilter) => void;
};

export function PlansListingFilters({
  search,
  status,
  billingModel,
  onSearchChange,
  onStatusChange,
  onBillingModelChange,
}: PlansListingFiltersProps) {
  const pricingModel = useTranslations("pricingModel");
  const filters = useTranslations("filters");

  return (
    <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="inline-flex w-fit rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => onStatusChange("ACTIVE")}
            className={`
              h-10 rounded-md px-7 text-sm font-semibold transition
              ${
                status === "ACTIVE"
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray hover:text-primary"
              }
            `}
          >
            {pricingModel("display.status.active")}
          </button>

          <button
            type="button"
            onClick={() => onStatusChange("ARCHIVED")}
            className={`
              h-10 rounded-md px-7 text-sm font-semibold transition
              ${
                status === "ARCHIVED"
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray hover:text-primary"
              }
            `}
          >
            {pricingModel("display.status.archived")}
          </button>
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
              placeholder={filters("searchPlansPlaceholder")}
              className="
                h-10 w-full rounded-lg border border-transparent bg-gray-100
                pl-9 pr-3 text-sm text-dark outline-none transition
                placeholder:text-gray focus:border-primary focus:bg-white
                sm:w-[230px]
              "
            />
          </div>

          <select
            value={billingModel}
            onChange={(event) =>
              onBillingModelChange(event.target.value as BillingModelFilter)
            }
            className="
              h-10 rounded-lg border border-transparent bg-gray-100 px-4
              text-sm font-semibold text-dark outline-none transition
              focus:border-primary focus:bg-white
            "
          >
            <option value="ALL">{filters("pricingTypeAll")}</option>
            <option value="HYBRID">
              {pricingModel("display.pricingModels.hybrid")}
            </option>
            <option value="PLAN">
              {pricingModel("display.pricingModels.plan")}
            </option>
            <option value="COMMISSION">
              {pricingModel("display.pricingModels.commission")}
            </option>
          </select>

          <button
            type="button"
            className="
              inline-flex h-10 w-10 items-center justify-center rounded-lg
              bg-gray-100 text-gray transition hover:bg-red-50 hover:text-primary
            "
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
