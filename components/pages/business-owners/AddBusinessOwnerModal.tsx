"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PremiumImageDropzone } from "@/components/forms/PremiumImageDropzone";

import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { createRegisterTenantSchema, createUpdateTenantSchema } from "@/validations/tenants";
import {
  useRegisterTenant,
  useUpdateTenant,
} from "@/hooks/useTenants";
import { useGetPackagePlans } from "@/hooks/usePackagePlans";
import { useFileUpload } from "@/hooks/useFileUpload";
import type { PackagePlan } from "@/services/packagePlans";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: BusinessOwnerModalData;
  onSuccess?: () => void;
};

type BusinessOwnerModalData = {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  name?: string;
  slug?: string;
  logoUrl?: string;
  isActive?: boolean;
  user?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    bio?: string;
  };
  tenant?: {
    name?: string;
    slug?: string;
    logoUrl?: string;
    bio?: string;
  };
};

type FormValues = {
  packagePlanId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  bio: string;
  tenantName: string;
  tenantSlug: string;
  tenantLogoUrl: string;
  tenantBio: string;
  isActive: boolean;
};

type UploadTarget = "avatar" | "tenantLogo" | null;

type ApiErrorResponse = {
  message?: string;
};

type ListResponse<T> = {
  data?: T[] | { data?: T[]; items?: T[] };
  items?: T[];
};

const normalizeListResponse = <T,>(response: unknown): T[] => {
  if (Array.isArray(response)) return response as T[];
  if (!response || typeof response !== "object") return [];

  const record = response as ListResponse<T>;

  if (Array.isArray(record.data)) return record.data;
  if (Array.isArray(record.items)) return record.items;

  if (record.data && typeof record.data === "object") {
    if (Array.isArray(record.data.data)) return record.data.data;
    if (Array.isArray(record.data.items)) return record.data.items;
  }

  return [];
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof AxiosError) {
    return (
      (error.response?.data as ApiErrorResponse | undefined)?.message ||
      ""
    );
  }

  if (error instanceof Error) {
    return error.message || "";
  }

  return "";
};

