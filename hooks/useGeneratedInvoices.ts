import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  GeneratedInvoicesParams,
  cancelGeneratedInvoice,
  getGeneratedInvoices,
  recreateGeneratedInvoice,
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

export const useCancelGeneratedInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelGeneratedInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: generatedInvoiceKeys.lists() });
      toast.success("Invoice cancelled");
    },
    onError: () => toast.error("Unable to cancel invoice"),
  });
};

export const useRecreateGeneratedInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recreateGeneratedInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: generatedInvoiceKeys.lists() });
      toast.success("A new invoice was created from the cancelled invoice");
    },
    onError: () => toast.error("Unable to recreate invoice"),
  });
};
