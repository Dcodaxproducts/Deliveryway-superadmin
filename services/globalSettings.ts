import api from "@/lib/axios";
import type {
  GetPaymentMethodsResponse,
  GetTaxTypesResponse,
  UpdateTaxTypesPayload,
  UpdateTaxTypesResponse,
  UpdatePaymentMethodsPayload,
  UpdatePaymentMethodsResponse,
} from "@/types/global-settings";

export type LandingPageFaq = {
  id: string;
  questionEn: string;
  answerEn: string;
  questionDe: string;
  answerDe: string;
  isActive: boolean;
  sortOrder: number;
};

export type LandingPageHero = {
  eyebrowEn: string | null;
  eyebrowDe: string | null;
  headingEn: string | null;
  headingDe: string | null;
  subheadingEn: string | null;
  subheadingDe: string | null;
};

export type LandingPageContent = {
  hero: LandingPageHero;
  contentEn: string | null;
  contentDe: string | null;
};

export type LandingPagePages = {
  services: LandingPageContent;
  pricing: LandingPageContent;
  about: LandingPageContent;
  privacyPolicy: LandingPageContent;
  support: LandingPageContent;
  termsOfService: LandingPageContent;
  contact: LandingPageContent;
};

export type LandingPageSettings = {
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
  pages: LandingPagePages;
  faqs: LandingPageFaq[];
};

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
  landingPageSettings: LandingPageSettings;
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
  payload: Omit<Partial<GlobalSettingsValues>, "landingPageSettings"> & {
    landingPageSettings?: Partial<LandingPageSettings>;
  },
) => {
  const { data } = await api.patch("/admin/global-settings", payload);
  return data;
};

export const getLandingPageSettings =
  async (): Promise<LandingPageSettings> => {
    const { data } = await api.get<{
      data: LandingPageSettings;
    }>("/admin/global-settings/landing-page");

    return data.data;
  };

export const updateLandingPageSettings = async (
  payload: Partial<LandingPageSettings>,
): Promise<LandingPageSettings> => {
  const { data } = await api.patch<{
    data: LandingPageSettings;
  }>("/admin/global-settings/landing-page", payload);

  return data.data;
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
