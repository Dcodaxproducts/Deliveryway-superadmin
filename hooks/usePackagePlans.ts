import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createPackagePlan,
  createPackageSubscription,
  deletePackagePlan,
  getPackagePlanDetail,
  getPackagePlanFeatureCatalog,
  getPackagePlans,
  getPackageSubscriptions,
  updatePackagePlan,
  updatePackageSubscription,
  CreatePackagePlanPayload,
  CreatePackageSubscriptionPayload,
  PackagePlansParams,
  PackageSubscriptionsParams,
  UpdatePackagePlanPayload,
  UpdatePackageSubscriptionPayload,
} from "@/services/packagePlans";

/**
 * ==============================
 * QUERY KEYS
 * ==============================
 */

export const packagePlanKeys = {
  all: ["package-plans"] as const,

  lists: () => [...packagePlanKeys.all, "list"] as const,
  list: (params?: PackagePlansParams) =>
    [...packagePlanKeys.lists(), params] as const,

  details: () => [...packagePlanKeys.all, "detail"] as const,
  detail: (id?: string) => [...packagePlanKeys.details(), id] as const,

  featureCatalog: () =>
    [...packagePlanKeys.all, "features", "catalog"] as const,

  subscriptions: () =>
    [...packagePlanKeys.all, "subscriptions"] as const,
  subscriptionList: (params?: PackageSubscriptionsParams) =>
    [...packagePlanKeys.subscriptions(), params] as const,
};

/**
 * ==============================
 * HELPERS
 * ==============================
 */

const getErrorMessage = (err: any, fallback: string) => {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    fallback
  );
};

/**
 * ==============================
 * PACKAGE PLAN HOOKS
 * ==============================
 */

export const useGetPackagePlans = (params?: PackagePlansParams) => {
  return useQuery({
    queryKey: packagePlanKeys.list(params),
    queryFn: () => getPackagePlans(params),
  });
};

export const useGetPackagePlanDetail = (id?: string) => {
  return useQuery({
    queryKey: packagePlanKeys.detail(id),
    queryFn: () => getPackagePlanDetail(id as string),
    enabled: Boolean(id),
  });
};

export const useCreatePackagePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePackagePlanPayload) =>
      createPackagePlan(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: packagePlanKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: packagePlanKeys.featureCatalog(),
      });

      toast.success("Package plan created successfully");
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err, "Failed to create package plan"));
    },
  });
};

export const useUpdatePackagePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdatePackagePlanPayload;
    }) => updatePackagePlan(id, payload),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: packagePlanKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: packagePlanKeys.detail(variables.id),
      });

      toast.success("Package plan updated successfully");
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err, "Failed to update package plan"));
    },
  });
};

export const useDeletePackagePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePackagePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: packagePlanKeys.lists(),
      });

      toast.success("Package plan deleted successfully");
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err, "Failed to delete package plan"));
    },
  });
};

/**
 * ==============================
 * PACKAGE PLAN FEATURE CATALOG HOOK
 * ==============================
 */

export const useGetPackagePlanFeatureCatalog = () => {
  return useQuery({
    queryKey: packagePlanKeys.featureCatalog(),
    queryFn: getPackagePlanFeatureCatalog,
  });
};

/**
 * ==============================
 * PACKAGE SUBSCRIPTION HOOKS
 * ==============================
 */

export const useGetPackageSubscriptions = (
  params?: PackageSubscriptionsParams
) => {
  return useQuery({
    queryKey: packagePlanKeys.subscriptionList(params),
    queryFn: () => getPackageSubscriptions(params),
  });
};

export const useCreatePackageSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePackageSubscriptionPayload) =>
      createPackageSubscription(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: packagePlanKeys.subscriptions(),
      });

      toast.success("Subscription assigned successfully");
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err, "Failed to assign subscription"));
    },
  });
};

export const useUpdatePackageSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdatePackageSubscriptionPayload;
    }) => updatePackageSubscription(id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: packagePlanKeys.subscriptions(),
      });

      toast.success("Subscription updated successfully");
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err, "Failed to update subscription"));
    },
  });
};