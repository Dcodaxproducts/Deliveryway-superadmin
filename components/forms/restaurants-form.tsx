'use client'

import { useCallback, useEffect, useState } from 'react'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Info } from "lucide-react"
import { HexColorPicker } from "react-colorful"
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { createRestaurantSchema, type RestaurantValues } from "@/validations/restaurant"
import { useCreateRestaurant, useUpdateRestaurant } from "@/hooks/useRestaurant"
import { useFileUpload } from '@/hooks/useFileUpload'
import { PremiumImageDropzone } from "@/components/forms/PremiumImageDropzone"
import AsyncSelect from "@/components/ui/AsyncSelect"
import { getTenants } from "@/services/tenants"

interface RestaurantFormProps {
  mode?: 'create' | 'edit'
  restaurantId?: string
  initialData?: any
}

type UploadTarget = 'logo' | 'cover' | null

type TenantOption = {
  id: string
  name?: string
  slug?: string
}

const getTenantLabel = (tenant: TenantOption) =>
  tenant.name || tenant.slug || tenant.id

const isTenantOption = (value: unknown): value is TenantOption => {
  if (!value || typeof value !== "object") return false

  return typeof (value as { id?: unknown }).id === "string"
}

export default function RestaurantForm({
  mode = 'create',
  restaurantId,
  initialData
}: RestaurantFormProps) {
  const router = useRouter()
  const common = useTranslations("common")
  const restaurants = useTranslations("restaurants")
  const validation = useTranslations("validation")
  const restaurantSchema = createRestaurantSchema(validation)
  const createMutation = useCreateRestaurant()
  const updateMutation = useUpdateRestaurant()

  const { uploadFile, uploading, progress } = useFileUpload()
  const [uploadingTarget, setUploadingTarget] = useState<UploadTarget>(null)
  const [openPicker, setOpenPicker] = useState<"primary" | "secondary" | null>(null)
const [logoPreviewBlob, setLogoPreviewBlob] = useState("")
const [coverPreviewBlob, setCoverPreviewBlob] = useState("")
  const [selectedTenant, setSelectedTenant] = useState<TenantOption | null>(
    initialData?.tenant && isTenantOption(initialData.tenant)
      ? initialData.tenant
      : initialData?.tenantId
        ? { id: initialData.tenantId, name: initialData.tenantName }
        : null,
  )
  const mutate =
    mode === 'edit' && restaurantId
      ? (data: RestaurantValues) => updateMutation.mutate({ id: restaurantId, data })
      : createMutation.mutate

  const isPending = mode === 'edit'
    ? updateMutation.isPending
    : createMutation.isPending

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<RestaurantValues>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      branding: {
        primaryColor: "#FF0000",
        secondaryColor: "#000000",
        fontFamily: "Inter"
      },
      supportContact: {
        email: "",
        whatsapp: "",
        phone: ""
      },
      logoUrl: "",
      coverImage: "",
      ...initialData
    }
  })

const logoUrl = watch("logoUrl")
const coverImageUrl = watch("coverImage")
const logoPreview = logoPreviewBlob || logoUrl
const coverPreview = coverPreviewBlob || coverImageUrl
  const primaryColor = watch("branding.primaryColor")
  const secondaryColor = watch("branding.secondaryColor")

  const fetchTenantOptions = useCallback(
    async ({ search, page }: { search: string; page: number }) => {
      const response: unknown = await getTenants({
        page,
        limit: 20,
        search: search || undefined,
        sortOrder: "ASC",
        includeInactive: false,
        withDeleted: false,
      })
      const record = response as {
        data?: unknown
        meta?: Record<string, unknown>
      }

      return {
        data: Array.isArray(record.data)
          ? record.data.filter(isTenantOption)
          : [],
        meta: record.meta,
      }
    },
    [],
  )

  useEffect(() => {
    if (!initialData?.tenant || !isTenantOption(initialData.tenant)) return

    setSelectedTenant(initialData.tenant)
    setValue("tenantId", initialData.tenant.id, { shouldValidate: true })
  }, [initialData, setValue])

  useEffect(() => {
  return () => {
    if (logoPreviewBlob?.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreviewBlob)
    }
    if (coverPreviewBlob?.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreviewBlob)
    }
  }
}, [logoPreviewBlob, coverPreviewBlob])

  const onSubmit = (data: RestaurantValues) => {
    mutate(data)
  }

const handleLogoChange = async (file: File) => {
  if (!file) return

  if (logoPreviewBlob?.startsWith("blob:")) {
    URL.revokeObjectURL(logoPreviewBlob)
  }

  const blobUrl = URL.createObjectURL(file)
  setLogoPreviewBlob(blobUrl)

  try {
    setUploadingTarget('logo')
    const fileUrl = await uploadFile(file)

    if (fileUrl) {
      setValue("logoUrl", fileUrl, { shouldValidate: true, shouldDirty: true })
    }
  } finally {
    setUploadingTarget(null)
  }
}

