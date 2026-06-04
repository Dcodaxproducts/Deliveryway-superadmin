import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import {
  getGlobalPaymentMethods,
  updateGlobalPaymentMethods,
} from "@/services/globalSettings";
import type { UpdatePaymentMethodsPayload } from "@/types/global-settings";

export const GLOBAL_PAYMENT_METHODS_QUERY_KEY = [
  "global-settings",
  "payment-methods",
] as const;

type ErrorResponse = {
  message?: string;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    return (error.response?.data as ErrorResponse | undefined)?.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
};

export const useGlobalPaymentMethodsQuery = () => {
  return useQuery({
    queryKey: GLOBAL_PAYMENT_METHODS_QUERY_KEY,
    queryFn: getGlobalPaymentMethods,
  });
};

export const useUpdateGlobalPaymentMethodsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePaymentMethodsPayload) =>
      updateGlobalPaymentMethods(payload),

    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: GLOBAL_PAYMENT_METHODS_QUERY_KEY,
      });

      toast.success(response.message || "Payment methods updated successfully!");
    },

    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, "Failed to update payment methods")
      );
    },
  });
};
