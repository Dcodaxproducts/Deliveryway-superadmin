"use client";

import { useMemo, useState } from "react";
import { Download, Loader2, Mail, ReceiptText } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useGetPackageSubscriptionInvoice } from "@/hooks/usePackagePlans";
import type {
  PackageSubscription,
  PackageSubscriptionInvoice,
} from "@/services/packagePlans";

type SubscriptionInvoiceModalProps = {
  open: boolean;
  subscription: PackageSubscription | null;
  downloading: boolean;
  sending: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (subscriptionId: string) => void;
  onSendEmail: (subscriptionId: string, email?: string) => void;
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

const numberValue = (value?: string | number | null) => {
  const numeric = Number(value ?? 0);

  return Number.isFinite(numeric) ? numeric : 0;
};

const formatMoney = (value?: string | number | null, currency = "EUR") => {
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

const formatPercent = (value?: string | number | null) => {
  if (value === undefined || value === null || value === "") return "-";

  return `${numberValue(value).toFixed(2)}%`;
};

const getPlan = (invoice?: PackageSubscriptionInvoice | null) => {
  return invoice?.packagePlan || invoice?.plan || null;
};

export function SubscriptionInvoiceModal({
  open,
  subscription,
  downloading,
  sending,
  onOpenChange,
  onDownload,
  onSendEmail,
}: SubscriptionInvoiceModalProps) {
  const pricingModel = useTranslations("pricingModel");
  const [email, setEmail] = useState("");

  const { data, isLoading, isFetching } = useGetPackageSubscriptionInvoice(
    open ? subscription?.id : undefined
  );

  const invoice = data?.data;
  const plan = getPlan(invoice) || subscription?.packagePlan || null;
  const restaurant = invoice?.restaurant || subscription?.restaurant || null;
  const tenant = invoice?.tenant || subscription?.tenant || null;
  const currency = invoice?.currency || plan?.currency || "EUR";
  const loading = isLoading || isFetching;

  const rows = useMemo(() => {
    const servicePeriodStart =
      invoice?.servicePeriodStart || invoice?.periodStart || subscription?.startsAt;
    const servicePeriodEnd =
      invoice?.servicePeriodEnd || invoice?.periodEnd || subscription?.endsAt;
    const billingModel = invoice?.billingModel || plan?.billingModel;
    const billingInterval = invoice?.billingInterval || plan?.billingInterval;

    return [
      {
        label: pricingModel("invoice.servicePeriod"),
        value: `${formatDate(servicePeriodStart)} - ${formatDate(
          servicePeriodEnd
        )}`,
      },
      {
        label: pricingModel("invoice.billingModel"),
        value: prettyLabel(billingModel),
      },
      {
        label: pricingModel("invoice.billingInterval"),
        value: prettyLabel(billingInterval),
      },
      {
        label: pricingModel("invoice.paymentStatus"),
        value: prettyLabel(invoice?.paymentStatus || subscription?.paymentStatus),
      },
      {
        label: pricingModel("invoice.subscriptionStatus"),
        value: prettyLabel(
          invoice?.subscriptionStatus || invoice?.status || subscription?.status
        ),
      },
      {
        label: pricingModel("invoice.issuedAt"),
        value: formatDate(invoice?.issuedAt || invoice?.createdAt),
      },
    ];
  }, [invoice, plan, pricingModel, subscription]);

  const handleSend = () => {
    if (!subscription?.id) return;

    onSendEmail(subscription.id, email.trim() || undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent className="flex max-h-[92vh] w-[calc(100vw-24px)] max-w-[920px] flex-col overflow-hidden rounded-[24px] border-0 bg-[#F7F7F7] p-0 shadow-2xl sm:w-[calc(100vw-48px)]">
        <DialogHeader className="shrink-0 border-b border-gray-200 px-6 py-6 sm:px-8">
          <DialogTitle className="text-[26px] font-semibold text-gray-950">
            {pricingModel("invoice.title")}
          </DialogTitle>
          <p className="text-sm text-gray-500">
            {invoice?.invoiceNumber ||
              subscription?.id ||
              pricingModel("invoice.loading")}
          </p>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          {loading ? (
            <div className="flex min-h-[360px] items-center justify-center gap-2 text-gray-400">
              <Loader2 size={18} className="animate-spin" />
              {pricingModel("invoice.loadingDetails")}
            </div>
          ) : !subscription ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
              <ReceiptText size={34} className="mb-3 text-gray-300" />
              <p className="text-sm text-gray-400">
                {pricingModel("invoice.notFound")}
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-3">
                <SummaryCard
                  label={pricingModel("invoice.restaurant")}
                  value={restaurant?.name || subscription.restaurantId}
                />
                <SummaryCard
                  label={pricingModel("invoice.tenant")}
                  value={tenant?.name || subscription.tenantId}
                />
                <SummaryCard
                  label={pricingModel("invoice.packagePlan")}
                  value={plan?.name || subscription.packagePlanId}
                />
              </div>

              <div className="rounded-[14px] bg-white p-5">
                <h3 className="mb-4 text-base font-semibold text-gray-900">
                  {pricingModel("invoice.billingDetails")}
                </h3>

                <div className="grid gap-3 md:grid-cols-2">
                  {rows.map((row) => (
                    <DetailRow
                      key={row.label}
                      label={row.label}
                      value={row.value}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-[14px] bg-white p-5">
                <h3 className="mb-4 text-base font-semibold text-gray-900">
                  {pricingModel("invoice.commissionVat")}
                </h3>

                <div className="grid gap-3 md:grid-cols-3">
                  <SummaryCard
                    label={pricingModel("invoice.commissionRate")}
                    value={formatPercent(
                      invoice?.commissionPercentage ||
                        plan?.commissionPercentage
                    )}
                  />
                  <SummaryCard
                    label={pricingModel("invoice.commissionCap")}
                    value={formatMoney(
                      invoice?.commissionCapAmount ||
                        plan?.commissionCapAmount,
                      currency
                    )}
                  />
                  <SummaryCard
                    label={pricingModel("invoice.vatRate")}
                    value={formatPercent(
                      invoice?.vatPercentage || plan?.vatPercentage
                    )}
                  />
                </div>
              </div>

              <div className="rounded-[14px] bg-white p-5">
                <h3 className="mb-4 text-base font-semibold text-gray-900">
                  {pricingModel("invoice.totals")}
                </h3>

                <div className="space-y-3">
                  <AmountRow
                    label={pricingModel("invoice.subtotal")}
                    value={formatMoney(invoice?.subtotal || plan?.planPrice, currency)}
                  />
                  <AmountRow
                    label={pricingModel("invoice.vatAmount")}
                    value={formatMoney(
                      invoice?.vatAmount || invoice?.taxAmount,
                      currency
                    )}
                  />
                  <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                    <span className="text-base font-semibold text-gray-900">
                      {pricingModel("invoice.total")}
                    </span>
                    <span className="text-xl font-bold text-green">
                      {formatMoney(
                        invoice?.totalAmount || invoice?.amountDue,
                        currency
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-[14px] bg-white p-5">
                <h3 className="mb-4 text-base font-semibold text-gray-900">
                  {pricingModel("invoice.emailInvoice")}
                </h3>

                <div className="flex flex-col gap-3 md:flex-row">
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={pricingModel("invoice.emailPlaceholder")}
                    className="bg-white"
                  />
                  <Button
                    type="button"
                    onClick={handleSend}
                    disabled={sending}
                    className="h-[52px] shrink-0 rounded-lg px-5"
                  >
                    {sending ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Mail size={18} />
                    )}
                    {pricingModel("invoice.sendEmail")}
                  </Button>
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  {pricingModel("invoice.emailFallback")}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-3 border-t border-gray-200 bg-white px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {pricingModel("invoice.close")}
          </Button>
          <Button
            type="button"
            onClick={() => subscription?.id && onDownload(subscription.id)}
            disabled={!subscription?.id || downloading}
            className="h-[44px] px-6"
          >
            {downloading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Download size={18} />
            )}
            {pricingModel("invoice.downloadPdf")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="rounded-[14px] bg-white p-4">
      <p className="text-xs font-medium uppercase text-gray-400">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold text-gray-900">
        {value || "-"}
      </p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-gray-50 px-4 py-3">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-right text-sm font-semibold text-gray-900">
        {value}
      </span>
    </div>
  );
}

function AmountRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}
