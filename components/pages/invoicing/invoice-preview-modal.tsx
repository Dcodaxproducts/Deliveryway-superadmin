"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Download, Loader2, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { InvoiceGenerationPayload } from "./generate-invoice-modal";
import type { AdminInvoice } from "@/services/reports";
import { useGlobalCurrency } from "@/hooks/useGlobalCurrency";
import { formatMoney } from "@/lib/currency";

type InvoicePreviewModalProps = {
  open: boolean;
  payload: InvoiceGenerationPayload | null;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
  onGenerate: () => void;
};

const formatAmountPlain = (value: number) => {
  return Number(value || 0).toFixed(2);
};

const formatSignedAmountPlain = (value: number) => {
  const numeric = Number(value || 0);

  if (numeric > 0) return `+${numeric.toFixed(2)}`;
  if (numeric < 0) return `-${Math.abs(numeric).toFixed(2)}`;

  return "0.00";
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toISOString();
};

const formatDate = (value?: string | null) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toISOString().slice(0, 10);
};

const calculateDeductions = (invoice: AdminInvoice) => {
  return (
    Number(invoice.discountAmount || 0) +
    Number(invoice.walletAppliedAmount || 0) +
    Number(invoice.loyaltyDiscountAmount || 0)
  );
};

const getPayloadBaseTotal = (payload: InvoiceGenerationPayload) => {
  return (
    payload.baseTotalAmount ??
    payload.invoices.reduce(
      (sum, invoice) => sum + Number(invoice.totalAmount || 0),
      0
    )
  );
};

const sanitizeFileName = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const getCustomerName = (invoice: AdminInvoice) => {
  return (
    invoice.customer?.name ||
    `${invoice.customer?.firstName || ""} ${
      invoice.customer?.lastName || ""
    }`.trim() ||
    "N/A"
  );
};

const buildInvoiceText = (payload: InvoiceGenerationPayload, currency: string) => {
  const baseTotalAmount = getPayloadBaseTotal(payload);
  const additionalCharges = Number(payload.additionalCharges || 0);
  const finalTotalAmount = Number(
    payload.totalAmount ?? baseTotalAmount + additionalCharges
  );

  const lines: string[] = [];

  payload.invoices.forEach((invoice, invoiceIndex) => {
    if (invoiceIndex > 0) {
      lines.push("");
      lines.push("------------------------------------------------------------");
      lines.push("");
    }

    lines.push(`Invoice ${invoice.invoiceNumber || "N/A"}`);
    lines.push(`Order ID: ${invoice.orderId || "N/A"}`);
    lines.push(`Restaurant: ${invoice.restaurant?.name || "N/A"}`);
    lines.push(`Branch: ${invoice.branch?.name || "N/A"}`);
    lines.push(`Customer: ${getCustomerName(invoice)}`);
    lines.push(`Email: ${invoice.customer?.email || "N/A"}`);
    lines.push(`Issued At: ${formatDateTime(invoice.issuedAt)}`);
    lines.push(`Paid At: ${formatDateTime(invoice.paidAt)}`);
    lines.push(`Order Type: ${invoice.orderType || "N/A"}`);
    lines.push(`Order Status: ${invoice.orderStatus || "N/A"}`);
    lines.push(`Payment Status: ${invoice.paymentStatus || "N/A"}`);
    lines.push(`Payment Method: ${invoice.paymentMethod || "N/A"}`);
    lines.push("");
    lines.push("Items");

    if (invoice.items?.length) {
      invoice.items.forEach((item) => {
        const name = item.menuItemName || "Item";
        const variation = item.variationName ? ` (${item.variationName})` : "";
        const quantity = Number(item.quantity || 0);
        const unitPrice = Number(item.unitPrice || 0);
        const lineTotal = Number(item.lineTotal || 0);

        lines.push(
          `${name}${variation} x${quantity} @ ${formatAmountPlain(
            unitPrice
          )} = ${formatAmountPlain(lineTotal)}`
        );

        if (Array.isArray(item.snapshotModifiers)) {
          item.snapshotModifiers.forEach((modifier) => {
            const modifierRecord =
              modifier && typeof modifier === "object"
                ? (modifier as Record<string, unknown>)
                : {};
            const modifierName = String(modifierRecord.name || "Modifier");
            const modifierQty = Number(modifierRecord.quantity || 1);
            const modifierUnitPrice = Number(modifierRecord.unitPrice || 0);

            lines.push(
              `  + ${modifierName} x${modifierQty} @ ${formatAmountPlain(
                modifierUnitPrice
              )}`
            );
          });
        }

        if (item.note) {
          lines.push(`  Note: ${item.note}`);
        }
      });
    } else {
      lines.push(`Items Count: ${invoice.itemsCount || 0}`);
    }

    lines.push("");
    lines.push(`Subtotal: ${formatAmountPlain(invoice.subtotal || 0)}`);
    lines.push(`Tax: ${formatAmountPlain(invoice.taxAmount || 0)}`);
    lines.push(`Delivery Fee: ${formatAmountPlain(invoice.deliveryFee || 0)}`);
    lines.push(`Discount: ${formatAmountPlain(invoice.discountAmount || 0)}`);
    lines.push(
      `Wallet Applied: ${formatAmountPlain(invoice.walletAppliedAmount || 0)}`
    );
    lines.push(
      `Loyalty Discount: ${formatAmountPlain(
        invoice.loyaltyDiscountAmount || 0
      )}`
    );

    lines.push(`Total: ${formatAmountPlain(invoice.totalAmount || 0)}`);
  });

  lines.push("");

  if (payload.invoices.length > 1 || additionalCharges !== 0) {
    lines.push("Billing Summary");
    lines.push(`Billing Cycle: ${payload.billingCycleLabel || "N/A"}`);
    lines.push(`Invoice Date: ${formatDate(payload.invoiceDate)}`);
    lines.push(`Due Date: ${formatDate(payload.dueDate)}`);
    lines.push(`Selected Invoices: ${payload.invoices.length}`);
    lines.push(`Base Total: ${formatAmountPlain(baseTotalAmount)}`);
    lines.push(`Additional Charges: ${formatSignedAmountPlain(additionalCharges)}`);
    lines.push(`Final Total: ${formatAmountPlain(finalTotalAmount)}`);
  }

  if (payload.message?.trim()) {
    lines.push("");
    lines.push("Message");
    lines.push(payload.message.trim());
  }

  lines.push("");
  lines.push(`Currency: ${currency}`);

  return lines.join("\n");
};

