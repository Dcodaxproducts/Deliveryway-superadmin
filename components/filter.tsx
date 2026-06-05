"use client";

import { Search, RotateCcw, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ExportSection from "./export";
import AsyncSelect from "./ui/AsyncSelect";

const ORDER_STATUSES = [
  { labelKey: "orderStatusPlaced", value: "PLACED" },
  { labelKey: "orderStatusConfirmed", value: "CONFIRMED" },
  { labelKey: "orderStatusPreparing", value: "PREPARING" },
  { labelKey: "orderStatusReadyForPickup", value: "READY_FOR_PICKUP" },
  { labelKey: "orderStatusPickedUp", value: "PICKED_UP" },
  { labelKey: "orderStatusReadyToServe", value: "READY_TO_SERVE" },
  { labelKey: "orderStatusServed", value: "SERVED" },
  { labelKey: "orderStatusOutForDelivery", value: "OUT_FOR_DELIVERY" },
  { labelKey: "orderStatusDelivered", value: "DELIVERED" },
  { labelKey: "orderStatusCancelled", value: "CANCELLED" },
  { labelKey: "orderStatusRejected", value: "REJECTED" },
];

const ORDER_TYPES = [
  { labelKey: "orderTypeDelivery", value: "DELIVERY" },
  { labelKey: "orderTypeTakeaway", value: "TAKEAWAY" },
  { labelKey: "orderTypeDineIn", value: "DINE_IN" },
];

const PAYMENT_STATUSES = [
  { labelKey: "paymentStatusPending", value: "PENDING" },
  { labelKey: "paymentStatusPaid", value: "PAID" },
  { labelKey: "paymentStatusFailed", value: "FAILED" },
  { labelKey: "paymentStatusCancelled", value: "CANCELLED" },
  { labelKey: "paymentStatusRefunded", value: "REFUNDED" },
];

const ORDER_KINDS = [
  { labelKey: "regularOrders", value: "order" },
  { labelKey: "groupCheckoutOrders", value: "group-orders" },
];

type RestaurantFetchOptions = (params: {
  search: string;
  page: number;
}) => Promise<{ data: any[]; meta?: any }>;

type Props = {
  type?: string;

  search?: string;
  onSearchChange?: (val: string) => void;

  restaurant?: any;
  onRestaurantChange?: (val: any) => void;
  fetchRestaurantOptions?: RestaurantFetchOptions;

  status?: string;
  onStatusChange?: (val: string) => void;

  orderType?: string;
  onOrderTypeChange?: (val: string) => void;

  paymentStatus?: string;
  onPaymentStatusChange?: (val: string) => void;

  kind?: string;
  onKindChange?: (val: string) => void;

  fromDate?: string;
  onFromDateChange?: (val: string) => void;

  toDate?: string;
  onToDateChange?: (val: string) => void;

  onReset?: () => void;
};

const normalizeSelectValue = (value?: string) => {
  return value && value.length > 0 ? value : "ALL";
};

const denormalizeSelectValue = (value: string) => {
  return value === "ALL" ? "" : value;
};

export default function Filters({
  type,
  search,
  onSearchChange,
  restaurant,
  onRestaurantChange,
  fetchRestaurantOptions,
  status,
  onStatusChange,
  orderType,
  onOrderTypeChange,
  paymentStatus,
  onPaymentStatusChange,
  kind,
  onKindChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  onReset,
}: Props) {
  const common = useTranslations("common");
  const filters = useTranslations("filters");
  const isOrders = type === "orders";
  const isInvoices = type === "invoices";

  const showOrderFilters = isOrders || isInvoices;
  const showResetButton = isOrders || isInvoices;
  const showExportSection = type !== "restaurant" && !isOrders && !isInvoices;

  return (
    <div className="space-y-[30px] rounded-[14px] bg-white p-4 lg:border-2 lg:border-[#F3F4F6] lg:p-[24px]">
      <div className="flex flex-col gap-[20px] md:flex-row md:flex-wrap md:items-end">
        <div className="min-w-[280px] flex-1 space-y-[6px]">
          <Label>{common("search")}</Label>

          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />

            <Input
              placeholder={
                isOrders
                  ? filters("searchOrdersPlaceholder")
                  : isInvoices
                  ? filters("searchInvoicesPlaceholder")
                  : filters("searchRestaurantPlaceholder")
              }
              className="pl-10 border-[#BBBBBB] focus-visible:ring-primary h-11"
              value={search ?? ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </div>
        </div>

        {isOrders && fetchRestaurantOptions ? (
          <div className="w-full space-y-[6px] md:w-[260px]">
            <Label>{filters("restaurant")}</Label>

            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <AsyncSelect
                  value={restaurant}
                  onChange={onRestaurantChange || (() => {})}
                  placeholder={filters("selectRestaurant")}
                  fetchOptions={fetchRestaurantOptions}
                  labelKey="name"
                  valueKey="id"
                />
              </div>

              {restaurant ? (
                <button
                  type="button"
                  onClick={() => onRestaurantChange?.(null)}
                  className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-lg border border-[#BBBBBB] text-gray-400 transition hover:border-primary hover:text-primary"
                  aria-label={filters("clearRestaurant")}
                >
                  <X size={16} />
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="w-full space-y-[6px] md:w-[210px]">
          <Label>{common("status")}</Label>

          <Select
            value={normalizeSelectValue(status)}
            onValueChange={(val) =>
              onStatusChange?.(denormalizeSelectValue(val))
            
            }
            
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder={filters("selectStatus")} />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ALL">{filters("allStatuses")}</SelectItem>

              {showOrderFilters ? (
                ORDER_STATUSES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {filters(item.labelKey)}
                  </SelectItem>
                ))
              ) : (
                <>
                  <SelectItem value="active">{common("active")}</SelectItem>
                  <SelectItem value="disabled">{common("disabled")}</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {showOrderFilters ? (
          <>
            <div className="w-full space-y-[6px] md:w-[180px]">
              <Label>{filters("orderType")}</Label>

              <Select
                value={normalizeSelectValue(orderType)}
                onValueChange={(val) =>
                  onOrderTypeChange?.(denormalizeSelectValue(val))
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={filters("orderType")} />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="ALL">{filters("allTypes")}</SelectItem>
                  {ORDER_TYPES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {filters(item.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full space-y-[6px] md:w-[210px]">
              <Label>{filters("kind")}</Label>

              <Select
                value={normalizeSelectValue(kind)}
                onValueChange={(val) =>
                  onKindChange?.(denormalizeSelectValue(val))
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={filters("kind")} />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="ALL">{filters("allKinds")}</SelectItem>
                  {ORDER_KINDS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {filters(item.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        ) : null}

        {isInvoices ? (
          <>
            <div className="w-full space-y-[6px] md:w-[190px]">
              <Label>{filters("payment")}</Label>

              <Select
                value={normalizeSelectValue(paymentStatus)}
                onValueChange={(val) =>
                  onPaymentStatusChange?.(denormalizeSelectValue(val))
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={filters("paymentStatus")} />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="ALL">{filters("allPayments")}</SelectItem>
                  {PAYMENT_STATUSES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {filters(item.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full space-y-[6px] md:w-[170px]">
              <Label>{filters("fromDate")}</Label>

              <Input
                type="date"
                value={fromDate || ""}
                onChange={(e) => onFromDateChange?.(e.target.value)}
                className="border-[#BBBBBB] focus-visible:ring-primary h-11"
              />
            </div>

            <div className="w-full space-y-[6px] md:w-[170px]">
              <Label>{filters("toDate")}</Label>

              <Input
                type="date"
                value={toDate || ""}
                onChange={(e) => onToDateChange?.(e.target.value)}
                className="border-[#BBBBBB] focus-visible:ring-primary h-11"
              />
            </div>
          </>
        ) : null}

        {showResetButton ? (
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="h-[44px] rounded-[12px]"
          >
            <RotateCcw size={16} className="mr-2" />
            {common("reset")}
          </Button>
        ) : null}
      </div>

      {showExportSection ? (
        <div>
          <ExportSection />
        </div>
      ) : null}
    </div>
  );
}
