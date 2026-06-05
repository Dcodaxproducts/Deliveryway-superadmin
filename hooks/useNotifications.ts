import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  getNotificationSettings,
  updateNotificationSettings,
  NotificationSettingsValues,
} from "@/services/notificationSettings";

/**
 * ==============================
 * GET NOTIFICATION SETTINGS
 * ==============================
 */
export const useGetNotificationSettings = () => {
  return useQuery({
    queryKey: ["notification-settings"], // no restaurant dimension now
    queryFn: getNotificationSettings,
  });
};

/**
 * ==============================
 * UPDATE NOTIFICATION SETTINGS
 * ==============================
 */
export const useUpdateNotificationSettings = () => {
  const toasts = useTranslations("toasts");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: NotificationSettingsValues) =>
      updateNotificationSettings(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notification-settings"],
      });

      toast.success(toasts("notificationSettingsUpdated"));
    },

    onError: (err: any) => {
      toast.error(
          err?.response?.data?.message ||
          toasts("notificationSettingsUpdateFailed")
      );
    },
  });
};
