import api from "@/lib/axios";

export type PayoutProvider = "STRIPE" | "PAYPAL";

export type PayoutProviderRequest = {
  provider: PayoutProvider;
  status: "REQUESTED" | "APPROVED" | "REJECTED";
  publicDetails: Record<string, unknown>;
  credentialsSubmitted: boolean;
  note: string | null;
  requestedAt: string | null;
  rejectionReason: string | null;
};

export type PayoutProviderConfiguration = {
  provider: PayoutProvider;
  enabled: boolean;
  publicDetails: Record<string, unknown>;
  credentialsConfigured: boolean;
  approvedAt: string | null;
};

export type PayoutProviderSettings = {
  requests: PayoutProviderRequest[];
  configurations: PayoutProviderConfiguration[];
};

type RecordValue = Record<string, unknown>;

const isRecord = (value: unknown): value is RecordValue =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const getString = (value: unknown, fallback: string | null = null) =>
  value === null || value === undefined || value === ""
    ? fallback
    : String(value);

export const getPayoutProviderSettings = async (
  restaurantId: string,
): Promise<PayoutProviderSettings> => {
  const response = await api.get(
    `/payments/restaurants/${restaurantId}/payout-provider-requests`,
  );
  const envelope = isRecord(response.data) ? response.data : {};
  const data = isRecord(envelope.data) ? envelope.data : envelope;
  const requests = Array.isArray(data.requests) ? data.requests : [];
  const configurations = Array.isArray(data.configurations)
    ? data.configurations
    : [];

  return {
    requests: requests.filter(isRecord).map((request) => ({
      provider: getString(request.provider, "STRIPE") as PayoutProvider,
      status: getString(
        request.status,
        "REQUESTED",
      ) as PayoutProviderRequest["status"],
      publicDetails: isRecord(request.publicDetails)
        ? request.publicDetails
        : {},
      credentialsSubmitted: request.credentialsSubmitted === true,
      note: getString(request.note),
      requestedAt: getString(request.requestedAt),
      rejectionReason: getString(request.rejectionReason),
    })),
    configurations: configurations.filter(isRecord).map((configuration) => ({
      provider: getString(configuration.provider, "STRIPE") as PayoutProvider,
      enabled: configuration.enabled === true,
      publicDetails: isRecord(configuration.publicDetails)
        ? configuration.publicDetails
        : {},
      credentialsConfigured: configuration.credentialsConfigured === true,
      approvedAt: getString(configuration.approvedAt),
    })),
  };
};

export const approvePayoutProviderRequest = async (
  restaurantId: string,
  provider: PayoutProvider,
  note?: string,
) => {
  const { data } = await api.post(
    `/payments/restaurants/${restaurantId}/payout-provider-requests/${provider}/approve`,
    { note },
  );
  return data;
};

export const rejectPayoutProviderRequest = async (
  restaurantId: string,
  provider: PayoutProvider,
  reason: string,
) => {
  const { data } = await api.post(
    `/payments/restaurants/${restaurantId}/payout-provider-requests/${provider}/reject`,
    { reason },
  );
  return data;
};

export const setPayoutProviderEnabled = async (
  restaurantId: string,
  provider: PayoutProvider,
  enabled: boolean,
) => {
  const { data } = await api.patch(
    `/payments/restaurants/${restaurantId}/payout-providers/${provider}`,
    { enabled },
  );
  return data;
};

export const createProviderPayout = async (
  restaurantId: string,
  payload: {
    provider: PayoutProvider;
    amount: number;
    currency: string;
    idempotencyKey: string;
    description?: string;
  },
) => {
  const { data } = await api.post(
    `/payments/restaurants/${restaurantId}/provider-payouts`,
    payload,
  );
  return data;
};
