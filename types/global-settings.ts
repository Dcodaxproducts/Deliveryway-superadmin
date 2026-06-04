export type PaymentMethodCode =
  | "COD"
  | "STRIPE"
  | "EASYPAISA"
  | "JAZZCASH"
  | "BANK_TRANSFER"
  | "WALLET";

export interface GlobalPaymentMethod {
  code: PaymentMethodCode;
  label: string;
  isActive: boolean;
}

export interface GetPaymentMethodsResponse {
  data: GlobalPaymentMethod[];
  message: string;
}

export interface UpdatePaymentMethodsPayload {
  paymentMethods: GlobalPaymentMethod[];
}

export interface UpdatePaymentMethodsResponse {
  data?: GlobalPaymentMethod[];
  message?: string;
}
