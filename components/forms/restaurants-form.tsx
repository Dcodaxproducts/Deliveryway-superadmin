'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Info, Image as ImageIcon, X, Loader2 } from "lucide-react"
import { HexColorPicker } from "react-colorful"
import { useRouter } from 'next/navigation'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { restaurantSchema, type RestaurantValues } from "@/validations/restaurant"
import { useCreateRestaurant, useUpdateRestaurant } from "@/hooks/useRestaurant"
import { useFileUpload } from '@/hooks/useFileUpload'

interface RestaurantFormProps {
  mode?: 'create' | 'edit'
  restaurantId?: string
  initialData?: any
}

type UploadTarget = 'logo' | 'cover' | null

export default function RestaurantForm({
  mode = 'create',
  restaurantId,
  initialData
}: RestaurantFormProps) {
  const router = useRouter()
  const createMutation = useCreateRestaurant()
  const updateMutation = useUpdateRestaurant()

  const logoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const { uploadFile, uploading, progress } = useFileUpload()
  const [uploadingTarget, setUploadingTarget] = useState<UploadTarget>(null)
  const [openPicker, setOpenPicker] = useState<"primary" | "secondary" | null>(null)
const [logoPreviewBlob, setLogoPreviewBlob] = useState("")
const [coverPreviewBlob, setCoverPreviewBlob] = useState("")
  const mutate =
    mode === 'edit' && restaurantId
      ? (data: any) => updateMutation.mutate({ id: restaurantId, data })
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

const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
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

const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
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
const removeLogo = (e: React.MouseEvent) => {
  e.stopPropagation()

  if (logoPreviewBlob?.startsWith("blob:")) {
    URL.revokeObjectURL(logoPreviewBlob)
  }

  setLogoPreviewBlob("")
  setValue("logoUrl", "", { shouldValidate: true, shouldDirty: true })

  if (logoInputRef.current) logoInputRef.current.value = ""
}

const removeCover = (e: React.MouseEvent) => {
  e.stopPropagation()

  if (coverPreviewBlob?.startsWith("blob:")) {
    URL.revokeObjectURL(coverPreviewBlob)
  }

  setCoverPreviewBlob("")
  setValue("coverImage", "", { shouldValidate: true, shouldDirty: true })

  if (coverInputRef.current) coverInputRef.current.value = ""
}

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (formErrors) => console.log(formErrors))}
      className="p-[30px] space-y-[48px] bg-white rounded-[14px]"
    >
      <FormSection label="Setup Basic Info">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
          <FormGroup
            label="Restaurant Name *"
            placeholder="Pizza Hut"
            error={errors.name?.message}
            {...register("name")}
          />
          <FormGroup
            label="Slug *"
            placeholder="pizza-hut"
            error={errors.slug?.message}
            {...register("slug")}
          />
        </div>

        <FormGroup
          label="Tenant ID *"
          placeholder="cmmoib..."
          error={errors.tenantId?.message}
          {...register("tenantId")}
        />

  <div className="space-y-[6px]">
  <Label>Logo Upload *</Label>
  <input
    type="file"
    className="hidden"
    ref={logoInputRef}
    onChange={handleLogoChange}
    accept="image/*"
  />

  <div onClick={() => !uploading && logoInputRef.current?.click()}>
    <UploadBox
    type="logo"
      preview={logoPreview}
      onRemove={removeLogo}
      selectedText="Logo selected"
      emptyTitle="Click to upload logo"
      emptyHint="JPG, JPEG, PNG less than 1MB"
      previewHeight="h-[240px]"
    />
  </div>

  {uploading && uploadingTarget === 'logo' && (
    <p className="text-sm text-gray-500 flex items-center gap-2">
      <Loader2 className="size-4 animate-spin" />
      Uploading logo... {progress > 0 ? `${progress}%` : ""}
    </p>
  )}

  {errors.logoUrl && (
    <p className="text-sm text-red-500 mt-1">{errors.logoUrl.message}</p>
  )}

  <Input type="hidden" {...register("logoUrl")} />
</div>

<div className="space-y-[6px]">
  <Label>Cover Image</Label>
  <input
    type="file"
    className="hidden"
    ref={coverInputRef}
    onChange={handleCoverChange}
    accept="image/*"
  />

  <div onClick={() => !uploading && coverInputRef.current?.click()}>
    <UploadBox
     type="cover"
      preview={coverPreview}
      onRemove={removeCover}
      selectedText="Cover selected"
      emptyTitle="Click to upload cover image"
      emptyHint="Recommended wide banner image"
      previewHeight="h-[260px]"
    />
  </div>

  {uploading && uploadingTarget === 'cover' && (
    <p className="text-sm text-gray-500 flex items-center gap-2">
      <Loader2 className="size-4 animate-spin" />
      Uploading cover image... {progress > 0 ? `${progress}%` : ""}
    </p>
  )}

  {errors.coverImage && (
    <p className="text-sm text-red-500 mt-1">{errors.coverImage.message}</p>
  )}

  <Input type="hidden" {...register("coverImage")} />
