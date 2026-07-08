"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useCreatePackageSubscription,
  useGetPackagePlans,
  useUpdatePackageSubscription,
} from "@/hooks/usePackagePlans";
import { useGetTenants } from "@/hooks/useTenants";
import { useGetRestaurants } from "@/hooks/useRestaurant";

type SubscriptionStatus =
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELLED"
  | "EXPIRED";

type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED";

type PackageSubscriptionRow = {
  id: string;
  tenantId?: string | null;
  restaurantId?: string | null;
  packagePlanId: string;
  paymentStatus?: string | null;
  status: string;
  startsAt?: string | null;
  endsAt?: string | null;
  nextBillingAt?: string | null;
  payoutCycleOverride?: string | null;
  note?: string | null;
  tenant?: {
    id: string;
    name?: string | null;
    email?: string | null;
    identifier?: string | null;
  } | null;
  restaurant?: {
    id: string;
    name?: string | null;
    email?: string | null;
    identifier?: string | null;
  } | null;
};

type PackagePlanOption = {
  id: string;
  name: string;
  billingModel?: string;
  billingInterval?: string;
  planPrice?: string | number;
  currency?: string;
};

type TenantOption = {
  id: string;
  name?: string | null;
  email?: string | null;
  identifier?: string | null;
  businessName?: string | null;
  companyName?: string | null;
};

type RestaurantOption = {
  id: string;
  name?: string | null;
  email?: string | null;
  identifier?: string | null;
  restaurantName?: string | null;
};

type ListResponse<T> = {
  data?: T[] | { data?: T[]; items?: T[] };
  items?: T[];
};

type SubscriptionModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: PackageSubscriptionRow | null;
};

type SubscriptionFormState = {
  tenantId: string;
  restaurantId: string;
  packagePlanId: string;
  paymentStatus: PaymentStatus;
  status: SubscriptionStatus;
  startsAt: string;
  endsAt: string;
  nextBillingAt: string;
  payoutCycleOverride: string;
  note: string;
};

const defaultForm: SubscriptionFormState = {
  tenantId: "",
  restaurantId: "",
  packagePlanId: "",
  paymentStatus: "PENDING",
  status: "ACTIVE",
  startsAt: "",
  endsAt: "",
  nextBillingAt: "",
  payoutCycleOverride: "",
  note: "",
};

const SEARCH_DEBOUNCE_MS = 350;

const useDebouncedValue = <T,>(value: T, delay = SEARCH_DEBOUNCE_MS) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      window.clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

const toDateInputValue = (value?: string | null) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
};

const toIsoOrUndefined = (value: string) => {
  if (!value) return undefined;

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return undefined;

  return date.toISOString();
};

const normalizeSubscriptionStatus = (status?: string | null): SubscriptionStatus => {
  if (status === "TRIALING") return "TRIALING";
  if (status === "PAST_DUE") return "PAST_DUE";
  if (status === "CANCELLED") return "CANCELLED";
  if (status === "EXPIRED") return "EXPIRED";

  return "ACTIVE";
};

const normalizePaymentStatus = (status?: string | null): PaymentStatus => {
  if (status === "PAID") return "PAID";
  if (status === "FAILED") return "FAILED";
  if (status === "CANCELLED") return "CANCELLED";

  return "PENDING";
};

const normalizeListResponse = <T,>(response: unknown): T[] => {
  if (Array.isArray(response)) return response as T[];

  if (!response || typeof response !== "object") return [];

  const record = response as ListResponse<T>;

  if (Array.isArray(record.data)) return record.data;
  if (Array.isArray(record.items)) return record.items;

  if (
    record.data &&
    typeof record.data === "object" &&
    !Array.isArray(record.data)
  ) {
    if (Array.isArray(record.data.data)) return record.data.data;
    if (Array.isArray(record.data.items)) return record.data.items;
  }

  return [];
};

