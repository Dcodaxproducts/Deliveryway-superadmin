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
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { createStaffSchema } from "@/validations/employees";
import {
  useCreateStaff,
  useUpdateStaff,
  useGetStaffRoles,
} from "@/hooks/useEmployees";
import { useFileUpload } from "@/hooks/useFileUpload";
import { parseIdList, stringifyIdList } from "@/lib/staff-access";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
  onSuccess?: () => void;
};

export default function EmployeeInvitationModal({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: Props) {
  const common = useTranslations("common");
  const employeeSettings = useTranslations("employeeSettings");
  const validation = useTranslations("validation");
  const toasts = useTranslations("toasts");
  const { uploadFile, uploading, progress } = useFileUpload();

  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();

  const { data: rolesData } = useGetStaffRoles();

  const [loading, setLoading] = useState(false);

  const roles = rolesData?.data || [];

  const isEdit = !!initialData;

  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    staffRoleId: "",
    phone: "",
    avatarUrl: "",
    bio: "",
    restaurantIds: "",
    branchIds: "",
    isActive: true,
  });

  /* ---------- Prefill ---------- */
  useEffect(() => {
    if (initialData && open) {
      setForm({
        email: initialData.email || "",
        password: initialData.password || "",
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        staffRoleId: initialData.staffRoleId || "",
        phone: initialData.phone || "",
        avatarUrl: initialData.avatarUrl || "",
        bio: initialData.bio || "",
        restaurantIds: stringifyIdList(initialData.restaurantIds ?? initialData.restaurantAccess?.restaurantIds),
        branchIds: stringifyIdList(initialData.branchIds ?? initialData.restaurantAccess?.branchIds),
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
        staffRoleId: "",
        phone: "",
        avatarUrl: "",
        bio: "",
        restaurantIds: "",
        branchIds: "",
        isActive: true,
      });
    }
  }, [open]);

  /* ---------- Change ---------- */
  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* ---------- Upload ---------- */
  const handleFile = async (file: File) => {
    if (!file) return;

    const url = await uploadFile(file);
    if (url) handleChange("avatarUrl", url);
  };

  /* ---------- Submit ---------- */
const handleSubmit = async () => {
  try {
    setLoading(true);

    /**
     * ✅ Prepare payload (FIXED)
     */
    const payload = {
      ...form,
      restaurantIds: parseIdList(form.restaurantIds),
      branchIds: parseIdList(form.branchIds),
      ...(isEdit ? {password: form.password} : { password: form.password }),
    };

    /**
     * ✅ Zod validation (IMPROVED)
     */
    const parsed = createStaffSchema(validation).safeParse(payload);

    if (!parsed.success) {
      const errors = parsed.error.errors;

      // 🔍 Debug full error in console
      console.log("Zod Errors:", errors);

      // ✅ Show all errors in one toast
      const message = errors
        .map((e) => `${e.path.join(".")} - ${e.message}`)
        .join("\n");

      toast.error(message);
      return;
    }

    /**
     * ✅ API Call
     */
    if (isEdit) {
      await updateMutation.mutateAsync({
        id: initialData.id,
        data: payload,
      });
    } else {
      await createMutation.mutateAsync(payload);
    }

  

    onSuccess?.();
    onOpenChange(false);
  } catch (err: any) {
    console.error("API Error:", err);

    toast.error(
      err?.response?.data?.message || toasts("somethingWentWrong")
    );
  } finally {
    setLoading(false);
  }
};
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[460px] rounded-[20px] p-6 max-h-[100vh] overflow-auto">
        {/* Header */}
        <DialogHeader className="text-center space-y-1">
          <DialogTitle className="text-xl font-semibold">
            {isEdit
              ? employeeSettings("editEmployee")
              : employeeSettings("employeeInvitation")}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 text-left">
            {isEdit
              ? employeeSettings("updateEmployeeDetails")
              : employeeSettings("sendInvitationDescription")}
          </DialogDescription>
        </DialogHeader>

        {/* Form */}
        <div className="mt-6 space-y-4">
          <FormField
            label={employeeSettings("emailRequired")}
            value={form.email}
            onChange={(v) => handleChange("email", v)}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormField
              label={employeeSettings("firstNameRequired")}
              value={form.firstName}
              onChange={(v) => handleChange("firstName", v)}
            />
            <FormField
              label={employeeSettings("lastNameRequired")}
              value={form.lastName}
              onChange={(v) => handleChange("lastName", v)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField
              label={employeeSettings("phone")}
              value={form.phone}
              onChange={(v) => handleChange("phone", v)}
            />
            {/* {!isEdit && ( */}
              <FormField
                label={employeeSettings("passwordRequired")}
                value={form.password}
                onChange={(v) => handleChange("password", v)}
              />
            {/* )} */}
          </div>

          {/* Role Dropdown */}
          <div>
            <label className="text-sm font-medium">{employeeSettings("roleRequired")}</label>
            <select
              value={form.staffRoleId}
              onChange={(e) =>
                handleChange("staffRoleId", e.target.value)
              }
              className="mt-1 h-[44px] w-full rounded-lg border border-gray-400 px-3 text-sm focus-visible:outline-none 
focus-visible:ring-2 
focus-visible:ring-red-500 
focus-visible:border-red-500 
transition-all duration-200"
            >
              <option value="">{employeeSettings("selectRole")}</option>
              {roles.map((r: any) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Avatar Upload */}
          <div>
            <label className="text-sm font-medium">{employeeSettings("avatar")}</label>
            <PremiumImageDropzone
              alt={employeeSettings("avatar")}
              emptyHint={employeeSettings("avatar")}
              emptyTitle={employeeSettings("avatar")}
              onFileSelect={handleFile}
              onRemove={() => handleChange("avatarUrl", "")}
              preview={form.avatarUrl}
              progress={progress}
              selectedText={employeeSettings("avatar")}
              uploading={uploading}
              uploadText={employeeSettings("uploading")}
              variant="avatar"
            />
          </div>

          <FormField
            label={employeeSettings("bio")}
            value={form.bio}
            onChange={(v) => handleChange("bio", v)}
          />

          <FormField
            label={employeeSettings("restaurantIds")}
            value={form.restaurantIds}
            onChange={(v) => handleChange("restaurantIds", v)}
          />

          <FormField
            label={employeeSettings("branchIds")}
            value={form.branchIds}
            onChange={(v) => handleChange("branchIds", v)}
          />
        </div>

        {/* CTA */}
        <Button
          onClick={handleSubmit}
          disabled={loading || uploading}
          className="mt-6 w-full h-[46px] rounded-xl bg-primary text-white hover:bg-red-600"
        >
          {loading
            ? isEdit
              ? employeeSettings("updating")
              : employeeSettings("sending")
            : isEdit
            ? employeeSettings("updateEmployee")
            : employeeSettings("sendInvitation")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Reusable Field ---------- */
function FormField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[44px] rounded-lg border border-gray-400 
focus-visible:outline-none 
focus-visible:ring-2 
focus-visible:ring-red-500 
focus-visible:border-red-500 
transition-all duration-200"
      />
    </div>
  );
}
