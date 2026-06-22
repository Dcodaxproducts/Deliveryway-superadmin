"use client";

import { useCallback, useMemo, useState } from "react";
import { Download, Loader2, Mail, ReceiptText } from "lucide-react";
import { useTranslations } from "next-intl";

import AsyncSelect from "@/components/ui/AsyncSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useDownloadWeeklyPayoutInvoicePdf,
  useFetchWeeklyPayoutInvoice,
  useSendWeeklyPayoutInvoiceEmail,
} from "@/hooks/usePackagePlans";
import { getRestaurants } from "@/services/restaurant";
import type {
  WeeklyPayoutInvoice,
  WeeklyPayoutInvoiceParams,
} from "@/services/packagePlans";

type RestaurantOption = {
  id: string;
  name?: string | null;
  email?: string | null;
  billingEmail?: string | null;
  restaurantName?: string | null;
};

const formatInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getDefaultRange = () => {
  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setDate(toDate.getDate() - 7);

  return {
    fromDate: formatInputDate(fromDate),
    toDate: formatInputDate(toDate),
  };
};

const toStartOfDayIso = (value: string) => {
  const date = new Date(`${value}T00:00:00.000Z`);

  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
};

const numberValue = (value?: string | number | null) => {
  const numeric = Number(value ?? 0);

  return Number.isFinite(numeric) ? numeric : 0;
};

const formatMoney = (value?: string | number | null, currency = "PKR") => {
  const numeric = numberValue(value);

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numeric);
  } catch {
    return `${currency} ${numeric.toFixed(2)}`;
  }
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const prettyLabel = (value?: string | null) => {
  if (!value) return "-";

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getRestaurantLabel = (restaurant: RestaurantOption) => {
  return (
    restaurant.name ||
    restaurant.restaurantName ||
    restaurant.billingEmail ||
    restaurant.email ||
    restaurant.id
  );
};

const getErrorMessage = (error: unknown) => {
  if (!error || typeof error !== "object") return null;

  const maybeError = error as {
    response?: { data?: { message?: string; error?: string } };
    message?: string;
  };

  return (
    maybeError.response?.data?.message ||
    maybeError.response?.data?.error ||
    maybeError.message ||
    null
  );
};

export function WeeklyPayoutInvoicePanel() {
  const invoicing = useTranslations("invoicing");
  const range = useMemo(() => getDefaultRange(), []);
  const [restaurantId, setRestaurantId] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<RestaurantOption | null>(null);
  const [fromDate, setFromDate] = useState(range.fromDate);
  const [toDate, setToDate] = useState(range.toDate);
  const [email, setEmail] = useState("");

  const fetchInvoice = useFetchWeeklyPayoutInvoice();
  const downloadInvoice = useDownloadWeeklyPayoutInvoicePdf();
  const sendInvoiceEmail = useSendWeeklyPayoutInvoiceEmail();

  const invoice = fetchInvoice.data?.data;
  const currency = invoice?.totals?.currency || "PKR";
  const canSubmit = Boolean(restaurantId && fromDate && toDate);

  const fetchRestaurantOptions = useCallback(
    async ({ search, page }: { search: string; page: number }) => {
      return getRestaurants({
        page,
        limit: 10,
        search: search.trim() || undefined,
        includeInactive: false,
      });
    },
    []
  );

  const buildParams = (): WeeklyPayoutInvoiceParams | null => {
    const fromDateIso = toStartOfDayIso(fromDate);
    const toDateIso = toStartOfDayIso(toDate);

    if (!restaurantId || !fromDateIso || !toDateIso) return null;

    return {
      restaurantId,
      fromDate: fromDateIso,
      toDate: toDateIso,
    };
  };

  const handlePreview = () => {
    const params = buildParams();
    if (!params) return;

    fetchInvoice.mutate(params);
  };

  const handleDownload = () => {
    const params = buildParams();
    if (!params) return;

    downloadInvoice.mutate(params);
  };

  const handleSendEmail = () => {
    const params = buildParams();
    if (!params) return;

    sendInvoiceEmail.mutate({
      ...params,
      email: email.trim() || undefined,
    });
  };

  return (
    <section className="rounded-[18px] border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ReceiptText size={20} />
          </div>
          <h3 className="text-lg font-semibold text-gray-950">
            {invoicing("weeklyPayoutInvoice")}
          </h3>
          <p className="mt-1 max-w-[640px] text-sm leading-6 text-gray-500">
            {invoicing("weeklyPayoutInvoiceDescription")}
          </p>
        </div>

        {invoice ? (
          <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-800">
            <p className="font-semibold">
              {invoice.invoiceNumber || invoicing("weeklyPayoutInvoiceReady")}
            </p>
            <p className="mt-1 text-xs text-green-700">
              {formatDate(invoice.period?.from)} - {formatDate(invoice.period?.to)}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.9fr)]">
        <div className="grid gap-4 rounded-2xl bg-gray-50 p-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              {invoicing("restaurant")}
            </label>
            <AsyncSelect
              value={selectedRestaurant}
              onChange={(restaurant: RestaurantOption | null) => {
                setSelectedRestaurant(restaurant);
                setRestaurantId(restaurant?.id || "");
              }}
              placeholder={invoicing("selectRestaurant")}
              searchPlaceholder={invoicing("searchRestaurant")}
              fetchOptions={fetchRestaurantOptions}
              getOptionLabel={getRestaurantLabel}
              renderOption={(restaurant: RestaurantOption) => (
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {getRestaurantLabel(restaurant)}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-gray-400">
                    {restaurant.billingEmail || restaurant.email || restaurant.id}
                  </p>
                </div>
              )}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              {invoicing("periodFrom")}
            </label>
            <Input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="h-11 rounded-xl bg-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              {invoicing("periodTo")}
            </label>
            <Input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="h-11 rounded-xl bg-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              {invoicing("emailOverride")}
            </label>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={invoicing("emailOverridePlaceholder")}
              className="h-11 rounded-xl bg-white"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-sm font-semibold text-gray-950">
            {invoicing("weeklyPayoutActions")}
          </p>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            {selectedRestaurant
              ? getRestaurantLabel(selectedRestaurant)
              : invoicing("selectRestaurantForPayout")}
          </p>

          <div className="mt-4 grid gap-2">
            <Button
              type="button"
              variant="primary"
              onClick={handlePreview}
              disabled={!canSubmit || fetchInvoice.isPending}
              className="h-11 rounded-xl"
            >
              {fetchInvoice.isPending ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <ReceiptText size={17} />
              )}
              {invoicing("previewPayoutInvoice")}
            </Button>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleDownload}
                disabled={!canSubmit || downloadInvoice.isPending}
                className="h-11 rounded-xl px-4"
              >
                {downloadInvoice.isPending ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Download size={17} />
                )}
                {invoicing("downloadPdf")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSendEmail}
                disabled={!canSubmit || sendInvoiceEmail.isPending}
                className="h-11 rounded-xl px-4"
              >
                {sendInvoiceEmail.isPending ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Mail size={17} />
                )}
                {invoicing("sendEmail")}
              </Button>
            </div>
          </div>

          {fetchInvoice.error ? (
            <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-primary">
              {getErrorMessage(fetchInvoice.error) ||
                invoicing("weeklyPayoutInvoiceFailed")}
            </p>
          ) : null}
        </div>
      </div>

      {invoice ? (
        <PayoutPreview invoice={invoice} currency={currency} />
      ) : null}
    </section>
  );
}

