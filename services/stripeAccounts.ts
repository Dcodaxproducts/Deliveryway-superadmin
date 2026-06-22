import api from "@/lib/axios";

export type StripeAccountSettings = {
  accountId: string | null;
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
  onboardingComplete: boolean;
  dashboardUrl: string | null;
  note: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
  lastTransfer?: Record<string, unknown> | null;
};

export type StripeRestaurantAccountResponse = {
  data: {
    restaurantId: string;
    stripe: StripeAccountSettings;
    publishableKey?: string | null;
    configured?: boolean;
  };
  message?: string;
};

export type UpdateStripeAccountPayload = Partial<
  Pick<
    StripeAccountSettings,
    | "accountId"
    | "payoutsEnabled"
    | "chargesEnabled"
    | "onboardingComplete"
    | "dashboardUrl"
    | "note"
  >
>;

export type CreateStripeTransferPayload = {
  amount: number;
  currency?: string;
  description?: string;
};

export type StripeTransferResponse = {
  data: {
    restaurantId: string;
    transfer: Record<string, unknown>;
  };
  message?: string;
};

export const getRestaurantStripeAccount = async (restaurantId: string) => {
  const { data } = await api.get<StripeRestaurantAccountResponse>(
    `/payments/stripe/restaurants/${restaurantId}/account`
  );
  return data;
};

export const updateRestaurantStripeAccount = async (
  restaurantId: string,
  payload: UpdateStripeAccountPayload
) => {
  const { data } = await api.patch<StripeRestaurantAccountResponse>(
    `/payments/stripe/restaurants/${restaurantId}/account`,
    payload
  );
  return data;
};

export const createRestaurantStripeTransfer = async (
  restaurantId: string,
  payload: CreateStripeTransferPayload
) => {
  const { data } = await api.post<StripeTransferResponse>(
    `/payments/stripe/restaurants/${restaurantId}/transfers`,
    payload
  );
  return data;
};
