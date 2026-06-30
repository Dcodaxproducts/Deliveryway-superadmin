import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import {
  exportCustomersReport,
  exportMenuReport,
  exportOrdersReport,
  FinancialReportParams,
  getAdminReportInvoiceDetails,
  getAdminReportInvoices,
  getFinancialReport,
  getOrdersReport,
  OrdersReportParams,
  AdminInvoicesParams,
  AdminInvoiceDetailsParams,
  MenuExportReportParams,
  OrdersExportReportParams,
  CustomersExportReportParams,
  CsvExportResponse,
  downloadAdminReportInvoicePdf,
  SendAdminInvoiceEmailParams,
  sendAdminInvoiceEmail,
} from "@/services/reports";

/**
 * ==============================
 * HELPERS
 * ==============================
 */

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

const getCsvExportBlob = (response: CsvExportResponse) => {
  const content = response?.data?.content || "";
  const mimeType = response?.data?.mimeType || "text/csv;charset=utf-8";

  /**
   * BOM helps Excel read CSV encoding correctly.
   */
  return new Blob([`\uFEFF${content}`], {
    type: mimeType.includes("charset") ? mimeType : `${mimeType};charset=utf-8`,
  });
};

const downloadCsvExportResponse = (
  response: CsvExportResponse,
  fallbackFileName: string
) => {
  const fileName = response?.data?.fileName || fallbackFileName;
  const blob = getCsvExportBlob(response);

  downloadBlobFile(blob, fileName);
};

const getExportRowCountText = (
  response: CsvExportResponse,
  toasts: ReturnType<typeof useTranslations>
) => {
  const rowCount = response?.data?.rowCount;

  if (typeof rowCount !== "number") return "";

  return ` (${toasts("rowsCount", { count: rowCount })})`;
};

const getErrorMessage = (err: any, fallback: string) => {
  return err?.response?.data?.message || err?.message || fallback;
};

/**
 * ==============================
 * REPORT SUMMARY HOOKS
 * ==============================
 */

export const useGetOrdersReport = (params?: OrdersReportParams) => {
  return useQuery({
    queryKey: [
      "reports",
      "orders",
      params?.restaurantId,
      params?.branchId,
      params?.fromDate,
      params?.toDate,
      params?.status,
      params?.orderType,
      params?.paymentStatus,
      params?.kind,
    ],
    queryFn: () => getOrdersReport(params),
  });
};

export const useGetFinancialReport = (params?: FinancialReportParams) => {
  return useQuery({
    queryKey: [
      "reports",
      "financial",
      params?.restaurantId,
      params?.branchId,
      params?.fromDate,
      params?.toDate,
    ],
    queryFn: () => getFinancialReport(params),
  });
};

/**
 * ==============================
 * INVOICE REPORT HOOKS
 * ==============================
 */

export const useGetAdminReportInvoices = (params?: AdminInvoicesParams) => {
  return useQuery({
    queryKey: [
      "reports",
      "invoices",
      params?.restaurantId,
      params?.branchId,
      params?.fromDate,
      params?.toDate,
      params?.status,
      params?.orderType,
      params?.paymentStatus,
      params?.kind,
    ],
    queryFn: () => getAdminReportInvoices(params),
  });
};

export const useGetAdminReportInvoiceDetails = (
  params?: AdminInvoiceDetailsParams
) => {
  return useQuery({
    queryKey: [
      "reports",
      "invoice-details",
      params?.orderId,
      params?.restaurantId,
      params?.branchId,
    ],
    queryFn: () =>
      getAdminReportInvoiceDetails(params as AdminInvoiceDetailsParams),
    enabled: Boolean(params?.orderId),
  });
};

/**
 * ==============================
 * EXPORT HOOKS
 * ==============================
 */

export const useExportMenuReport = () => {
  const toasts = useTranslations("toasts");

  return useMutation({
    mutationFn: (params?: MenuExportReportParams) => exportMenuReport(params),

    onSuccess: (response) => {
      downloadCsvExportResponse(response, "menu-report.csv");

      toast.success(
        `${toasts("menuReportExported")}${getExportRowCountText(response, toasts)}`
      );
    },

    onError: (err: any) => {
      toast.error(getErrorMessage(err, toasts("menuReportExportFailed")));
    },
  });
};

export const useExportOrdersReport = () => {
  const toasts = useTranslations("toasts");

  return useMutation({
    mutationFn: (params?: OrdersExportReportParams) =>
      exportOrdersReport(params),

    onSuccess: (response) => {
      downloadCsvExportResponse(response, "orders-report.csv");

      toast.success(
        `${toasts("ordersReportExported")}${getExportRowCountText(response, toasts)}`
      );
    },

    onError: (err: any) => {
      toast.error(getErrorMessage(err, toasts("ordersReportExportFailed")));
    },
  });
};

export const useExportCustomersReport = () => {
  const toasts = useTranslations("toasts");

  return useMutation({
    mutationFn: (params?: CustomersExportReportParams) =>
      exportCustomersReport(params),

    onSuccess: (response) => {
      downloadCsvExportResponse(response, "customers-report.csv");

      toast.success(
        `${toasts("customersReportExported")}${getExportRowCountText(
          response,
          toasts
        )}`
      );
    },

    onError: (err: any) => {
      toast.error(getErrorMessage(err, toasts("customersReportExportFailed")));
    },
  });
};


export const useSendAdminInvoiceEmail = () => {
  const toasts = useTranslations("toasts");

  return useMutation({
    mutationFn: (params: SendAdminInvoiceEmailParams) =>
      sendAdminInvoiceEmail(params),

    onSuccess: (response) => {
      toast.success(
        response?.message || toasts("invoiceEmailSent")
      );
    },

    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || toasts("invoiceEmailSendFailed")
      );
    },
  });
};

export const useDownloadAdminReportInvoicePdf = () => {
  const toasts = useTranslations("toasts");

  return useMutation({
    mutationFn: (params: AdminInvoiceDetailsParams) =>
      downloadAdminReportInvoicePdf(params),

    onSuccess: (blob, params) => {
      downloadBlobFile(blob, `order-invoice-${params.orderId}.pdf`);
      toast.success(toasts("invoiceDownloaded"));
    },

    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || toasts("invoiceDownloadFailed")
      );
    },
  });
};
