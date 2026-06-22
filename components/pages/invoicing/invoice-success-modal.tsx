"use client";

import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { InvoiceGenerationPayload } from "./generate-invoice-modal";

type InvoiceSuccessModalProps = {
  open: boolean;
  payload: InvoiceGenerationPayload | null;
  onOpenChange: (open: boolean) => void;
  onGenerateMore: () => void;
};

const formatMoney = (value: number, currency = "PKR") => {
  const numeric = Number(value || 0);

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

const formatDate = (value?: string) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export function InvoiceSuccessModal({
  open,
  payload,
  onOpenChange,
  onGenerateMore,
}: InvoiceSuccessModalProps) {
  const invoicing = useTranslations("invoicing");

  const currency = "PKR";

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent
        className="max-h-[92vh] w-[calc(100vw-24px)] max-w-[980px] overflow-hidden rounded-[24px] border-0 bg-[#F7F7F7] p-0 shadow-2xl sm:w-[calc(100vw-48px)]"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b border-gray-200 px-6 py-6 sm:px-8">
          <DialogTitle className="text-[26px] font-semibold text-gray-700">
            {invoicing("invoiceGeneratedSuccessfully")}
          </DialogTitle>

          <p className="text-sm text-gray-500">
            {invoicing("invoiceGeneratedDescription")}
          </p>
        </DialogHeader>

        <div className="max-h-[calc(92vh-110px)] overflow-y-auto p-5 sm:p-8">
          <div className="rounded-[14px] bg-white px-5 pb-12 pt-10 text-center sm:px-8 sm:pb-14">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green">
              <CheckCircle2 size={48} />
            </div>

            <h3 className="text-[24px] font-semibold text-gray-950">
              {invoicing("invoicesGeneratedSuccessfully")}
            </h3>

            <p className="mx-auto mt-4 max-w-[520px] text-base leading-7 text-gray-500">
              {invoicing("generatedForCycle", {
                count: payload?.invoices.length || 0,
                cycle: payload?.billingCycleLabel || "-",
              })}
            </p>

            <div className="mx-auto mt-7 max-w-[420px] rounded-[12px] border border-gray-200 bg-[#F9FAFB] p-5 text-left">
              <InfoRow
                label={invoicing("totalInvoices")}
                value={String(payload?.invoices.length || 0)}
              />

              <InfoRow
                label={invoicing("billingCycleLabel")}
                value={payload?.billingCycleLabel || "-"}
              />

              <InfoRow label={invoicing("dueDateLabel")} value={formatDate(payload?.dueDate)} />

              <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
                <span className="font-semibold text-gray-900">
                  {invoicing("totalAmountColon")}
                </span>

                <span className="text-lg font-bold text-green">
                  {formatMoney(payload?.totalAmount || 0, currency)}
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 pb-2 sm:flex-row sm:pb-0">
              <Button
                type="button"
                variant="outline"
                onClick={onGenerateMore}
                className="h-[44px] rounded-[12px] border-primary px-6 text-primary hover:bg-primary/5"
              >
                {invoicing("generateMore")}
              </Button>

            <Button
  type="button"
  variant="primary"
  onClick={() => onOpenChange(false)}
  className="h-[44px] rounded-[12px] px-6"
>
  {invoicing("backToDashboard")}
</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-4">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}
