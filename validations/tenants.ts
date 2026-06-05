import { z } from "zod";

type TranslationFunction = (key: string) => string;

/**
 * ==============================
 * Common Schemas
 * ==============================
 */

const optionalString = z.string().optional().or(z.literal(""));
const recordSchema = z.record(z.string(), z.any()).optional();

const supportContactSchema = z
  .object({
    email: optionalString,
    phone: optionalString,
    whatsapp: optionalString,
  })
  .partial()
  .optional();

const branchContactSchema = z
  .object({
    whatsapp: optionalString,
    phone: optionalString,
  })
  .partial()
  .optional();

const latLngPointSchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
});

const deliveryZoneSchema = z.object({
  name: optionalString,
  deliveryFee: z.coerce.number().min(0).optional(),
  minOrderAmount: z.coerce.number().min(0).optional(),
  freeDeliveryThreshold: z.coerce.number().min(0).optional(),
  polygon: z.array(latLngPointSchema).optional(),
});

const zoneBandSchema = z.object({
  fromKm: z.coerce.number().min(0).optional(),
  toKm: z.coerce.number().min(0).optional(),
  deliveryFee: z.coerce.number().min(0).optional(),
  minOrderAmount: z.coerce.number().min(0).optional(),
  freeDeliveryThreshold: z.coerce.number().min(0).optional(),
});

const postalCodeRuleSchema = z.object({
  postalCode: optionalString,
  deliveryFee: z.coerce.number().min(0).optional(),
});

const deliveryConfigSchema = z
  .object({
    mode: z.enum(["RADIUS", "ZONE", "POSTAL_CODE"]).optional(),
    radiusKm: z.coerce.number().min(0).optional(),
    minOrderAmount: z.coerce.number().min(0).optional(),
    deliveryFee: z.coerce.number().min(0).optional(),
    isFreeDelivery: z.boolean().optional(),
    freeDeliveryThreshold: z.coerce.number().min(0).optional(),
    zones: z.array(deliveryZoneSchema).optional(),
    zoneBands: z.array(zoneBandSchema).optional(),
    postalCodeRules: z.array(postalCodeRuleSchema).optional(),
  })
  .partial()
  .optional();

const automationSchema = z
  .object({
    autoAcceptOrders: z.boolean().optional(),
    estimatedPrepTime: z.coerce.number().min(0).optional(),
  })
  .partial()
  .optional();

const taxationSchema = z
  .object({
    taxPercentage: z.coerce.number().min(0).max(100).optional(),
  })
  .partial()
  .optional();

/**
 * ==============================
 * Register Tenant Schema
 * ==============================
 */

export const createRegisterTenantSchema = (t: TranslationFunction) => z.object({
  user: z.object({
    email: z.string().email(t("invalidEmail")),
    password: z.string().min(8, t("passwordMin")),
    firstName: z.string().min(1, t("firstNameRequired")),
    lastName: z.string().min(1, t("lastNameRequired")),
    avatarUrl: optionalString.optional(),
    bio: z.string().max(500, t("bioMax")).optional(),
  }),

  branchAdmin: z.object({
    email: z.string().email(t("branchAdminEmailInvalid")),
    password: z.string().min(8, t("branchAdminPasswordMin")),
    firstName: z.string().min(1, t("branchAdminFirstNameRequired")),
    lastName: z.string().min(1, t("branchAdminLastNameRequired")),
    phone: optionalString.optional(),
  }),

  tenant: z.object({
    name: z.string().min(2, t("tenantNameRequired")),
    slug: z.string().min(2, t("tenantSlugRequired")),
    logoUrl: optionalString.optional(),
    bio: z.string().max(500, t("bioMax")).optional(),
    socialLinks: recordSchema,
    settings: recordSchema,
  }),

  restaurant: z.object({
    name: z.string().min(2, t("restaurantNameRequired")),
    slug: z.string().min(2, t("restaurantSlugRequired")),
    logoUrl: optionalString.optional(),
    coverImage: optionalString.optional(),
    customDomain: optionalString.optional(),
    bio: z.string().max(500, t("bioMax")).optional(),
    tagline: optionalString.optional(),
    supportContact: supportContactSchema,
    branding: recordSchema,
    socialMedia: recordSchema,
  }),

  branch: z.object({
    name: z.string().min(2, t("branchNameRequired")),
    logoUrl: optionalString.optional(),
    coverImage: optionalString.optional(),
    description: z
      .string()
      .max(500, t("descriptionMax"))
      .optional(),

    settings: z
      .object({
        deliveryTime: z.coerce.number().min(0).optional(),
        tableReservationsEnabled: z.boolean().optional(),
        allowedOrderTypes: z.array(z.string()).optional(),
        allowedPaymentMethods: z.array(z.string()).optional(),
        deliveryConfig: deliveryConfigSchema,
        automation: automationSchema,
        taxation: taxationSchema,
        contact: branchContactSchema,
      })
      .partial()
      .optional(),

    street: optionalString.optional(),
    area: optionalString.optional(),
    city: optionalString.optional(),
    state: optionalString.optional(),
    country: optionalString.optional(),
    lat: optionalString.optional(),
    lng: optionalString.optional(),
  }),
});

export type RegisterTenantValues = z.infer<ReturnType<typeof createRegisterTenantSchema>>;

/**
 * ==============================
 * Tenant Update Schema
 * ==============================
 */

export const createUpdateTenantSchema = (t: TranslationFunction) => z.object({
  name: z.string().min(2, t("tenantNameRequired")),
  slug: z.string().min(2, t("tenantSlugRequired")),
  bio: z.string().max(500, t("bioMax")).optional(),
  logoUrl: optionalString.optional(),
  socialLinks: recordSchema,
  brandingConfig: recordSchema,
  settings: recordSchema,
  isActive: z.boolean(),
});

export type UpdateTenantValues = z.infer<ReturnType<typeof createUpdateTenantSchema>>;

/**
 * ==============================
 * Tenant List Filter Schema
 * ==============================
 */

export const tenantListFilterSchema = z.object({
  search: z.string().optional(),
  sortOrder: z.enum(["ASC", "DESC"]).optional(),
  withDeleted: z.boolean().optional(),
  includeInactive: z.boolean().optional(),
});

export type TenantListFilterValues = z.infer<typeof tenantListFilterSchema>;
