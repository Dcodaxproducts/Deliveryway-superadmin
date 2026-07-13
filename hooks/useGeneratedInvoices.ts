import { useQuery } from "@tanstack/react-query";

import {
  GeneratedInvoicesParams,
  getGeneratedInvoices,
} from "@/services/generatedInvoices";

export const generatedInvoiceKeys = {
  all: ["generated-invoices"] as const,
  lists: () => [...generatedInvoiceKeys.all, "list"] as const,
  list: (params?: GeneratedInvoicesParams) =>
    [...generatedInvoiceKeys.lists(), params] as const,
};

export const useGetGeneratedInvoices = (params?: GeneratedInvoicesParams) => {
  return useQuery({
    queryKey: generatedInvoiceKeys.list(params),
    queryFn: () => getGeneratedInvoices(params),
  });
};
