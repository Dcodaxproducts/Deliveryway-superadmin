import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  getRestaurantPaymentMethods,
  updateRestaurantPaymentMethods,
  type RestaurantPaymentMethodCode,
} from "@/services/restaurantPaymentMethods";

const paymentMethodKey = (restaurantId?: string | null) =>
  ["restaurant-payment-methods", restaurantId ?? ""] as const;

type ApiError = Error & { response?: { data?: { message?: string } } };

export const useRestaurantPaymentMethods = (restaurantId?: string | null) =>
  useQuery({
    queryKey: paymentMethodKey(restaurantId),
    queryFn: () => getRestaurantPaymentMethods(restaurantId as string),
    enabled: Boolean(restaurantId),
  });

export const useUpdateRestaurantPaymentMethods = (
  restaurantId?: string | null,
) => {
  const queryClient = useQueryClient();
  const text = useTranslations("globalSettings");

  return useMutation({
    mutationFn: (allowedPaymentMethods: RestaurantPaymentMethodCode[]) =>
      updateRestaurantPaymentMethods(
        restaurantId as string,
        allowedPaymentMethods,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: paymentMethodKey(restaurantId),
      });
      toast.success(text("restaurantPaymentMethodsSaved"));
    },
    onError: (error: ApiError) => {
      toast.error(
        error.response?.data?.message ??
          text("restaurantPaymentMethodsSaveFailed"),
      );
    },
  });
};
