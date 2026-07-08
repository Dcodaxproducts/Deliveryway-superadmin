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
import { useGetRestaurantBranches, useGetRestaurants } from "@/hooks/useRestaurant";
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
  const restaurantsQuery = useGetRestaurants({ page: 1, limit: 100, includeInactive: false });

  const [loading, setLoading] = useState(false);

  const roles = rolesData?.data || [];
  const restaurants = normalizeList(restaurantsQuery.data);

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
  const [restaurantSelectValue, setRestaurantSelectValue] = useState("");
  const [branchSelectValue, setBranchSelectValue] = useState("");
  const selectedRestaurantIds = parseIdList(form.restaurantIds);
  const selectedBranchIds = parseIdList(form.branchIds);
  const activeBranchRestaurantId = restaurantSelectValue || selectedRestaurantIds[0] || "";
  const branchesQuery = useGetRestaurantBranches(activeBranchRestaurantId);
  const branches = normalizeList(branchesQuery.data);

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
      setRestaurantSelectValue("");
      setBranchSelectValue("");
    }
  }, [open]);

  /* ---------- Change ---------- */
  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addListValue = (current: string, value: string) => {
    const values = parseIdList(current);
    if (!value || values.includes(value)) return current;
    return [...values, value].join(", ");
  };

  const removeListValue = (current: string, value: string) =>
    parseIdList(current).filter((item) => item !== value).join(", ");

  const getRestaurantLabel = (id: string) => {
    const item = restaurants.find((restaurant) => restaurant.id === id);
    return item?.name || item?.restaurantName || id;
  };

  const getBranchLabel = (id: string) => {
    const item = branches.find((branch) => branch.id === id);
    return item?.name || item?.branchName || id;
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

          <AccessPicker
            label={employeeSettings("restaurantIds")}
            placeholder={employeeSettings("selectRestaurant")}
            value={restaurantSelectValue}
            options={restaurants.filter((restaurant) => !selectedRestaurantIds.includes(restaurant.id))}
            getLabel={(item) => item.name || item.restaurantName || item.id}
            onChange={setRestaurantSelectValue}
            onAdd={() => {
              handleChange("restaurantIds", addListValue(form.restaurantIds, restaurantSelectValue));
              setRestaurantSelectValue("");
            }}
            selected={selectedRestaurantIds}
            getSelectedLabel={getRestaurantLabel}
            onRemove={(id) => {
              handleChange("restaurantIds", removeListValue(form.restaurantIds, id));
              if (restaurantSelectValue === id) setRestaurantSelectValue("");
            }}
          />

          <AccessPicker
            label={employeeSettings("branchIds")}
            placeholder={activeBranchRestaurantId ? employeeSettings("selectBranch") : employeeSettings("selectRestaurantFirst")}
            value={branchSelectValue}
            options={branches.filter((branch) => !selectedBranchIds.includes(branch.id))}
            getLabel={(item) => item.name || item.branchName || item.id}
            onChange={setBranchSelectValue}
            onAdd={() => {
              handleChange("branchIds", addListValue(form.branchIds, branchSelectValue));
              setBranchSelectValue("");
            }}
            selected={selectedBranchIds}
            getSelectedLabel={getBranchLabel}
            onRemove={(id) => handleChange("branchIds", removeListValue(form.branchIds, id))}
            disabled={!activeBranchRestaurantId}
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

type SelectableAccessOption = {
  id: string;
  name?: string;
  restaurantName?: string;
  branchName?: string;
};

const normalizeList = (response: unknown): SelectableAccessOption[] => {
  if (Array.isArray(response)) return response as SelectableAccessOption[];
  if (!response || typeof response !== "object") return [];

  const record = response as { data?: unknown; items?: unknown };
  if (Array.isArray(record.data)) return record.data as SelectableAccessOption[];
  if (Array.isArray(record.items)) return record.items as SelectableAccessOption[];

  if (record.data && typeof record.data === "object") {
    const dataRecord = record.data as { data?: unknown; items?: unknown };
    if (Array.isArray(dataRecord.data)) return dataRecord.data as SelectableAccessOption[];
    if (Array.isArray(dataRecord.items)) return dataRecord.items as SelectableAccessOption[];
  }

  return [];
};

function AccessPicker({
  label,
  placeholder,
  value,
  options,
  selected,
  disabled,
  getLabel,
  getSelectedLabel,
  onChange,
  onAdd,
  onRemove,
}: {
  label: string;
  placeholder: string;
  value: string;
  options: SelectableAccessOption[];
  selected: string[];
  disabled?: boolean;
  getLabel: (item: SelectableAccessOption) => string;
  getSelectedLabel: (id: string) => string;
  onChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex gap-2">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="h-[44px] min-w-0 flex-1 rounded-lg border border-gray-400 px-3 text-sm transition-all duration-200 focus-visible:border-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {getLabel(option)}
            </option>
          ))}
        </select>
        <Button type="button" variant="outline" onClick={onAdd} disabled={!value || disabled}>
          Add
        </Button>
      </div>
      {selected.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {selected.map((id) => (
            <span key={id} className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {getSelectedLabel(id)}
              <button type="button" onClick={() => onRemove(id)} className="text-primary/70 hover:text-primary">
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
