import api from "@/lib/axios";

export const RESTAURANT_PAYMENT_METHOD_CODES = [
  "COD",
  "CARD_ON_DELIVERY",
  "STRIPE",
  "PAYPAL",
  "EASYPAISA",
  "JAZZCASH",
  "BANK_TRANSFER",
  "WALLET",
] as const;

export type RestaurantPaymentMethodCode =
  (typeof RESTAURANT_PAYMENT_METHOD_CODES)[number];

export type RestaurantPaymentMethods = {
  activePlatformMethods: RestaurantPaymentMethodCode[];
  allowedPaymentMethods: RestaurantPaymentMethodCode[];
};

type PaymentManagementResponse = {
  data?: {
    payments?: {
      methods?: {
        activePlatformMethods?: RestaurantPaymentMethodCode[];
        restaurantMethods?: {
          allowedPaymentMethods?: RestaurantPaymentMethodCode[];
        };
      };
    };
  };
};

export const getRestaurantPaymentMethods = async (
  restaurantId: string,
): Promise<RestaurantPaymentMethods> => {
  const response = await api.get<PaymentManagementResponse>(
    `/payments/restaurants/${restaurantId}/management`,
  );
  const methods = response.data.data?.payments?.methods;

  return {
    activePlatformMethods: methods?.activePlatformMethods ?? [],
    allowedPaymentMethods:
      methods?.restaurantMethods?.allowedPaymentMethods ?? [],
  };
};

export const updateRestaurantPaymentMethods = async (
  restaurantId: string,
  allowedPaymentMethods: RestaurantPaymentMethodCode[],
) => {
  const { data } = await api.patch(
    `/payments/restaurants/${restaurantId}/methods`,
    {
      allowedPaymentMethods,
      walletEnabled: allowedPaymentMethods.includes("WALLET"),
    },
  );

  return data;
};
