import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createRestaurantStripeTransfer,
  getRestaurantStripeAccount,
  updateRestaurantStripeAccount,
  type CreateStripeTransferPayload,
  type UpdateStripeAccountPayload,
} from "@/services/stripeAccounts";

export const stripeAccountKeys = {
  detail: (restaurantId?: string | null) =>
    ["stripe-account", restaurantId ?? ""] as const,
};

type ApiError = Error & { response?: { data?: { message?: string } } };

export const useRestaurantStripeAccount = (restaurantId?: string | null) =>
  useQuery({
    queryKey: stripeAccountKeys.detail(restaurantId),
    queryFn: () => getRestaurantStripeAccount(restaurantId as string),
    enabled: Boolean(restaurantId),
  });

export const useUpdateRestaurantStripeAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      restaurantId,
      payload,
    }: {
      restaurantId: string;
      payload: UpdateStripeAccountPayload;
    }) => updateRestaurantStripeAccount(restaurantId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: stripeAccountKeys.detail(variables.restaurantId),
      });
      toast.success("Stripe account settings saved");
    },
    onError: (error: ApiError) => {
      toast.error(
        error.response?.data?.message ?? "Unable to save Stripe account settings"
      );
    },
  });
};

export const useCreateRestaurantStripeTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      restaurantId,
      payload,
    }: {
      restaurantId: string;
      payload: CreateStripeTransferPayload;
    }) => createRestaurantStripeTransfer(restaurantId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: stripeAccountKeys.detail(variables.restaurantId),
      });
      toast.success("Stripe transfer created");
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message ?? "Unable to create transfer");
    },
  });
};
