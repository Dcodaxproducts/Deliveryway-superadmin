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
export type EmailTemplateText = {
  subject: string;
  body: string;
};
export type EmailTemplates = Record<
  EmailTemplateKey,
  Record<EmailTemplateLocale, EmailTemplateText>
>;

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
const normalizeNotificationSettings = (
  payload: unknown
): NotificationSettingsValues => {
  const source =
    typeof payload === "object" && payload !== null
      ? (payload as Record<string, unknown>)
      : {};
  const rawTemplates =
    typeof source.emailTemplates === "object" &&
    source.emailTemplates !== null
      ? (source.emailTemplates as Record<string, unknown>)
      : {};

  return {
    emailAddress:
      typeof source.emailAddress === "string" ? source.emailAddress : "",
    phoneNumber:
      typeof source.phoneNumber === "string" ? source.phoneNumber : "",
    whatsappNumber:
      typeof source.whatsappNumber === "string"
        ? source.whatsappNumber
        : "",
    notificationTypes:
      typeof source.notificationTypes === "object" &&
      source.notificationTypes !== null
        ? (source.notificationTypes as Record<string, NotificationChannel>)
        : {},
    emailTemplates: Object.fromEntries(
      EMAIL_TEMPLATE_KEYS.map((key) => {
        const template =
          typeof rawTemplates[key] === "object" && rawTemplates[key] !== null
            ? (rawTemplates[key] as Record<string, unknown>)
            : {};
        return [
          key,
          Object.fromEntries(
            (["de", "en"] as const).map((locale) => {
              const localized =
                typeof template[locale] === "object" &&
                template[locale] !== null
                  ? (template[locale] as Record<string, unknown>)
                  : {};
              return [
                locale,
                {
                  subject:
                    typeof localized.subject === "string"
                      ? localized.subject
                      : "",
                  body:
                    typeof localized.body === "string" ? localized.body : "",
                },
              ];
            })
          ),
        ];
      })
    ) as EmailTemplates,
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
