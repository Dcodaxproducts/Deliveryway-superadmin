import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  approvePayoutProviderRequest,
  createProviderPayout,
  getPayoutProviderSettings,
  rejectPayoutProviderRequest,
  type PayoutProvider,
} from "@/services/payoutProviders";
import { payoutRequestKeys } from "@/hooks/usePayoutRequests";

const keys = {
  detail: (restaurantId?: string | null) =>
    ["restaurant-payout-providers", restaurantId ?? ""] as const,
};

type ApiError = Error & { response?: { data?: { message?: string } } };

const errorMessage = (error: ApiError, fallback: string) =>
  error.response?.data?.message ?? fallback;

export const usePayoutProviderSettings = (restaurantId?: string | null) =>
  useQuery({
    queryKey: keys.detail(restaurantId),
    queryFn: () => getPayoutProviderSettings(restaurantId as string),
    enabled: Boolean(restaurantId),
  });

export const useApprovePayoutProviderRequest = (
  restaurantId?: string | null,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      provider,
      note,
    }: {
      provider: PayoutProvider;
      note?: string;
    }) => approvePayoutProviderRequest(restaurantId as string, provider, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.detail(restaurantId) });
      toast.success("Payout provider approved");
    },
    onError: (error: ApiError) =>
      toast.error(errorMessage(error, "Unable to approve payout provider")),
  });
};

export const useRejectPayoutProviderRequest = (
  restaurantId?: string | null,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      provider,
      reason,
    }: {
      provider: PayoutProvider;
      reason: string;
    }) => rejectPayoutProviderRequest(restaurantId as string, provider, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.detail(restaurantId) });
      toast.success("Payout provider rejected");
    },
    onError: (error: ApiError) =>
      toast.error(errorMessage(error, "Unable to reject payout provider")),
  });
};

export const useCreateProviderPayout = (restaurantId?: string | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      provider: PayoutProvider;
      amount: number;
      currency: string;
      idempotencyKey: string;
      description?: string;
    }) => createProviderPayout(restaurantId as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: payoutRequestKeys.wallet(restaurantId),
      });
      queryClient.invalidateQueries({
        queryKey: payoutRequestKeys.list(restaurantId),
      });
      queryClient.invalidateQueries({ queryKey: keys.detail(restaurantId) });
      toast.success("Provider payout completed and wallet debited");
    },
    onError: (error: ApiError) =>
      toast.error(errorMessage(error, "Unable to complete provider payout")),
  });
};
