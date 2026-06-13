export interface GlobalPaymentMethod {
  code: string;
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

export interface TaxType {
  code: string;
  label: string;
  percentage: number;
  isActive: boolean;
  isDefault: boolean;
}

export interface GetTaxTypesResponse {
  data: TaxType[];
  message?: string;
}

export interface UpdateTaxTypesPayload {
  taxTypes: TaxType[];
}

export interface UpdateTaxTypesResponse {
  data?: TaxType[];
  message?: string;
}
