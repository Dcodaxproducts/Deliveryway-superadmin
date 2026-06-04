"use client";

import { Search, RotateCcw, X } from "lucide-react";

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
  { label: "Placed", value: "PLACED" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Preparing", value: "PREPARING" },
  { label: "Ready for Pickup", value: "READY_FOR_PICKUP" },
  { label: "Picked Up", value: "PICKED_UP" },
  { label: "Ready to Serve", value: "READY_TO_SERVE" },
  { label: "Served", value: "SERVED" },
  { label: "Out for Delivery", value: "OUT_FOR_DELIVERY" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Rejected", value: "REJECTED" },
];

const ORDER_TYPES = [
  { label: "Delivery", value: "DELIVERY" },
  { label: "Takeaway", value: "TAKEAWAY" },
  { label: "Dine In", value: "DINE_IN" },
];

const PAYMENT_STATUSES = [
  { label: "Pending", value: "PENDING" },
  { label: "Paid", value: "PAID" },
  { label: "Failed", value: "FAILED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Refunded", value: "REFUNDED" },
];

const ORDER_KINDS = [
  { label: "Regular Orders", value: "order" },
  { label: "Group Checkout Orders", value: "group-orders" },
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
  const isOrders = type === "orders";
  const isInvoices = type === "invoices";

  const showOrderFilters = isOrders || isInvoices;
  const showResetButton = isOrders || isInvoices;
  const showExportSection = type !== "restaurant" && !isOrders && !isInvoices;

  return (
    <div className="space-y-[30px] rounded-[14px] bg-white p-4 lg:border-2 lg:border-[#F3F4F6] lg:p-[24px]">
      <div className="flex flex-col gap-[20px] md:flex-row md:flex-wrap md:items-end">
        <div className="min-w-[280px] flex-1 space-y-[6px]">
          <Label>Search</Label>

          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />

            <Input
              placeholder={
                isOrders
                  ? "Search by name, email or order ID"
                  : isInvoices
                  ? "Search invoice, restaurant, customer or order ID"
                  : "Search by restaurant name or domain"
              }
              className="pl-10 border-[#BBBBBB] focus-visible:ring-primary h-11"
              value={search ?? ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </div>
        </div>

        {isOrders && fetchRestaurantOptions ? (
          <div className="w-full space-y-[6px] md:w-[260px]">
            <Label>Restaurant</Label>

            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <AsyncSelect
                  value={restaurant}
                  onChange={onRestaurantChange || (() => {})}
                  placeholder="Select restaurant"
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
                  aria-label="Clear restaurant"
                >
                  <X size={16} />
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="w-full space-y-[6px] md:w-[210px]">
          <Label>Status</Label>

          <Select
            value={normalizeSelectValue(status)}
            onValueChange={(val) =>
              onStatusChange?.(denormalizeSelectValue(val))
            
            }
            
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>

              {showOrderFilters ? (
                ORDER_STATUSES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))
              ) : (
                <>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {showOrderFilters ? (
          <>
            <div className="w-full space-y-[6px] md:w-[180px]">
              <Label>Order Type</Label>

              <Select
                value={normalizeSelectValue(orderType)}
                onValueChange={(val) =>
                  onOrderTypeChange?.(denormalizeSelectValue(val))
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Order Type" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  {ORDER_TYPES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full space-y-[6px] md:w-[210px]">
              <Label>Kind</Label>

              <Select
                value={normalizeSelectValue(kind)}
                onValueChange={(val) =>
                  onKindChange?.(denormalizeSelectValue(val))
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Kind" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="ALL">All Kinds</SelectItem>
                  {ORDER_KINDS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
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
              <Label>Payment</Label>

              <Select
                value={normalizeSelectValue(paymentStatus)}
                onValueChange={(val) =>
                  onPaymentStatusChange?.(denormalizeSelectValue(val))
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="ALL">All Payments</SelectItem>
                  {PAYMENT_STATUSES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full space-y-[6px] md:w-[170px]">
              <Label>From Date</Label>

              <Input
                type="date"
                value={fromDate || ""}
                onChange={(e) => onFromDateChange?.(e.target.value)}
                className="border-[#BBBBBB] focus-visible:ring-primary h-11"
              />
            </div>

            <div className="w-full space-y-[6px] md:w-[170px]">
              <Label>To Date</Label>

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
            Reset
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