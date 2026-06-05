'use client'

import { useState } from 'react'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff } from "lucide-react"
import { useTranslations } from "next-intl"

import { useLogin } from '@/hooks/useAuth'
import { createLoginSchema, type LoginValues } from "@/validations/auth"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const auth = useTranslations("auth")
  const validation = useTranslations("validation")
  const loginSchema = createLoginSchema(validation)
  const { mutate, isPending } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  })

  const onSubmit = (data: LoginValues) => {
    mutate(data)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          <div className="text-center mb-8 space-y-2">
            <h1 className="text-3xl font-bold text-foreground">{auth("welcomeBack")}</h1>
            <p className="text-muted-foreground">{auth("signInToAccount")}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-2">
              <Label>{auth("emailAddress")}</Label>
              <Input
                type="email"
                placeholder={auth("emailPlaceholder")}
                error={errors.email?.message}
                {...register("email")}
              />
            </div>

            <div className="grid gap-2">
              <Label>{auth("password")}</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={auth("passwordPlaceholder")}
                  error={errors.password?.message}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              variant="primary"
              className="w-full"
            >
              {isPending ? auth("signingIn") : auth("signIn")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