const getTenantLabel = (tenant: TenantOption) => {
  return (
    tenant.name ||
    tenant.businessName ||
    tenant.companyName ||
    tenant.email ||
    tenant.identifier ||
    tenant.id
  );
};

const getTenantMeta = (tenant: TenantOption) => {
  return tenant.email || tenant.identifier || tenant.id;
};

const getRestaurantLabel = (restaurant: RestaurantOption) => {
  return (
    restaurant.name ||
    restaurant.restaurantName ||
    restaurant.email ||
    restaurant.identifier ||
    restaurant.id
  );
};

const getRestaurantMeta = (restaurant: RestaurantOption) => {
  return restaurant.email || restaurant.identifier || restaurant.id;
};

const mergeSelectedTenant = (
  tenants: TenantOption[],
  initialData?: PackageSubscriptionRow | null
) => {
  if (!initialData?.tenantId) return tenants;

  const exists = tenants.some((tenant) => tenant.id === initialData.tenantId);
  if (exists) return tenants;

  return [
    {
      id: initialData.tenantId,
      name: initialData.tenant?.name || initialData.tenantId,
      email: initialData.tenant?.email || "",
      identifier: initialData.tenant?.identifier || "",
    },
    ...tenants,
  ];
};

const mergeSelectedRestaurant = (
  restaurants: RestaurantOption[],
  initialData?: PackageSubscriptionRow | null
) => {
  if (!initialData?.restaurantId) return restaurants;

  const exists = restaurants.some(
    (restaurant) => restaurant.id === initialData.restaurantId
  );

  if (exists) return restaurants;

  return [
    {
      id: initialData.restaurantId,
      name: initialData.restaurant?.name || initialData.restaurantId,
      email: initialData.restaurant?.email || "",
      identifier: initialData.restaurant?.identifier || "",
    },
    ...restaurants,
  ];
};

