import api from "@/lib/axios";

/**
 * ==============================
 * TYPES (ALIGNED WITH BACKEND)
 * ==============================
 */

export type NotificationChannel = {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
};

export const EMAIL_TEMPLATE_KEYS = [
  "verification",
  "passwordReset",
  "orderConfirmation",
  "orderStatus",
  "paymentStatus",
  "giftCard",
] as const;

export type EmailTemplateKey = (typeof EMAIL_TEMPLATE_KEYS)[number];
export type EmailTemplateLocale = "de" | "en";
export type EmailTemplates = Record<
  EmailTemplateKey,
  Record<EmailTemplateLocale, { subject: string; body: string }>
>;

export const createEmptyEmailTemplates = (): EmailTemplates =>
  Object.fromEntries(
    EMAIL_TEMPLATE_KEYS.map((key) => [
      key,
      { de: { subject: "", body: "" }, en: { subject: "", body: "" } },
    ]),
  ) as EmailTemplates;

export type NotificationSettingsValues = {
  emailAddress: string | null;
  phoneNumber: string | null;
  whatsappNumber: string | null;
  notificationTypes: {
    [key: string]: NotificationChannel;
  };
  emailTemplates: EmailTemplates;
};

/**
 * ==============================
 * HELPERS
 * ==============================
 */
const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const asString = (value: unknown) => (typeof value === "string" ? value : "");

const normalizeNotificationSettings = (
  payload: unknown,
): NotificationSettingsValues => {
  const source = asRecord(payload);
  const rawTemplates = asRecord(source.emailTemplates);
  const emailTemplates = createEmptyEmailTemplates();

  EMAIL_TEMPLATE_KEYS.forEach((key) => {
    const template = asRecord(rawTemplates[key]);
    (["de", "en"] as const).forEach((locale) => {
      const localized = asRecord(template[locale]);
      emailTemplates[key][locale] = {
        subject: asString(localized.subject),
        body: asString(localized.body),
      };
    });
  });

  return {
    emailAddress: asString(source.emailAddress),
    phoneNumber: asString(source.phoneNumber),
    whatsappNumber: asString(source.whatsappNumber),
    notificationTypes: asRecord(source.notificationTypes) as Record<
      string,
      NotificationChannel
    >,
    emailTemplates,
  };
};

/**
 * ==============================
 * API ENDPOINTS
 * ==============================
 */

const BASE_URL = "/admin/global-settings";

/**
 * GET GLOBAL NOTIFICATION SETTINGS
 */
export const getNotificationSettings = async (): Promise<NotificationSettingsValues> => {
  const { data } = await api.get(BASE_URL);

  // backend wraps inside notificationSettings
  const settings = data?.data?.notificationSettings ?? data?.notificationSettings ?? {};

  return normalizeNotificationSettings(settings);
};

/**
 * UPDATE GLOBAL NOTIFICATION SETTINGS
 */
export const updateNotificationSettings = async (
  payload: NotificationSettingsValues
) => {
  const cleanPayload = normalizeNotificationSettings(payload);

  const { data } = await api.patch(BASE_URL, {
    notificationSettings: cleanPayload,
  });

  return data;
};
