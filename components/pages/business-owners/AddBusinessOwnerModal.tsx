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

import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { registerTenantSchema, updateTenantSchema } from "@/validations/tenants";
import {
  useRegisterTenant,
  useUpdateTenant,
} from "@/hooks/useTenants";
import { useFileUpload } from "@/hooks/useFileUpload";

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

type ApiErrorResponse = {
  message?: string;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof AxiosError) {
    return (
      (error.response?.data as ApiErrorResponse | undefined)?.message ||
      "Something went wrong"
    );
  }

  if (error instanceof Error) {
    return error.message || "Something went wrong";
  }

  return "Something went wrong";
};

export function AddBusinessOwnerModal({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: Props) {
  const { uploadFile, uploading } = useFileUpload();

  const createMutation = useRegisterTenant();
  const updateMutation = useUpdateTenant();

  const [loading, setLoading] = useState(false);

  const isEdit = !!initialData;

  const [form, setForm] = useState({
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

  /* ---------- Prefill ---------- */
  useEffect(() => {
    if (initialData && open) {
      setForm({
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
  const handleAvatarFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadFile(file);
    if (url) handleChange("avatarUrl", url);
  };

  const handleTenantLogoFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadFile(file);
    if (url) handleChange("tenantLogoUrl", url);
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
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[100vh] max-w-[460px] overflow-auto rounded-[20px] p-6">
        <DialogHeader className="space-y-1 text-center">
          <DialogTitle className="text-xl font-semibold">
            {isEdit ? "Edit Business Owner" : "Business Owner Invitation"}
          </DialogTitle>
          <DialogDescription className="text-left text-sm text-gray-500">
            {isEdit
              ? "Update business owner details"
              : "Create a new business owner account"}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          <FormField
            label="Email *"
            value={form.email}
            onChange={(v) => handleChange("email", v)}
            disabled={isEdit}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="First Name *"
              value={form.firstName}
              onChange={(v) => handleChange("firstName", v)}
              disabled={isEdit}
            />
            <FormField
              label="Last Name *"
              value={form.lastName}
              onChange={(v) => handleChange("lastName", v)}
              disabled={isEdit}
            />
          </div>

          {!isEdit && (
            <FormField
              label="Password *"
              value={form.password}
              onChange={(v) => handleChange("password", v)}
            />
          )}

          <FormField
            label="Business Name *"
            value={form.tenantName}
            onChange={(v) => handleChange("tenantName", v)}
          />

          <FormField
            label="Business Slug *"
            value={form.tenantSlug}
            onChange={(v) => handleChange("tenantSlug", v)}
          />

          <div>
            <label className="text-sm font-medium">Owner Avatar</label>
            <Input
              type="file"
              onChange={handleAvatarFile}
              disabled={isEdit}
              className="mt-1 h-[40px] rounded-lg border border-gray-400 pt-1 transition-all duration-200
focus-visible:border-red-500
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-red-500"
            />
            {uploading && (
              <p className="mt-1 text-xs text-gray-400">Uploading...</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Business Logo</label>
            <Input
              type="file"
              onChange={handleTenantLogoFile}
              className="mt-1 h-[40px] rounded-lg border border-gray-400 pt-1 transition-all duration-200
focus-visible:border-red-500
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-red-500"
            />
            {uploading && (
              <p className="mt-1 text-xs text-gray-400">Uploading...</p>
            )}
          </div>

          {!isEdit && (
            <FormField
              label="Owner Bio"
              value={form.bio}
              onChange={(v) => handleChange("bio", v)}
            />
          )}

          <FormField
            label="Business Bio"
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
              ? "Updating..."
              : "Creating..."
            : isEdit
            ? "Update Business Owner"
            : "Create Business Owner"}
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
