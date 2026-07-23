"use client";

import { FormEvent, useState } from "react";
import { ArrowLeft, Save, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { PremiumImageDropzone } from "@/components/forms/PremiumImageDropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useUpdateBusinessOwnerDetails } from "@/hooks/useTenants";
import {
  BusinessOwnerDetails,
  UpdateBusinessOwnerDetailsPayload,
} from "@/services/tenants";

type BusinessOwnerEditFormProps = {
  tenantId: string;
  initialData: BusinessOwnerDetails;
};

type UploadField = "ownerAvatar" | "businessLogo";

export function BusinessOwnerEditForm({
  tenantId,
  initialData,
}: BusinessOwnerEditFormProps) {
  const businessOwners = useTranslations("businessOwners");
  const common = useTranslations("common");
  const validation = useTranslations("validation");
  const router = useRouter();
  const updateMutation = useUpdateBusinessOwnerDetails();
  const { uploadFile, uploading, progress } = useFileUpload();
  const [uploadingField, setUploadingField] = useState<UploadField | null>(null);

  const owner = initialData.owner;
  const profile = owner?.profile;
  const socialLinks = initialData.socialLinks ?? {};

  const [form, setForm] = useState({
    firstName: profile?.firstName ?? "",
    lastName: profile?.lastName ?? "",
    email: owner?.email ?? "",
    phone: profile?.phone ?? "",
    ownerBio: profile?.bio ?? "",
    avatarUrl: profile?.avatarUrl ?? "",
    password: "",
    ownerIsActive: owner?.isActive ?? true,
    ownerIsApproved: owner?.isApproved ?? false,
    ownerIsVerified: owner?.isVerified ?? false,
    businessName: initialData.name ?? "",
    businessBio: initialData.bio ?? "",
    logoUrl: initialData.logoUrl ?? "",
    website: socialLinks.website ?? "",
    facebook: socialLinks.facebook ?? "",
    instagram: socialLinks.instagram ?? "",
    linkedin: socialLinks.linkedin ?? "",
    businessIsActive: initialData.isActive ?? true,
  });

  const updateField = <Key extends keyof typeof form>(
    field: Key,
    value: (typeof form)[Key],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleUpload = async (field: UploadField, file: File) => {
    setUploadingField(field);
    const fileUrl = await uploadFile(file);
    setUploadingField(null);

    if (!fileUrl) return;

    if (field === "ownerAvatar") {
      updateField("avatarUrl", fileUrl);
      return;
    }

    updateField("logoUrl", fileUrl);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error(validation("firstNameRequired"));
      return;
    }
    if (!form.email.trim() || !form.email.includes("@")) {
      toast.error(validation("invalidEmail"));
      return;
    }
    if (form.businessName.trim().length < 2) {
      toast.error(validation("tenantNameRequired"));
      return;
    }
    if (form.password && form.password.length < 8) {
      toast.error(validation("passwordMin"));
      return;
    }

    const payload: UpdateBusinessOwnerDetailsPayload = {
      owner: {
        email: form.email.trim().toLowerCase(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        avatarUrl: form.avatarUrl.trim(),
        bio: form.ownerBio.trim(),
        isActive: form.ownerIsActive,
        isApproved: form.ownerIsApproved,
        isVerified: form.ownerIsVerified,
        ...(form.password ? { password: form.password } : {}),
      },
      tenant: {
        name: form.businessName.trim(),
        bio: form.businessBio.trim(),
        logoUrl: form.logoUrl.trim(),
        socialLinks: {
          website: form.website.trim(),
          facebook: form.facebook.trim(),
          instagram: form.instagram.trim(),
          linkedin: form.linkedin.trim(),
        },
        brandingConfig: initialData.brandingConfig ?? {},
        settings: initialData.settings ?? {},
        isActive: form.businessIsActive,
      },
    };

    await updateMutation.mutateAsync({ tenantId, data: payload });
    router.push(`/business-owners/${tenantId}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:p-7">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-950">
            {businessOwners("ownerAccount")}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {businessOwners("ownerAccountEditDescription")}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <PremiumImageDropzone
            alt={businessOwners("ownerAvatar")}
            emptyTitle={businessOwners("clickToUpload")}
            emptyHint={businessOwners("uploadHint")}
            selectedText={businessOwners("imageSelected")}
            preview={form.avatarUrl}
            progress={uploadingField === "ownerAvatar" ? progress : 0}
            uploading={uploading && uploadingField === "ownerAvatar"}
            disabled={uploading}
            variant="avatar"
            onFileSelect={(file) => void handleUpload("ownerAvatar", file)}
            onRemove={() => updateField("avatarUrl", "")}
          />

          <div className="grid gap-5 md:grid-cols-2">
            <FormField label={businessOwners("firstName")} required>
              <Input
                value={form.firstName}
                onChange={(event) =>
                  updateField("firstName", event.target.value)
                }
              />
            </FormField>
            <FormField label={businessOwners("lastName")} required>
              <Input
                value={form.lastName}
                onChange={(event) =>
                  updateField("lastName", event.target.value)
                }
              />
            </FormField>
            <FormField label={businessOwners("email")} required>
              <Input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
              />
            </FormField>
            <FormField label={businessOwners("phone")}>
              <Input
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
              />
            </FormField>
            <FormField
              label={businessOwners("ownerBio")}
              className="md:col-span-2"
            >
              <Textarea
                value={form.ownerBio}
                onChange={(event) =>
                  updateField("ownerBio", event.target.value)
                }
                className="min-h-28"
              />
            </FormField>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:p-7">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-950">
            {businessOwners("tenantBusiness")}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {businessOwners("businessEditDescription")}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <PremiumImageDropzone
            alt={businessOwners("businessLogo")}
            emptyTitle={businessOwners("clickToUpload")}
            emptyHint={businessOwners("uploadHint")}
            selectedText={businessOwners("imageSelected")}
            preview={form.logoUrl}
            progress={uploadingField === "businessLogo" ? progress : 0}
            uploading={uploading && uploadingField === "businessLogo"}
            disabled={uploading}
            variant="logo"
            onFileSelect={(file) => void handleUpload("businessLogo", file)}
            onRemove={() => updateField("logoUrl", "")}
          />

          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              label={businessOwners("businessName")}
              required
              className="md:col-span-2"
            >
              <Input
                value={form.businessName}
                onChange={(event) =>
                  updateField("businessName", event.target.value)
                }
              />
            </FormField>
            <FormField
              label={businessOwners("businessBio")}
              className="md:col-span-2"
            >
              <Textarea
                value={form.businessBio}
                onChange={(event) =>
                  updateField("businessBio", event.target.value)
                }
                className="min-h-28"
              />
            </FormField>
            <FormField label={businessOwners("website")}>
              <Input
                value={form.website}
                onChange={(event) => updateField("website", event.target.value)}
              />
            </FormField>
            <FormField label={businessOwners("facebook")}>
              <Input
                value={form.facebook}
                onChange={(event) => updateField("facebook", event.target.value)}
              />
            </FormField>
            <FormField label={businessOwners("instagram")}>
              <Input
                value={form.instagram}
                onChange={(event) =>
                  updateField("instagram", event.target.value)
                }
              />
            </FormField>
            <FormField label={businessOwners("linkedin")}>
              <Input
                value={form.linkedin}
                onChange={(event) => updateField("linkedin", event.target.value)}
              />
            </FormField>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:p-7">
        <div className="mb-6 flex items-start gap-3">
          <span className="mt-0.5 rounded-xl bg-primary/10 p-2 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-gray-950">
              {businessOwners("accessAndSecurity")}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {businessOwners("accessAndSecurityDescription")}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <StatusToggle
            label={businessOwners("ownerAccess")}
            description={businessOwners("ownerAccessDescription")}
            checked={form.ownerIsActive}
            onCheckedChange={(checked) =>
              updateField("ownerIsActive", checked)
            }
          />
          <StatusToggle
            label={businessOwners("businessAccess")}
            description={businessOwners("businessAccessDescription")}
            checked={form.businessIsActive}
            onCheckedChange={(checked) =>
              updateField("businessIsActive", checked)
            }
          />
          <StatusToggle
            label={businessOwners("approval")}
            description={businessOwners("approvalEditDescription")}
            checked={form.ownerIsApproved}
            onCheckedChange={(checked) =>
              updateField("ownerIsApproved", checked)
            }
          />
          <StatusToggle
            label={businessOwners("verified")}
            description={businessOwners("verificationEditDescription")}
            checked={form.ownerIsVerified}
            onCheckedChange={(checked) =>
              updateField("ownerIsVerified", checked)
            }
          />
        </div>

        <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50 p-4">
          <FormField label={businessOwners("setNewPassword")}>
            <PasswordInput
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              placeholder={businessOwners("passwordLeaveBlank")}
              autoComplete="new-password"
            />
          </FormField>
          <p className="mt-2 text-xs leading-5 text-amber-800">
            {businessOwners("passwordSecurityNotice")}
          </p>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/business-owners/${tenantId}`)}
        >
          <ArrowLeft />
          {common("cancel")}
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={updateMutation.isPending || uploading}
        >
          <Save />
          {updateMutation.isPending
            ? common("saving")
            : businessOwners("updateBusinessOwnerDetails")}
        </Button>
      </div>
    </form>
  );
}

function FormField({
  label,
  required = false,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label>
        {label}
        {required ? <span className="ml-1 text-primary">*</span> : null}
      </Label>
      {children}
    </div>
  );
}

function StatusToggle({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50/70 p-4">
      <div>
        <p className="font-medium text-gray-950">{label}</p>
        <p className="mt-1 text-xs leading-5 text-gray-500">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