function PayoutPreview({
  invoice,
  currency,
}: {
  invoice: WeeklyPayoutInvoice;
  currency: string;
}) {
  const invoicing = useTranslations("invoicing");
  const visibleLineItems = invoice.lineItems?.slice(0, 6) ?? [];

  return (
    <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <div className="grid gap-3 md:grid-cols-4">
        <PayoutMetric
          label={invoicing("ordersCount")}
          value={String(numberValue(invoice.totals?.ordersCount))}
        />
        <PayoutMetric
          label={invoicing("grossPaidOrders")}
          value={formatMoney(invoice.totals?.grossAmount, currency)}
        />
        <PayoutMetric
          label={invoicing("platformCommission")}
          value={formatMoney(invoice.totals?.platformCommissionAmount, currency)}
        />
        <PayoutMetric
          label={invoicing("netRestaurantPayout")}
          value={formatMoney(invoice.totals?.restaurantPayoutAmount, currency)}
          emphasis
        />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <PayoutMetric
          label={invoicing("billingInterval")}
          value={prettyLabel(invoice.subscription?.billingInterval)}
        />
        <PayoutMetric
          label={invoicing("payoutCycle")}
          value={prettyLabel(invoice.subscription?.payoutCycle)}
        />
        <PayoutMetric
          label={invoicing("billingEmail")}
          value={invoice.restaurant?.billingEmail || "-"}
        />
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl bg-white">
        <div className="grid grid-cols-[minmax(0,1fr)_120px_140px_140px] gap-3 border-b border-gray-100 px-4 py-3 text-xs font-semibold uppercase text-gray-400">
          <span>{invoicing("orderId")}</span>
          <span className="text-right">{invoicing("gross")}</span>
          <span className="text-right">{invoicing("commission")}</span>
          <span className="text-right">{invoicing("payout")}</span>
        </div>

        {visibleLineItems.length > 0 ? (
          visibleLineItems.map((item, index) => (
            <div
              key={`${item.orderId || "order"}-${index}`}
              className="grid grid-cols-[minmax(0,1fr)_120px_140px_140px] gap-3 border-b border-gray-50 px-4 py-3 text-sm last:border-b-0"
            >
              <span className="truncate font-medium text-gray-900">
                {item.orderId || "-"}
              </span>
              <span className="text-right text-gray-600">
                {formatMoney(item.grossAmount, currency)}
              </span>
              <span className="text-right text-gray-600">
                {formatMoney(item.platformCommissionAmount, currency)}
              </span>
              <span className="text-right font-semibold text-green">
                {formatMoney(item.restaurantPayoutAmount, currency)}
              </span>
            </div>
          ))
        ) : (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            {invoicing("noPayoutLineItems")}
          </div>
        )}
      </div>
    </div>
  );
}

function PayoutMetric({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs font-semibold uppercase text-gray-400">{label}</p>
      <p
        className={`mt-2 truncate text-sm font-bold ${
          emphasis ? "text-green" : "text-gray-950"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
