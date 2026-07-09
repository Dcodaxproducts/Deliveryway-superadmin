import api from "@/lib/axios";

type RecordValue = Record<string, unknown>;

export type RestaurantWallet = {
  type: string | null;
  balance: number | null;
  currency: string | null;
  customerWalletExposure: RecordValue;
};

export type RestaurantPayoutRequest = {
  id: string;
  amount: number | null;
  currency: string | null;
  status: string | null;
  bankDetails: RecordValue;
  note: string | null;
  paymentReference: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type MarkRestaurantPayoutPaidPayload = {
  paymentReference?: string;
  note?: string;
};

const isRecord = (value: unknown): value is RecordValue =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const getRecord = (value: unknown): RecordValue => (isRecord(value) ? value : {});

const getString = (value: unknown, fallback: string | null = null) => {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
};

const getNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const unwrapData = (response: unknown) => {
  const record = getRecord(response);
  return record.data ?? response;
};

const firstRecord = (...values: unknown[]) => {
  for (const value of values) {
    if (isRecord(value)) return value;
  }

  return {};
};

const firstArray = (...values: unknown[]) => {
  for (const value of values) {
    if (Array.isArray(value)) return value;
  }

  return [];
};

const normalizeWallet = (response: unknown): RestaurantWallet => {
  const data = getRecord(unwrapData(response));
  const wallet = firstRecord(data.wallet, data.account, data);

  return {
    type: getString(wallet.type, "RESTAURANT_WALLET"),
    balance: getNumber(wallet.balance ?? wallet.availableBalance ?? wallet.amount),
    currency: getString(wallet.currency ?? data.currency),
    customerWalletExposure: firstRecord(
      wallet.customerWalletExposure,
      data.customerWalletExposure
    ),
  };
};

const normalizePayoutRequest = (value: unknown): RestaurantPayoutRequest | null => {
  if (!isRecord(value)) return null;

  return {
    id: getString(value.id, "payout-request") ?? "payout-request",
    amount: getNumber(value.amount),
    currency: getString(value.currency),
    status: getString(value.status),
    bankDetails: getRecord(value.bankDetails),
    note: getString(value.note),
    paymentReference: getString(value.paymentReference),
    createdAt: getString(value.createdAt),
    updatedAt: getString(value.updatedAt),
  };
};

const normalizePayoutRequests = (response: unknown): RestaurantPayoutRequest[] => {
  const data = unwrapData(response);
  const record = getRecord(data);
  const rows = firstArray(data, record.items, record.requests, record.payoutRequests, record.data);

  return rows
    .map(normalizePayoutRequest)
    .filter((request): request is RestaurantPayoutRequest => Boolean(request));
};

export const getRestaurantWallet = async (restaurantId: string) => {
  const { data } = await api.get(`/payments/restaurants/${restaurantId}/wallet`);
  return normalizeWallet(data);
};

export const getRestaurantPayoutRequests = async (restaurantId: string) => {
  const { data } = await api.get(`/payments/restaurants/${restaurantId}/payout-requests`);
  return normalizePayoutRequests(data);
};

export const approveRestaurantPayoutRequest = async (id: string) => {
  const { data } = await api.post(`/payments/restaurant-payout-requests/${id}/approve`);
  return data;
};

export const rejectRestaurantPayoutRequest = async (id: string) => {
  const { data } = await api.post(`/payments/restaurant-payout-requests/${id}/reject`);
  return data;
};

export const markRestaurantPayoutRequestPaid = async (
  id: string,
  payload: MarkRestaurantPayoutPaidPayload
) => {
  const { data } = await api.post(
    `/payments/restaurant-payout-requests/${id}/mark-paid`,
    payload
  );
  return data;
};
