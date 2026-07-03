import { z } from "zod";

export const createCuisineSchema = (messages?: {
  required?: string;
  invalidUrl?: string;
}) =>
  z.object({
    name: z.string().trim().min(1, messages?.required ?? "Name is required").max(100),
    slug: z.string().trim().min(1, messages?.required ?? "Slug is required").max(120),
    description: z.string().trim().optional().or(z.literal("")),
    imageUrl: z.string().trim().optional().or(z.literal("")),
    isActive: z.boolean().default(true),
  });

export type CuisineFormValues = z.infer<ReturnType<typeof createCuisineSchema>>;
