import { z } from "zod";

type TranslationFunction = (key: string) => string;

/**
 * ==============================
 * Staff Role Schema
 * ==============================
 */

const createPermissionSchema = (t: TranslationFunction) =>
  z.object({
    access: z.string().min(1, t("accessRequired")),
    operations: z.array(z.string().min(1)).min(1, t("operationRequired")),
  });

export const createStaffRoleSchema = (t: TranslationFunction) =>
  z.object({
    name: z.string().min(2, t("roleNameRequired")),
    permissions: z
      .array(createPermissionSchema(t))
      .min(1, t("permissionRequired")),
    description: z.string().max(300).optional(),
    restaurantIds: z.array(z.string().min(1)).optional(),
    branchIds: z.array(z.string().min(1)).optional(),
  });

export type StaffRoleValues = z.infer<ReturnType<typeof createStaffRoleSchema>>;

/**
 * ==============================
 * Staff Schema
 * ==============================
 */

export const createStaffSchema = (t: TranslationFunction) =>
  z.object({
    email: z.string().email(t("invalidEmail")),

    password: z.string().min(8, t("passwordMin")),

    firstName: z.string().min(1, t("firstNameRequired")),
    lastName: z.string().min(1, t("lastNameRequired")),

    staffRoleId: z.string().min(1, t("staffRoleRequired")),

    phone: z.string().min(10, t("invalidPhone")).optional(),

    // avatarUrl: z
    //   .string()
    //   .url(t("invalidAvatarUrl"))
    //   .optional(),

    bio: z.string().max(500, t("bioMax")).optional(),

    restaurantIds: z.array(z.string().min(1)).optional(),
    branchIds: z.array(z.string().min(1)).optional(),

    isActive: z.boolean().default(true),
  });

export type StaffValues = z.infer<ReturnType<typeof createStaffSchema>>;
