import * as z from "zod"

type TranslationFunction = (key: string) => string;

export const createLoginSchema = (t: TranslationFunction) =>
  z.object({
    email: z.string().email(t("emailInvalid")),
    password: z.string().min(8, t("passwordMin")),
  })

export type LoginValues = z.infer<ReturnType<typeof createLoginSchema>>
