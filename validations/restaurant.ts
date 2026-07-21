import { z } from "zod";

type TranslationFunction = (key: string) => string;

export const createRestaurantSchema = (t: TranslationFunction) =>
  z.object({
    name: z.string().min(2, t("restaurantNameRequired")),
    tenantId: z.string().min(1, t("tenantIdRequired")),
    logoUrl: z.string().optional().default(""),
    coverImage: z.string().optional().default(""),
    customDomain: z.string().optional(),
    tagline: z.string().optional(),
    bio: z.string().max(500, t("bioMax")).optional(),
    supportContact: z.object({
      email: z.string().email(t("invalidEmail")),
      whatsapp: z.string().min(10, t("invalidWhatsapp")),
      phone: z.string().min(10, t("invalidPhone")),
    }),
    branding: z.object({
      primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, t("invalidHexColor")),
      secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, t("invalidHexColor")),
      fontFamily: z.string().default("Inter"),
    })
  });

export type RestaurantValues = z.infer<ReturnType<typeof createRestaurantSchema>>;
