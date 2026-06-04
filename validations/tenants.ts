import { z } from "zod";

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

export const registerTenantSchema = z.object({
  user: z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    avatarUrl: optionalString.optional(),
    bio: z.string().max(500, "Bio must be under 500 characters").optional(),
  }),

  branchAdmin: z.object({
    email: z.string().email("Invalid branch admin email"),
    password: z.string().min(8, "Branch admin password must be at least 8 characters"),
    firstName: z.string().min(1, "Branch admin first name is required"),
    lastName: z.string().min(1, "Branch admin last name is required"),
    phone: optionalString.optional(),
  }),

  tenant: z.object({
    name: z.string().min(2, "Tenant name is required"),
    slug: z.string().min(2, "Tenant slug is required"),
    logoUrl: optionalString.optional(),
    bio: z.string().max(500, "Bio must be under 500 characters").optional(),
    socialLinks: recordSchema,
    settings: recordSchema,
  }),

  restaurant: z.object({
    name: z.string().min(2, "Restaurant name is required"),
    slug: z.string().min(2, "Restaurant slug is required"),
    logoUrl: optionalString.optional(),
    coverImage: optionalString.optional(),
    customDomain: optionalString.optional(),
    bio: z.string().max(500, "Bio must be under 500 characters").optional(),
    tagline: optionalString.optional(),
    supportContact: supportContactSchema,
    branding: recordSchema,
    socialMedia: recordSchema,
  }),

  branch: z.object({
    name: z.string().min(2, "Branch name is required"),
    logoUrl: optionalString.optional(),
    coverImage: optionalString.optional(),
    description: z
      .string()
      .max(500, "Description must be under 500 characters")
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

export type RegisterTenantValues = z.infer<typeof registerTenantSchema>;

/**
 * ==============================
 * Tenant Update Schema
 * ==============================
 */

export const updateTenantSchema = z.object({
  name: z.string().min(2, "Tenant name is required"),
  slug: z.string().min(2, "Tenant slug is required"),
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
  logoUrl: optionalString.optional(),
  socialLinks: recordSchema,
  brandingConfig: recordSchema,
  settings: recordSchema,
  isActive: z.boolean(),
});

export type UpdateTenantValues = z.infer<typeof updateTenantSchema>;

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