const buildInvoicePdf = (payload: InvoiceGenerationPayload, currency: string) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
    compress: true,
  });

  const invoiceText = buildInvoiceText(payload, currency);
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const marginX = 56;
  const marginTop = 64;
  const marginBottom = 48;
  const maxWidth = pageWidth - marginX * 2;
  const lineHeight = 15;

  doc.setProperties({
    title: `Invoice ${payload.billingCycleLabel || ""}`,
    subject: "Generated invoice",
    creator: "Invoicing Dashboard",
  });

  doc.setFont("courier", "normal");
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);

  const rawLines = invoiceText.split("\n");
  let y = marginTop;

  rawLines.forEach((line) => {
    const wrappedLines = doc.splitTextToSize(line || " ", maxWidth);

    wrappedLines.forEach((wrappedLine: string) => {
      if (y > pageHeight - marginBottom) {
        doc.addPage();
        doc.setFont("courier", "normal");
        doc.setFontSize(11);
        doc.setTextColor(17, 24, 39);
        y = marginTop;
      }

      doc.text(wrappedLine, marginX, y);
      y += lineHeight;
    });
  });

  return doc;
};

const getInvoicePdfFileName = (payload: InvoiceGenerationPayload) => {
  const firstInvoiceNumber = payload.invoices[0]?.invoiceNumber;

  if (firstInvoiceNumber && payload.invoices.length === 1) {
    return `${sanitizeFileName(firstInvoiceNumber)}.pdf`;
  }

  return `invoices-${sanitizeFileName(
    payload.billingCycleLabel || payload.billingCycle || "billing-cycle"
  )}.pdf`;
};

const downloadBlobFile = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
};

