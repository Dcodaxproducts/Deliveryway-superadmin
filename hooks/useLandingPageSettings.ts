import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  getLandingPageSettings,
  updateLandingPageSettings,
} from "@/services/globalSettings";

const LANDING_PAGE_SETTINGS_QUERY_KEY = ["landing-page-settings"] as const;

export const useLandingPageSettings = () =>
  useQuery({
    queryKey: LANDING_PAGE_SETTINGS_QUERY_KEY,
    queryFn: getLandingPageSettings,
  });

export const useUpdateLandingPageSettings = () => {
  const queryClient = useQueryClient();
  const t = useTranslations("landingContent");

  return useMutation({
    mutationFn: updateLandingPageSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(LANDING_PAGE_SETTINGS_QUERY_KEY, data);
      queryClient.invalidateQueries({ queryKey: ["global-settings"] });
      toast.success(t("saved"));
    },
    onError: () => {
      toast.error(t("saveFailed"));
    },
  });
};
