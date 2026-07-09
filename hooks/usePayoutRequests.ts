import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  approveRestaurantPayoutRequest,
  getRestaurantPayoutRequests,
  getRestaurantWallet,
  markRestaurantPayoutRequestPaid,
  rejectRestaurantPayoutRequest,
  type MarkRestaurantPayoutPaidPayload,
} from "@/services/payoutRequests";

export const payoutRequestKeys = {
  wallet: (restaurantId?: string | null) => ["restaurant-wallet", restaurantId ?? ""] as const,
  list: (restaurantId?: string | null) => ["restaurant-payout-requests", restaurantId ?? ""] as const,
};

type ApiError = Error & { response?: { data?: { message?: string } } };

const getErrorMessage = (error: ApiError, fallback: string) =>
  error.response?.data?.message ?? fallback;

export const useRestaurantWallet = (restaurantId?: string | null) =>
  useQuery({
    queryKey: payoutRequestKeys.wallet(restaurantId),
    queryFn: () => getRestaurantWallet(restaurantId as string),
    enabled: Boolean(restaurantId),
  });

export const useRestaurantPayoutRequests = (restaurantId?: string | null) =>
  useQuery({
    queryKey: payoutRequestKeys.list(restaurantId),
    queryFn: () => getRestaurantPayoutRequests(restaurantId as string),
    enabled: Boolean(restaurantId),
  });

export const useApproveRestaurantPayoutRequest = (restaurantId?: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approveRestaurantPayoutRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payoutRequestKeys.list(restaurantId) });
      toast.success("Payout request approved");
    },
    onError: (error: ApiError) => {
      toast.error(getErrorMessage(error, "Unable to approve payout request"));
    },
  });
};

export const useRejectRestaurantPayoutRequest = (restaurantId?: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rejectRestaurantPayoutRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payoutRequestKeys.list(restaurantId) });
      toast.success("Payout request rejected");
    },
    onError: (error: ApiError) => {
      toast.error(getErrorMessage(error, "Unable to reject payout request"));
    },
  });
};

export const useMarkRestaurantPayoutRequestPaid = (restaurantId?: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MarkRestaurantPayoutPaidPayload }) =>
      markRestaurantPayoutRequestPaid(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payoutRequestKeys.wallet(restaurantId) });
      queryClient.invalidateQueries({ queryKey: payoutRequestKeys.list(restaurantId) });
      toast.success("Payout request marked paid");
    },
    onError: (error: ApiError) => {
      toast.error(getErrorMessage(error, "Unable to mark payout paid"));
    },
  });
};
