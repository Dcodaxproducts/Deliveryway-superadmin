import api from "@/lib/axios";

export type GeneratedInvoiceKind =
  | "ORDER"
  | "WEEKLY_PAYOUT"
  | "MONTHLY_SUBSCRIPTION"
  | "SUBSCRIPTION"
  | "PAYOUT"
  | string;

export type GeneratedInvoiceStatus =
  | "DRAFT"
  | "GENERATED"
  | "SENT"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "VOID"
  | string;

export type GeneratedInvoicesParams = {
  page?: number;
  limit?: number;
  kind?: GeneratedInvoiceKind;
  status?: GeneratedInvoiceStatus;
  fromDate?: string;
  toDate?: string;
  restaurantId?: string;
  branchId?: string;
};

export type GeneratedInvoiceSnapshot = {
  id?: string | null;
  name?: string | null;
  email?: string | null;
};

export type GeneratedInvoicePeriod = {
  from?: string | null;
  to?: string | null;
  start?: string | null;
  end?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

export type GeneratedInvoiceLastSent = {
  at?: string | null;
  sentAt?: string | null;
  email?: string | null;
  to?: string | null;
  by?: string | null;
};

export type GeneratedInvoice = {
  id: string;
  invoiceNumber?: string | null;
  kind?: GeneratedInvoiceKind | null;
  status?: GeneratedInvoiceStatus | null;
  tenantSnapshot?: GeneratedInvoiceSnapshot | null;
  restaurantSnapshot?: GeneratedInvoiceSnapshot | null;
  branchSnapshot?: GeneratedInvoiceSnapshot | null;
  tenant?: GeneratedInvoiceSnapshot | null;
  restaurant?: GeneratedInvoiceSnapshot | null;
  branch?: GeneratedInvoiceSnapshot | null;
  orderId?: string | null;
  subscriptionId?: string | null;
  linkedOrderId?: string | null;
  linkedSubscriptionId?: string | null;
  period?: GeneratedInvoicePeriod | null;
  periodFrom?: string | null;
  periodTo?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  currency?: string | null;
  totalAmount?: string | number | null;
  amount?: string | number | null;
  sentCount?: string | number | null;
  downloadCount?: string | number | null;
  downloadsCount?: string | number | null;
  lastSent?: GeneratedInvoiceLastSent | null;
  lastSentAt?: string | null;
  lastSentEmail?: string | null;
  documentType?: string | null;
  mimeType?: string | null;
  createdAt?: string | null;
  generatedAt?: string | null;
};

export type GeneratedInvoicesResponse = {
  success?: boolean;
  data?: GeneratedInvoice[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
  };
  message?: string;
};

export const getGeneratedInvoices = async (
  params?: GeneratedInvoicesParams,
): Promise<GeneratedInvoicesResponse> => {
  const { data } = await api.get("/admin/reports/generated-invoices", {
    params,
  });

  return data;
};