export function InvoicePreviewModal({
  open,
  payload,
  onOpenChange,
  onBack,
  onGenerate,
}: InvoicePreviewModalProps) {
  const invoicing = useTranslations("invoicing");
  const toasts = useTranslations("toasts");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSharingPdf, setIsSharingPdf] = useState(false);

  const currency = useGlobalCurrency();
  const invoiceText = useMemo(() => {
    return payload ? buildInvoiceText(payload, currency) : "";
  }, [currency, payload]);
  const baseTotalAmount = payload ? getPayloadBaseTotal(payload) : 0;
  const additionalCharges = Number(payload?.additionalCharges || 0);
  const finalTotalAmount = Number(
    payload?.totalAmount ?? baseTotalAmount + additionalCharges
  );

  const handleGenerateAndDownload = async () => {
    if (!payload || isGeneratingPdf) return;

    try {
      setIsGeneratingPdf(true);

      const doc = buildInvoicePdf(payload, currency);
      doc.save(getInvoicePdfFileName(payload));

      onGenerate();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShare = async () => {
    if (!payload || isSharingPdf) return;

    try {
      setIsSharingPdf(true);

      const doc = buildInvoicePdf(payload, currency);
      const blob = doc.output("blob");
      const fileName = getInvoicePdfFileName(payload);
      const file = new File([blob], fileName, {
        type: "application/pdf",
      });

      const shareData: ShareData = {
        title: "Invoice",
        text: "Invoice PDF",
        files: [file],
      };

      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        toast.success(toasts("invoiceShared"));
        return;
      }

      downloadBlobFile(blob, fileName);
      toast.info(toasts("invoiceShareFallback"));
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast.error(toasts("invoiceShareFailed"));
      }
    } finally {
      setIsSharingPdf(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent
        className="flex max-h-[92vh] w-[calc(100vw-24px)] max-w-[930px] flex-col overflow-hidden rounded-[24px] border-0 bg-[#F7F7F7] p-0 shadow-2xl sm:w-[calc(100vw-48px)]"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader className="shrink-0 border-b border-gray-200 px-6 py-6 sm:px-8">
          <DialogTitle className="text-[26px] font-semibold text-gray-950">
            {invoicing("invoicePreview")}
          </DialogTitle>
          <p className="text-sm text-gray-500">
            {invoicing("invoicePreviewDescription")}
          </p>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          {!payload ? (
            <div className="py-20 text-center text-gray-400">
              {invoicing("noInvoicePreview")}
            </div>
          ) : (
            <>
              <div className="rounded-[16px] border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-950">
                      {invoicing("invoicesSelected", {
                        count: payload.invoices.length,
                      })}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {invoicing("billingCycle")}: {payload.billingCycleLabel}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs text-gray-400">
                      {invoicing("finalTotal")}
                    </p>
                    <p className="text-lg font-bold text-green">
                      {formatMoney(finalTotalAmount, currency)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-[16px] border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4">
                  <h3 className="text-sm font-semibold text-gray-950">
                    {invoicing("receiptStylePreview")}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {invoicing("receiptStyleDescription")}
                  </p>
                </div>

                <div className="overflow-x-auto bg-white px-6 py-8 sm:px-10">
                  <pre className="min-h-[620px] whitespace-pre-wrap break-words font-mono text-[15px] leading-7 text-gray-950">
                    {invoiceText}
                  </pre>
                </div>
              </div>

              <div className="mt-5 rounded-[12px] border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={18}
                    className="mt-0.5 shrink-0 text-yellow-600"
                  />
                  <div>
                    <p className="text-sm font-semibold text-yellow-800">
                      {invoicing("importantNotice")}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-yellow-700">
                      {invoicing("importantNoticeDescription")}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="shrink-0 border-t border-gray-100 bg-white px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isGeneratingPdf || isSharingPdf}
              className="h-[44px] rounded-[12px]"
            >
              {invoicing("back")}
            </Button>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                type="button"
                variant="outline"
                disabled={!payload || isGeneratingPdf || isSharingPdf}
                onClick={handleShare}
                className="h-[52px] rounded-[14px] px-6 text-base font-semibold"
              >
                {isSharingPdf ? (
                  <>
                    <Loader2 size={17} className="mr-2 animate-spin" />
                    {invoicing("sharing")}
                  </>
                ) : (
                  <>
                    <Share2 size={17} className="mr-2" />
                    {invoicing("share")}
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="primary"
                disabled={!payload || isGeneratingPdf || isSharingPdf}
                onClick={handleGenerateAndDownload}
                className="h-[52px] rounded-[14px] px-8 text-lg font-semibold disabled:opacity-60"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 size={17} className="mr-2 animate-spin" />
                    {invoicing("generating")}
                  </>
                ) : (
                  <>
                    <Download size={17} className="mr-2" />
                    {invoicing("download")}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