</div>
        <FormGroup
          label="Tagline"
          placeholder="Best pizza in town"
          error={errors.tagline?.message}
          {...register("tagline")}
        />

        <FormGroup
          label="Bio"
          placeholder="Tell us about your brand"
          error={errors.bio?.message}
          {...register("bio")}
        />
      </FormSection>

      <FormSection label="Support & Contact">
        <FormGroup
          label="Support Email"
          placeholder="support@brand.com"
          error={errors.supportContact?.email?.message}
          {...register("supportContact.email")}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
          <FormGroup
            label="WhatsApp"
            placeholder="+92300..."
            error={errors.supportContact?.whatsapp?.message}
            {...register("supportContact.whatsapp")}
          />

          <FormGroup
            label="Phone"
            placeholder="+92300..."
            error={errors.supportContact?.phone?.message}
            {...register("supportContact.phone")}
          />
        </div>
      </FormSection>

      <FormSection label="Domain & Visibility">
        <FormGroup
          label="Custom Domain"
          placeholder="www.yourdomain.com"
          error={errors.customDomain?.message}
          {...register("customDomain")}
        />
      </FormSection>

      <FormSection label="Branding (Quick Setup)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
          <div className="space-y-[6px]">
            <Label>Primary Color</Label>
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
            <Label>Secondary Color</Label>
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
          label="Font Family"
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
          Cancel
        </Button>

      <Button
  type="submit"
  disabled={isPending || uploading}
  variant="primary"
  className="h-[52px] px-8 disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isPending
    ? 'Saving...'
    : uploading
    ? 'Uploading...'
    : mode === 'edit'
    ? 'Update Restaurant'
    : 'Save & Activate'}
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



function UploadBox({
  preview,
  onRemove,
  selectedText,
  emptyTitle,
  emptyHint,
  previewHeight = "h-[220px]",
  type = "cover",
}: {
  preview?: string;
  onRemove: (e: React.MouseEvent<HTMLButtonElement>) => void;
  selectedText: string;
  emptyTitle: string;
  emptyHint: string;
  previewHeight?: string;
  type?: "logo" | "cover";
}) {
  /* ================= LOGO PREVIEW (NO PARENT BOX) ================= */
  if (type === "logo" && preview) {
    return (
      <div className="relative w-[120px] h-[120px] rounded-full bg-white shadow-lg border flex items-center justify-center">
        <img
          src={preview}
          alt={selectedText}
          className="w-full h-full object-cover rounded-full"
        />

        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 z-10 inline-flex items-center justify-center rounded-full bg-gray-300 p-1.5 text-red-600 shadow hover:bg-white"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  /* ================= PARENT BOX (ONLY FOR EMPTY OR COVER) ================= */
  return (
    <div
      className={`relative overflow-hidden border-2 border-dashed border-gray-300 rounded-[16px] bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-center ${previewHeight}`}
    >
      {preview ? (
        /* ================= COVER PREVIEW ================= */
        <div className="relative w-full h-full">
          <img
            src={preview}
            alt={selectedText}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-4">
            <p className="text-sm font-medium text-white">{selectedText}</p>
          </div>

          <button
            type="button"
            onClick={onRemove}
            className="absolute top-3 right-3 z-10 inline-flex items-center justify-center rounded-full bg-white/90 p-2 text-red-600 shadow hover:bg-white"
          >
            <X size={16} />
          </button>
        </div>
      ) : type === "logo" ? (
        /* ================= LOGO EMPTY ================= */
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-[120px] h-[120px] rounded-full border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center hover:bg-gray-100 transition">
            <ImageIcon size={26} className="text-gray-300 mb-1" />
            <p className="text-xs text-gray-500 px-2">{emptyTitle}</p>
          </div>

          <p className="text-[11px] text-gray-400 mt-2">{emptyHint}</p>
        </div>
      ) : (
        /* ================= COVER EMPTY ================= */
        <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center">
          <ImageIcon size={42} className="text-gray-300 mb-4" />

          <p className="text-lg font-semibold text-gray-700 mb-1">
            <span className="text-primary">{emptyTitle}</span>
          </p>

          <p className="text-sm text-gray-500">{emptyHint}</p>
        </div>
      )}
    </div>
  );
}