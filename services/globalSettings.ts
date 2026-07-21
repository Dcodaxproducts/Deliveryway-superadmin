import api from "@/lib/axios";
import type {
  GetPaymentMethodsResponse,
  GetTaxTypesResponse,
  UpdateTaxTypesPayload,
  UpdateTaxTypesResponse,
  UpdatePaymentMethodsPayload,
  UpdatePaymentMethodsResponse,
} from "@/types/global-settings";

export type GlobalSettingsValues = {
  globalTaxPercentage: number;
  vatHandlingRule: string;
  defaultCommissionPercentage: number;
  defaultHybridFeePercentage: number;
  defaultCurrency: string;
  currencyDisplayFormat: string;
  defaultLanguage: string;
  dateFormat: string;
  timezone: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  isTaxEnforced: boolean;
  isCommissionEnforced: boolean;
  isCurrencyEnforced: boolean;
  isLocalizationEnforced: boolean;
  landingPageSettings: {
    businessName: string;
    logoUrl: string | null;
    footerDescription: string | null;
    supportEmail: string | null;
    supportPhone: string | null;
    address: string | null;
    copyrightText: string;
    socialLinks: {
      facebook: string | null;
      twitter: string | null;
      instagram: string | null;
      youtube: string | null;
    };
  };
};

type GlobalSettingsResponse = Partial<GlobalSettingsValues> & {
  id?: string;
};

/**
 * ==============================
 * GLOBAL SETTINGS APIS
 * ==============================
 */

/**
 * Get global settings
 */
export const getGlobalSettings = async (): Promise<GlobalSettingsResponse> => {
  const { data } = await api.get<{
    data?: GlobalSettingsResponse;
  } & GlobalSettingsResponse>("/admin/global-settings");

  return data?.data ?? data;
};

/**
 * Update global settings
 */
export const updateGlobalSettings = async (
  payload: Partial<GlobalSettingsValues>
) => {
  const { data } = await api.patch("/admin/global-settings", payload);
  return data;
};

/**
 * Get platform payment methods
 */
export const getGlobalPaymentMethods =
  async (): Promise<GetPaymentMethodsResponse> => {
    const { data } = await api.get<GetPaymentMethodsResponse>(
      "/admin/global-settings/payment-methods"
    );

    return data;
  };

/**
 * Update platform payment methods
 */
export const updateGlobalPaymentMethods = async (
  payload: UpdatePaymentMethodsPayload
): Promise<UpdatePaymentMethodsResponse> => {
  const { data } = await api.patch<UpdatePaymentMethodsResponse>(
    "/admin/global-settings/payment-methods",
    payload
  );

  return data;
};

export const getGlobalTaxTypes = async (): Promise<GetTaxTypesResponse> => {
  const { data } = await api.get<GetTaxTypesResponse>(
    "/admin/global-settings/tax-types"
  );

  return data;
};

export const updateGlobalTaxTypes = async (
  payload: UpdateTaxTypesPayload
): Promise<UpdateTaxTypesResponse> => {
  const { data } = await api.patch<UpdateTaxTypesResponse>(
    "/admin/global-settings/tax-types",
    payload
  );

  return data;
};
