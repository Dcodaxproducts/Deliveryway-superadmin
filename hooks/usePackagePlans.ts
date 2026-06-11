import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  createPackagePlan,
  createPackageSubscription,
  deletePackagePlan,
  downloadPackageSubscriptionInvoicePdf,
  downloadWeeklyPayoutInvoicePdf,
  getPackageSubscriptionInvoice,
  getPackagePlanDetail,
  getPackagePlanFeatureCatalog,
  getPackagePlans,
  getPackageSubscriptions,
  getWeeklyPayoutInvoice,
  sendPackageSubscriptionInvoiceEmail,
  sendWeeklyPayoutInvoiceEmail,
  updatePackagePlan,
  updatePackageSubscription,
  CreatePackagePlanPayload,
  CreatePackageSubscriptionPayload,
  PackagePlansParams,
  PackageSubscriptionsParams,
  SendPackageSubscriptionInvoiceEmailPayload,
  UpdatePackagePlanPayload,
  UpdatePackageSubscriptionPayload,
  WeeklyPayoutInvoiceEmailPayload,
  WeeklyPayoutInvoiceParams,
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
  subscriptionInvoice: (id?: string) =>
    [...packagePlanKeys.subscriptions(), "invoice", id] as const,
  payoutInvoice: () => [...packagePlanKeys.all, "payout-invoice"] as const,
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

const downloadBlobFile = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
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
  const toasts = useTranslations("toasts");
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

      toast.success(toasts("packagePlanCreated"));
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err, toasts("packagePlanCreateFailed")));
    },
  });
};

export const useUpdatePackagePlan = () => {
  const toasts = useTranslations("toasts");
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

      toast.success(toasts("packagePlanUpdated"));
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err, toasts("packagePlanUpdateFailed")));
    },
  });
};

export const useDeletePackagePlan = () => {
  const toasts = useTranslations("toasts");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePackagePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: packagePlanKeys.lists(),
      });

      toast.success(toasts("packagePlanDeleted"));
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err, toasts("packagePlanDeleteFailed")));
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
  const toasts = useTranslations("toasts");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePackageSubscriptionPayload) =>
      createPackageSubscription(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: packagePlanKeys.subscriptions(),
      });

      toast.success(toasts("subscriptionAssigned"));
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err, toasts("subscriptionAssignFailed")));
    },
  });
};

export const useUpdatePackageSubscription = () => {
  const toasts = useTranslations("toasts");
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

      toast.success(toasts("subscriptionUpdated"));
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err, toasts("subscriptionUpdateFailed")));
    },
  });
};

export const useGetPackageSubscriptionInvoice = (id?: string) => {
  return useQuery({
    queryKey: packagePlanKeys.subscriptionInvoice(id),
    queryFn: () => getPackageSubscriptionInvoice(id as string),
    enabled: Boolean(id),
  });
};

export const useDownloadPackageSubscriptionInvoicePdf = () => {
  const toasts = useTranslations("toasts");

  return useMutation({
    mutationFn: (id: string) => downloadPackageSubscriptionInvoicePdf(id),
    onSuccess: (blob, id) => {
      downloadBlobFile(blob, `restaurant-subscription-invoice-${id}.pdf`);
      toast.success(toasts("subscriptionInvoiceDownloaded"));
    },
    onError: (err: any) => {
      toast.error(
        getErrorMessage(err, toasts("subscriptionInvoiceDownloadFailed"))
      );
    },
  });
};

export const useSendPackageSubscriptionInvoiceEmail = () => {
  const toasts = useTranslations("toasts");

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload?: SendPackageSubscriptionInvoiceEmailPayload;
    }) => sendPackageSubscriptionInvoiceEmail(id, payload),
    onSuccess: (response) => {
      toast.success(response?.message || toasts("subscriptionInvoiceEmailSent"));
    },
    onError: (err: any) => {
      toast.error(
        getErrorMessage(err, toasts("subscriptionInvoiceEmailSendFailed"))
      );
    },
  });
};

export const useFetchWeeklyPayoutInvoice = () => {
  return useMutation({
    mutationFn: (params: WeeklyPayoutInvoiceParams) =>
      getWeeklyPayoutInvoice(params),
  });
};

export const useDownloadWeeklyPayoutInvoicePdf = () => {
  const toasts = useTranslations("toasts");

  return useMutation({
    mutationFn: (params: WeeklyPayoutInvoiceParams) =>
      downloadWeeklyPayoutInvoicePdf(params),
    onSuccess: (blob, params) => {
      downloadBlobFile(
        blob,
        `weekly-payout-invoice-${params.restaurantId}-${params.fromDate.slice(
          0,
          10
        )}.pdf`
      );
      toast.success(toasts("weeklyPayoutInvoiceDownloaded"));
    },
    onError: (err: any) => {
      toast.error(
        getErrorMessage(err, toasts("weeklyPayoutInvoiceDownloadFailed"))
      );
    },
  });
};

export const useSendWeeklyPayoutInvoiceEmail = () => {
  const toasts = useTranslations("toasts");

  return useMutation({
    mutationFn: (payload: WeeklyPayoutInvoiceEmailPayload) =>
      sendWeeklyPayoutInvoiceEmail(payload),
    onSuccess: (response) => {
      toast.success(response?.message || toasts("weeklyPayoutInvoiceEmailSent"));
    },
    onError: (err: any) => {
      toast.error(
        getErrorMessage(err, toasts("weeklyPayoutInvoiceEmailSendFailed"))
      );
    },
  });
};
