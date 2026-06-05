import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  getGlobalSettings,
  updateGlobalSettings,
} from "@/services/globalSettings";

/**
 * ==============================
 * GET GLOBAL SETTINGS
 * ==============================
 */
export const useGetGlobalSettings = () => {
  return useQuery({
    queryKey: ["global-settings"],
    queryFn: getGlobalSettings,
  });
};

/**
 * ==============================
 * UPDATE GLOBAL SETTINGS
 * ==============================
 */
export const useUpdateGlobalSettings = () => {
  const toasts = useTranslations("toasts");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateGlobalSettings,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["global-settings"] });
      toast.success(toasts("settingsUpdated"));
    },

    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || toasts("settingsUpdateFailed")
      );
    },
  });
};