const handleCoverChange = async (file: File) => {
  if (!file) return

  if (coverPreviewBlob?.startsWith("blob:")) {
    URL.revokeObjectURL(coverPreviewBlob)
  }

  const blobUrl = URL.createObjectURL(file)
  setCoverPreviewBlob(blobUrl)

  try {
    setUploadingTarget('cover')
    const fileUrl = await uploadFile(file)

    if (fileUrl) {
      setValue("coverImage", fileUrl, { shouldValidate: true, shouldDirty: true })
    }
  } finally {
    setUploadingTarget(null)
  }
}
const removeLogo = () => {
  if (logoPreviewBlob?.startsWith("blob:")) {
    URL.revokeObjectURL(logoPreviewBlob)
  }

  setLogoPreviewBlob("")
  setValue("logoUrl", "", { shouldValidate: true, shouldDirty: true })
}

const removeCover = () => {
  if (coverPreviewBlob?.startsWith("blob:")) {
    URL.revokeObjectURL(coverPreviewBlob)
  }

  setCoverPreviewBlob("")
  setValue("coverImage", "", { shouldValidate: true, shouldDirty: true })
}

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-[30px] space-y-[48px] bg-white rounded-[14px]"
    >
      <FormSection label={restaurants("setupBasicInfo")}>
        <FormGroup
          label={`${restaurants("restaurantName")} *`}
          placeholder="Pizza Hut"
          error={errors.name?.message}
          {...register("name")}
        />

        <div className="space-y-[6px]">
          <Label>{restaurants("tenant")} *</Label>
          {mode === "create" ? (
            <AsyncSelect
              value={selectedTenant}
              onChange={(tenant: TenantOption | null) => {
                setSelectedTenant(tenant)
                setValue("tenantId", tenant?.id || "", {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }}
              placeholder={restaurants("selectTenant")}
              searchPlaceholder={restaurants("searchTenants")}
              fetchOptions={fetchTenantOptions}
              getOptionLabel={getTenantLabel}
              renderOption={(tenant: TenantOption) => (
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {getTenantLabel(tenant)}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-gray-400">
                    {tenant.id}
                  </p>
                </div>
              )}
            />
          ) : (
            <Input
              value={selectedTenant ? getTenantLabel(selectedTenant) : watch("tenantId")}
              readOnly
              aria-readonly="true"
            />
          )}
          <Input type="hidden" {...register("tenantId")} />
          {errors.tenantId ? (
            <p className="text-sm text-red-500 mt-1">
              {errors.tenantId.message}
            </p>
          ) : null}
          <p className="text-xs text-gray-500">
            {restaurants("tenantSelectionHint")}
          </p>
        </div>

  <div className="space-y-[6px]">
  <Label>{restaurants("logoUpload")} *</Label>
  <PremiumImageDropzone
    alt={restaurants("logoSelected")}
    emptyHint={restaurants("uploadLogoHint")}
    emptyTitle={restaurants("uploadLogo")}
    onFileSelect={handleLogoChange}
    onRemove={removeLogo}
    preview={logoPreview}
    progress={uploadingTarget === "logo" ? progress : 0}
    selectedText={restaurants("logoSelected")}
    uploading={uploading && uploadingTarget === "logo"}
    uploadText={restaurants("uploadingLogo")}
    variant="logo"
  />

  {errors.logoUrl && (
    <p className="text-sm text-red-500 mt-1">{errors.logoUrl.message}</p>
  )}

  <Input type="hidden" {...register("logoUrl")} />
</div>

<div className="space-y-[6px]">
  <Label>{restaurants("coverImage")}</Label>
  <PremiumImageDropzone
    alt={restaurants("coverSelected")}
    emptyHint={restaurants("uploadCoverHint")}
    emptyTitle={restaurants("uploadCover")}
    onFileSelect={handleCoverChange}
    onRemove={removeCover}
    preview={coverPreview}
    progress={uploadingTarget === "cover" ? progress : 0}
    selectedText={restaurants("coverSelected")}
    uploading={uploading && uploadingTarget === "cover"}
    uploadText={restaurants("uploadingCover")}
    variant="cover"
  />

  {errors.coverImage && (
    <p className="text-sm text-red-500 mt-1">{errors.coverImage.message}</p>
  )}

  <Input type="hidden" {...register("coverImage")} />
</div>
        <FormGroup
          label={restaurants("tagline")}
          placeholder="Best pizza in town"
          error={errors.tagline?.message}
          {...register("tagline")}
        />

        <FormGroup
          label={restaurants("bio")}
          placeholder="Tell us about your brand"
          error={errors.bio?.message}
          {...register("bio")}
        />
      </FormSection>

      <FormSection label={restaurants("supportContact")}>
        <FormGroup
          label={restaurants("supportEmail")}
          placeholder="support@brand.com"
          error={errors.supportContact?.email?.message}
          {...register("supportContact.email")}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
          <FormGroup
            label={restaurants("whatsapp")}
            placeholder="+92300..."
            error={errors.supportContact?.whatsapp?.message}
            {...register("supportContact.whatsapp")}
          />

          <FormGroup
            label={restaurants("phone")}
            placeholder="+92300..."
            error={errors.supportContact?.phone?.message}
            {...register("supportContact.phone")}
          />
        </div>
      </FormSection>

      <FormSection label={restaurants("domainVisibility")}>
        <FormGroup
          label={restaurants("customDomain")}
          placeholder="www.yourdomain.com"
          error={errors.customDomain?.message}
          {...register("customDomain")}
        />
      </FormSection>

      <FormSection label={restaurants("branding")}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
          <div className="space-y-[6px]">
            <Label>{restaurants("primaryColor")}</Label>
            <div className="flex gap-2">
              <div
                className="size-[52px] rounded-md shrink-0 border cursor-pointer"
                style={{ backgroundColor: primaryColor }}
                onClick={() => setOpenPicker(openPicker === "primary" ? null : "primary")}
              />
              <Input
                placeholder="#FF0000"
                className={`h-[52px] border-[#BBBBBB] ${errors.branding?.primaryColor ? 'border-red-500' : ''}`}
                value={primaryColor}
                onChange={(e) =>
                  setValue("branding.primaryColor", e.target.value, { shouldValidate: true })
                }
              />
            </div>

            {openPicker === "primary" && (
              <div className="relative z-50 mt-2">
                <div className="fixed inset-0" onClick={() => setOpenPicker(null)} />
                <div className="absolute top-0 left-0">
                  <HexColorPicker
                    color={primaryColor}
                    onChange={(color) =>
                      setValue("branding.primaryColor", color, { shouldValidate: true })
                    }
                  />
                </div>
              </div>
            )}

            {errors.branding?.primaryColor && (
              <p className="text-sm text-red-500">{errors.branding.primaryColor.message}</p>
            )}
          </div>

          <div className="space-y-[6px]">
            <Label>{restaurants("secondaryColor")}</Label>
            <div className="flex gap-2">
              <div
                className="size-[52px] rounded-md shrink-0 border cursor-pointer"
                style={{ backgroundColor: secondaryColor }}
                onClick={() => setOpenPicker(openPicker === "secondary" ? null : "secondary")}
              />
              <Input
                placeholder="#000000"
                className={`h-[52px] border-[#BBBBBB] ${errors.branding?.secondaryColor ? 'border-red-500' : ''}`}
                value={secondaryColor}
                onChange={(e) =>
                  setValue("branding.secondaryColor", e.target.value, { shouldValidate: true })
                }
              />
            </div>

            {openPicker === "secondary" && (
              <div className="relative z-50 mt-2">
                <div className="fixed inset-0" onClick={() => setOpenPicker(null)} />
                <div className="absolute top-0 left-0">
                  <HexColorPicker
                    color={secondaryColor}
                    onChange={(color) =>
                      setValue("branding.secondaryColor", color, { shouldValidate: true })
                    }
                  />
                </div>
              </div>
            )}

            {errors.branding?.secondaryColor && (
              <p className="text-sm text-red-500">{errors.branding.secondaryColor.message}</p>
            )}
          </div>
        </div>

        <FormGroup
          label={restaurants("fontFamily")}
          placeholder="Inter"
          error={errors.branding?.fontFamily?.message}
          {...register("branding.fontFamily")}
        />
      </FormSection>

      <div className="flex gap-4 justify-end pt-8">
        <Button
          type="button"
          variant="outline"
          className="h-[52px] rounded-[12px] px-8"
          onClick={() => router.back()}
        >
          {common("cancel")}
        </Button>

      <Button
  type="submit"
  disabled={isPending || uploading}
  variant="primary"
  className="h-[52px] px-8 disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isPending
    ? common("saving")
    : uploading
    ? restaurants("uploading")
    : mode === 'edit'
    ? restaurants("updateRestaurant")
    : restaurants("saveActivate")}
</Button>
      </div>
    </form>
  )
}

function FormSection({
  label,
  children
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-[48px]">
      <div className="lg:col-span-4">
        <div className="flex items-center gap-[12px] text-primary">
          <Info size={18} className="text-gray" />
          <span className="text-base font-semibold text-[#646982]">{label}</span>
        </div>
      </div>
      <div className="lg:col-span-8 space-y-[24px]">
        {children}
      </div>
    </div>
  )
}

function FormGroup({
  label,
  placeholder,
  error,
  ...props
}: any) {
  return (
    <div className="space-y-[8px] w-full">
      <Label>{label}</Label>
      <Input
        placeholder={placeholder}
        className={`h-[52px] border-[#BBBBBB] focus:border-primary ${error ? 'border-red-500' : ''}`}
        {...props}
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  )
}