export function SubscriptionModal({
  open,
  onOpenChange,
  initialData,
}: SubscriptionModalProps) {
  const pricingModel = useTranslations("pricingModel");
  const common = useTranslations("common");
  const filters = useTranslations("filters");
  const isEditMode = Boolean(initialData?.id);

  const [form, setForm] = useState<SubscriptionFormState>(defaultForm);
  const [tenantSearch, setTenantSearch] = useState("");
  const [restaurantSearch, setRestaurantSearch] = useState("");

  const debouncedTenantSearch = useDebouncedValue(tenantSearch.trim());
  const debouncedRestaurantSearch = useDebouncedValue(restaurantSearch.trim());

  const createSubscription = useCreatePackageSubscription();
  const updateSubscription = useUpdatePackageSubscription();

  const packagePlansQuery = useGetPackagePlans({
    page: 1,
    limit: 100,
    includeInactive: false,
    withDeleted: false,
    sortBy: "createdAt",
    sortOrder: "DESC",
  });

  const tenantsQuery = useGetTenants({
    page: 1,
    limit: 20,
    search: debouncedTenantSearch || undefined,
    sortOrder: "DESC",
    includeInactive: false,
    withDeleted: false,
  });

  const restaurantsQuery = useGetRestaurants({
    page: 1,
    search: debouncedRestaurantSearch || undefined,
    includeInactive: false,
  });

  const packagePlans = useMemo(() => {
    return normalizeListResponse<PackagePlanOption>(packagePlansQuery.data);
  }, [packagePlansQuery.data]);

  const tenants = useMemo(() => {
    const list = normalizeListResponse<TenantOption>(tenantsQuery.data);
    return mergeSelectedTenant(list, initialData);
  }, [tenantsQuery.data, initialData]);

  const restaurants = useMemo(() => {
    const list = normalizeListResponse<RestaurantOption>(restaurantsQuery.data);
    return mergeSelectedRestaurant(list, initialData);
  }, [restaurantsQuery.data, initialData]);

  const selectedTenant = useMemo(() => {
    return tenants.find((tenant) => tenant.id === form.tenantId);
  }, [tenants, form.tenantId]);

  const selectedRestaurant = useMemo(() => {
    return restaurants.find((restaurant) => restaurant.id === form.restaurantId);
  }, [restaurants, form.restaurantId]);

  const isSubmitting =
    createSubscription.isPending || updateSubscription.isPending;

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setForm({
        tenantId: initialData.tenantId || "",
        restaurantId: initialData.restaurantId || "",
        packagePlanId: initialData.packagePlanId || "",
        paymentStatus: normalizePaymentStatus(initialData.paymentStatus),
        status: normalizeSubscriptionStatus(initialData.status),
        startsAt: toDateInputValue(initialData.startsAt),
        endsAt: toDateInputValue(initialData.endsAt),
        nextBillingAt: toDateInputValue(initialData.nextBillingAt),
        payoutCycleOverride: initialData.payoutCycleOverride || "",
        note: initialData.note || "",
      });

      setTenantSearch("");
      setRestaurantSearch("");
    } else {
      setForm(defaultForm);
      setTenantSearch("");
      setRestaurantSearch("");
    }
  }, [open, initialData]);

  const updateForm = <K extends keyof SubscriptionFormState>(
    key: K,
    value: SubscriptionFormState[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    const payload = {
      tenantId: form.tenantId || undefined,
      restaurantId: form.restaurantId || undefined,
      packagePlanId: form.packagePlanId,
      paymentStatus: form.paymentStatus,
      status: form.status,
      startsAt: toIsoOrUndefined(form.startsAt),
      endsAt: toIsoOrUndefined(form.endsAt),
      nextBillingAt: toIsoOrUndefined(form.nextBillingAt),
      payoutCycleOverride: form.payoutCycleOverride || null,
      note: form.note.trim() || undefined,
    };

    if (isEditMode && initialData?.id) {
      await updateSubscription.mutateAsync({
        id: initialData.id,
        payload,
      });
    } else {
      await createSubscription.mutateAsync(payload);
    }

    onOpenChange(false);
  };

  const submitDisabled =
    isSubmitting || !form.packagePlanId || (!form.tenantId && !form.restaurantId);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-100 bg-white px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-dark">
              {isEditMode
                ? pricingModel("actions.updateSubscription")
                : pricingModel("actions.assignSubscription")}
            </h2>
            <p className="mt-1 text-sm text-gray">
              {isEditMode
                ? pricingModel("subscriptions.updateSubscriptionDescription")
                : pricingModel("subscriptions.assignSubscriptionDescription")}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="inline-flex size-9 items-center justify-center rounded-lg text-gray transition hover:bg-gray-100 hover:text-primary"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-sm font-semibold text-primary">
              {pricingModel("subscriptions.selectAtLeastOneOwner")}
            </p>
            <p className="mt-1 text-xs text-gray">
              {pricingModel("subscriptions.selectAtLeastOneOwnerDescription")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <SearchableSelect
              label={pricingModel("fields.tenant")}
              placeholder={filters("searchTenantsPlaceholder")}
              selectPlaceholder={pricingModel("placeholders.selectTenant")}
              value={form.tenantId}
              search={tenantSearch}
              loading={tenantsQuery.isLoading || tenantsQuery.isFetching}
              options={tenants}
              getOptionLabel={getTenantLabel}
              getOptionMeta={getTenantMeta}
              onSearchChange={setTenantSearch}
              onChange={(value) => updateForm("tenantId", value)}
              selectedLabel={
                selectedTenant ? getTenantLabel(selectedTenant) : undefined
              }
            />

            <SearchableSelect
              label={pricingModel("fields.restaurant")}
              placeholder={filters("searchRestaurantsPlaceholder")}
              selectPlaceholder={pricingModel("placeholders.selectRestaurant")}
              value={form.restaurantId}
              search={restaurantSearch}
              loading={restaurantsQuery.isLoading || restaurantsQuery.isFetching}
              options={restaurants}
              getOptionLabel={getRestaurantLabel}
              getOptionMeta={getRestaurantMeta}
              onSearchChange={setRestaurantSearch}
              onChange={(value) => updateForm("restaurantId", value)}
              selectedLabel={
                selectedRestaurant
                  ? getRestaurantLabel(selectedRestaurant)
                  : undefined
              }
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray">
              {pricingModel("fields.packagePlan")}
            </label>

            <select
              value={form.packagePlanId}
              onChange={(event) =>
                updateForm("packagePlanId", event.target.value)
              }
              className="mt-2 h-11 w-full rounded-lg border border-gray-100 bg-gray-50 px-4 text-sm text-dark outline-none transition focus:border-primary focus:bg-white"
            >
              <option value="">
                {packagePlansQuery.isLoading || packagePlansQuery.isFetching
                  ? pricingModel("subscriptions.loadingPackagePlans")
                  : pricingModel("placeholders.selectPackagePlan")}
              </option>

              {packagePlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-gray">
                {pricingModel("fields.paymentStatus")}
              </label>

              <select
                value={form.paymentStatus}
                onChange={(event) =>
                  updateForm(
                    "paymentStatus",
                    event.target.value as PaymentStatus
                  )
                }
                className="mt-2 h-11 w-full rounded-lg border border-gray-100 bg-gray-50 px-4 text-sm text-dark outline-none transition focus:border-primary focus:bg-white"
              >
                <option value="PENDING">
                  {pricingModel("display.paymentStatus.pending")}
                </option>
                <option value="PAID">
                  {pricingModel("display.paymentStatus.paid")}
                </option>
                <option value="FAILED">
                  {pricingModel("display.paymentStatus.failed")}
                </option>
                <option value="CANCELLED">
                  {pricingModel("display.paymentStatus.cancelled")}
                </option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray">
                {pricingModel("fields.subscriptionStatus")}
              </label>

              <select
                value={form.status}
                onChange={(event) =>
                  updateForm(
                    "status",
                    event.target.value as SubscriptionStatus
                  )
                }
                className="mt-2 h-11 w-full rounded-lg border border-gray-100 bg-gray-50 px-4 text-sm text-dark outline-none transition focus:border-primary focus:bg-white"
              >
                <option value="TRIALING">
                  {pricingModel("display.status.trialing")}
                </option>
                <option value="ACTIVE">
                  {pricingModel("display.status.active")}
                </option>
                <option value="PAST_DUE">
                  {pricingModel("display.status.pastDue")}
                </option>
                <option value="CANCELLED">
                  {pricingModel("display.status.cancelled")}
                </option>
                <option value="EXPIRED">
                  {pricingModel("display.status.expired")}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray">
              {pricingModel("fields.payoutCycleOverride")}
            </label>
            <select
              value={form.payoutCycleOverride}
              onChange={(event) =>
                updateForm("payoutCycleOverride", event.target.value)
              }
              className="mt-2 h-11 w-full rounded-lg border border-gray-100 bg-gray-50 px-4 text-sm text-dark outline-none transition focus:border-primary focus:bg-white"
            >
              <option value="">
                {pricingModel("subscriptions.usePackagePlanPayoutCycle")}
              </option>
              <option value="DAILY">{pricingModel("display.payoutCycles.daily")}</option>
              <option value="WEEKLY">{pricingModel("display.payoutCycles.weekly")}</option>
              <option value="BIWEEKLY">{pricingModel("display.payoutCycles.biweekly")}</option>
              <option value="MONTHLY">{pricingModel("display.payoutCycles.monthly")}</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div>
              <label className="text-xs font-semibold text-gray">
                {pricingModel("fields.startsAt")}
              </label>
              <input
                type="date"
                value={form.startsAt}
                onChange={(event) => updateForm("startsAt", event.target.value)}
                className="mt-2 h-11 w-full rounded-lg border border-gray-100 bg-gray-50 px-4 text-sm text-dark outline-none transition focus:border-primary focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray">
                {pricingModel("fields.endsAt")}
              </label>
              <input
                type="date"
                value={form.endsAt}
                onChange={(event) => updateForm("endsAt", event.target.value)}
                className="mt-2 h-11 w-full rounded-lg border border-gray-100 bg-gray-50 px-4 text-sm text-dark outline-none transition focus:border-primary focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray">
                {pricingModel("fields.nextBillingAt")}
              </label>
              <input
                type="date"
                value={form.nextBillingAt}
                onChange={(event) =>
                  updateForm("nextBillingAt", event.target.value)
                }
                className="mt-2 h-11 w-full rounded-lg border border-gray-100 bg-gray-50 px-4 text-sm text-dark outline-none transition focus:border-primary focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray">
              {pricingModel("fields.note")}
            </label>
            <textarea
              value={form.note}
              onChange={(event) => updateForm("note", event.target.value)}
              rows={3}
              placeholder={pricingModel("placeholders.internalNote")}
              className="mt-2 w-full resize-none rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-dark outline-none transition focus:border-primary focus:bg-white"
            />
          </div>
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-gray-100 bg-white px-6 py-5">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleClose}
            className="h-11 rounded-lg border border-gray-100 px-5 text-sm font-semibold text-gray transition hover:bg-gray-50 hover:text-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {common("cancel")}
          </button>

          <button
            type="button"
            disabled={submitDisabled}
            onClick={handleSubmit}
            className="h-11 rounded-lg bg-primary px-6 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? isEditMode
                ? pricingModel("actions.updating")
                : pricingModel("actions.assigning")
              : isEditMode
                ? pricingModel("actions.updateSubscription")
                : pricingModel("actions.assignSubscription")}
          </button>
        </div>
      </div>
    </div>
  );
}