export function AddBusinessOwnerModal({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: Props) {
  const auth = useTranslations("auth");
  const businessOwners = useTranslations("businessOwners");
  const validation = useTranslations("validation");
  const toasts = useTranslations("toasts");
  const { uploadFile, uploading, progress } = useFileUpload();
  const registerTenantSchema = createRegisterTenantSchema(validation);
  const updateTenantSchema = createUpdateTenantSchema(validation);

  const createMutation = useRegisterTenant();
  const updateMutation = useUpdateTenant();
  const packagePlansQuery = useGetPackagePlans({
    includeInactive: false,
    limit: 100,
    sortBy: "name",
    sortOrder: "ASC",
  });

  const [loading, setLoading] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState<UploadTarget>(null);

  const isEdit = !!initialData;

  const [form, setForm] = useState({
    packagePlanId: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    avatarUrl: "",
    bio: "",

    tenantName: "",
    tenantSlug: "",
    tenantLogoUrl: "",
    tenantBio: "",

    isActive: true,
  });

  const packagePlans = normalizeListResponse<PackagePlan>(
    packagePlansQuery.data
  ).filter((plan) => plan.id && plan.isActive !== false);

  /* ---------- Prefill ---------- */
  useEffect(() => {
    if (initialData && open) {
      setForm({
        packagePlanId: "",
        email: initialData.user?.email || initialData.email || "",
        password: "",
        firstName: initialData.user?.firstName || initialData.firstName || "",
        lastName: initialData.user?.lastName || initialData.lastName || "",
        avatarUrl: initialData.user?.avatarUrl || initialData.avatarUrl || "",
        bio: initialData.user?.bio || initialData.bio || "",

        tenantName: initialData.name || initialData.tenant?.name || "",
        tenantSlug: initialData.slug || initialData.tenant?.slug || "",
        tenantLogoUrl: initialData.logoUrl || initialData.tenant?.logoUrl || "",
        tenantBio: initialData.bio || initialData.tenant?.bio || "",

        isActive: initialData.isActive ?? true,
      });
    }
  }, [initialData, open]);

  /* ---------- Reset ---------- */
  useEffect(() => {
    if (!open) {
      setForm({
        packagePlanId: "",
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        avatarUrl: "",
        bio: "",

        tenantName: "",
        tenantSlug: "",
        tenantLogoUrl: "",
        tenantBio: "",

        isActive: true,
      });
    }
  }, [open]);

  /* ---------- Change ---------- */
  const handleChange = <Key extends keyof FormValues>(
    key: Key,
    value: FormValues[Key]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* ---------- Upload ---------- */
  const handleAvatarFile = async (file: File) => {
    if (!file) return;

    try {
      setUploadingTarget("avatar");
      const url = await uploadFile(file);
      if (url) handleChange("avatarUrl", url);
    } finally {
      setUploadingTarget(null);
    }
  };

  const handleTenantLogoFile = async (file: File) => {
    if (!file) return;

    try {
      setUploadingTarget("tenantLogo");
      const url = await uploadFile(file);
      if (url) handleChange("tenantLogoUrl", url);
    } finally {
      setUploadingTarget(null);
    }
  };

  /* ---------- Submit ---------- */
  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (isEdit) {
        const payload = {
          name: form.tenantName,
          slug: form.tenantSlug,
          bio: form.tenantBio,
          logoUrl: form.tenantLogoUrl,
          socialLinks: {},
          brandingConfig: {},
          settings: {},
          isActive: form.isActive,
        };

        const parsed = updateTenantSchema.safeParse(payload);

        if (!parsed.success) {
          const message = parsed.error.errors
            .map((e) => `${e.path.join(".")} - ${e.message}`)
            .join("\n");

          toast.error(message);
          return;
        }

        await updateMutation.mutateAsync({
          id: initialData.id,
          data: payload,
        });
      } else {
        const payload = {
          packagePlanId: form.packagePlanId,
          user: {
            email: form.email,
            password: form.password,
            firstName: form.firstName,
            lastName: form.lastName,
            avatarUrl: form.avatarUrl,
            bio: form.bio,
          },
          branchAdmin: {
            email: form.email,
            password: form.password,
            firstName: form.firstName,
            lastName: form.lastName,
            phone: "",
          },
          tenant: {
            name: form.tenantName,
            slug: form.tenantSlug,
            logoUrl: form.tenantLogoUrl,
            bio: form.tenantBio,
            socialLinks: {},
            settings: {},
          },
          restaurant: {
            name: form.tenantName,
            slug: form.tenantSlug,
            logoUrl: form.tenantLogoUrl,
            coverImage: "",
            customDomain: "",
            bio: form.tenantBio,
            tagline: "",
            supportContact: {},
            branding: {},
            socialMedia: {},
          },
          branch: {
            name: `${form.tenantName} Main Branch`,
            logoUrl: form.tenantLogoUrl,
            coverImage: "",
            description: form.tenantBio,
            settings: {
              tableReservationsEnabled: false,
              allowedOrderTypes: ["DELIVERY"],
              allowedPaymentMethods: ["COD"],
              deliveryConfig: {
                radiusKm: 0,
                minOrderAmount: 0,
                deliveryFee: 0,
                isFreeDelivery: true,
                freeDeliveryThreshold: 0,
              },
              automation: {
                autoAcceptOrders: true,
                estimatedPrepTime: 0,
              },
              taxation: {
                taxPercentage: 0,
              },
              contact: {
                whatsapp: "",
                phone: "",
              },
            },
            street: "",
            shopNumber: "",
            postalCode: "",
            area: "",
            city: "",
            state: "",
            country: "",
            lat: "",
            lng: "",
          },
        };

        const parsed = registerTenantSchema.safeParse(payload);

        if (!parsed.success) {
          const message = parsed.error.errors
            .map((e) => `${e.path.join(".")} - ${e.message}`)
            .join("\n");

          toast.error(message);
          return;
        }

        await createMutation.mutateAsync(payload);
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (err: unknown) {
      console.error("API Error:", err);
      toast.error(getErrorMessage(err) || toasts("somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[100vh] max-w-[460px] overflow-auto rounded-[20px] p-6">
        <DialogHeader className="space-y-1 text-center">
          <DialogTitle className="text-xl font-semibold">
            {isEdit ? businessOwners("editBusinessOwner") : businessOwners("businessOwnerInvitation")}
          </DialogTitle>
          <DialogDescription className="text-left text-sm text-gray-500">
            {isEdit
              ? businessOwners("updateBusinessOwnerDetails")
              : businessOwners("createBusinessOwnerAccount")}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          {!isEdit && (
            <div className="space-y-1">
              <label className="text-sm font-medium">
                {`${businessOwners("packagePlan")} *`}
              </label>
              <select
                className="h-[44px] w-full rounded-md border px-3 text-sm focus:border-primary focus:outline-none"
                disabled={packagePlansQuery.isLoading || packagePlansQuery.isFetching}
                value={form.packagePlanId}
                onChange={(event) => handleChange("packagePlanId", event.target.value)}
              >
                <option value="">
                  {packagePlansQuery.isLoading || packagePlansQuery.isFetching
                    ? businessOwners("loadingPackagePlans")
                    : businessOwners("selectPackagePlan")}
                </option>
                {packagePlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                    {plan.billingModel ? ` - ${plan.billingModel}` : ""}
                    {plan.planPrice !== undefined && plan.planPrice !== null
                      ? ` (${plan.currency || "PKR"} ${plan.planPrice})`
                      : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <FormField
            label={`${auth("email")} *`}
            value={form.email}
            onChange={(v) => handleChange("email", v)}
            disabled={isEdit}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormField
              label={`${businessOwners("firstName")} *`}
              value={form.firstName}
              onChange={(v) => handleChange("firstName", v)}
              disabled={isEdit}
            />
            <FormField
              label={`${businessOwners("lastName")} *`}
              value={form.lastName}
              onChange={(v) => handleChange("lastName", v)}
              disabled={isEdit}
            />
          </div>

          {!isEdit && (
            <FormField
              label={`${auth("password")} *`}
              value={form.password}
              onChange={(v) => handleChange("password", v)}
            />
          )}

          <FormField
            label={`${businessOwners("businessName")} *`}
            value={form.tenantName}
            onChange={(v) => handleChange("tenantName", v)}
          />

          <FormField
            label={`${businessOwners("businessSlug")} *`}
            value={form.tenantSlug}
            onChange={(v) => handleChange("tenantSlug", v)}
          />

          <div>
            <label className="text-sm font-medium">{businessOwners("ownerAvatar")}</label>
            <PremiumImageDropzone
              alt={businessOwners("ownerAvatar")}
              disabled={isEdit}
              emptyHint={businessOwners("uploadHint")}
              emptyTitle={businessOwners("clickToUpload")}
              onFileSelect={handleAvatarFile}
              onRemove={() => handleChange("avatarUrl", "")}
              preview={form.avatarUrl}
              progress={uploadingTarget === "avatar" ? progress : 0}
              selectedText={businessOwners("imageSelected")}
              uploading={uploading && uploadingTarget === "avatar"}
              uploadText={businessOwners("uploading")}
              variant="avatar"
            />
          </div>

          <div>
            <label className="text-sm font-medium">{businessOwners("businessLogo")}</label>
            <PremiumImageDropzone
              alt={businessOwners("businessLogo")}
              emptyHint={businessOwners("uploadHint")}
              emptyTitle={businessOwners("clickToUpload")}
              onFileSelect={handleTenantLogoFile}
              onRemove={() => handleChange("tenantLogoUrl", "")}
              preview={form.tenantLogoUrl}
              progress={uploadingTarget === "tenantLogo" ? progress : 0}
              selectedText={businessOwners("imageSelected")}
              uploading={uploading && uploadingTarget === "tenantLogo"}
              uploadText={businessOwners("uploading")}
              variant="logo"
            />
          </div>

          {!isEdit && (
            <FormField
              label={businessOwners("ownerBio")}
              value={form.bio}
              onChange={(v) => handleChange("bio", v)}
            />
          )}

          <FormField
            label={businessOwners("businessBio")}
            value={form.tenantBio}
            onChange={(v) => handleChange("tenantBio", v)}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading || uploading}
          className="mt-6 h-[46px] w-full rounded-xl bg-primary text-white hover:bg-red-600"
        >
          {loading
            ? isEdit
              ? businessOwners("updating")
              : businessOwners("creating")
            : isEdit
            ? businessOwners("updateBusinessOwner")
            : businessOwners("createBusinessOwner")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export { AddBusinessOwnerModal as default };

function FormField({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <Input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-[44px] rounded-lg border border-gray-400 transition-all duration-200
focus-visible:border-red-500
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-red-500"
      />
    </div>
  );
}
