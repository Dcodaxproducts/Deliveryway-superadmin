import { z } from "zod";

export const restaurantSchema = z.object({
  name: z.string().min(2, "Restaurant name is required"),
  tenantId: z.string().min(1, "Tenant ID is required"),
  slug: z.string().min(1, "Slug is required"),
 logoUrl: z.string().optional().default(""),
coverImage: z.string().optional().default(""),
  customDomain: z.string().optional(),
  tagline: z.string().optional(),
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
  supportContact: z.object({
    email: z.string().email("Invalid email"),
    whatsapp: z.string().min(10, "Invalid WhatsApp number"),
    phone: z.string().min(10, "Invalid phone number"),
  }),
  branding: z.object({
    primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
    secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
    fontFamily: z.string().default("Inter"),
  })
});
export type RestaurantValues = z.infer<typeof restaurantSchema>;