type SearchableSelectProps<T extends { id: string }> = {
  label: string;
  placeholder: string;
  selectPlaceholder: string;
  value: string;
  search: string;
  loading?: boolean;
  options: T[];
  selectedLabel?: string;
  getOptionLabel: (item: T) => string;
  getOptionMeta?: (item: T) => string;
  onSearchChange: (value: string) => void;
  onChange: (value: string) => void;
};

function SearchableSelect<T extends { id: string }>({
  label,
  placeholder,
  selectPlaceholder,
  value,
  search,
  loading = false,
  options,
  selectedLabel,
  getOptionLabel,
  getOptionMeta,
  onSearchChange,
  onChange,
}: SearchableSelectProps<T>) {
  const pricingModel = useTranslations("pricingModel");
  const common = useTranslations("common");

  return (
    <div>
      <label className="text-xs font-semibold text-gray">{label}</label>

      <div className="mt-2 rounded-lg border border-gray-100 bg-gray-50 p-2 transition">
        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray"
          />

          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={placeholder}
            className="h-9 w-full rounded-md border border-transparent bg-white pl-9 pr-3 text-sm text-dark outline-none transition focus:border-primary"
          />
        </div>

        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-2 h-10 w-full rounded-md border border-transparent bg-white px-3 text-sm text-dark outline-none transition focus:border-primary"
        >
          <option value="">
            {loading ? common("loading") : selectPlaceholder}
          </option>

          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {getOptionLabel(option)}
            </option>
          ))}
        </select>

        {value && (
          <div className="mt-2 flex items-start justify-between gap-3 rounded-md bg-red-50 px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-primary">
                {pricingModel("subscriptions.selectedValue", {
                  value: selectedLabel || value,
                })}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-gray">
                {pricingModel("subscriptions.idValue", { value })}
              </p>
              {selectedLabel && getOptionMeta && (
                <p className="mt-0.5 truncate text-[11px] text-gray">
                  {selectedLabel}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => onChange("")}
              className="shrink-0 text-gray transition hover:text-primary"
              title={pricingModel("actions.clearSelection")}
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
