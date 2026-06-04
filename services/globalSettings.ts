import api from "@/lib/axios";

export type GlobalSettingsValues = {
  [key: string]: any;
};

/**
 * ==============================
 * GLOBAL SETTINGS APIS
 * ==============================
 */

/**
 * Get global settings
 */
export const getGlobalSettings = async () => {
  const { data } = await api.get("/admin/global-settings");
  return data?.data ?? data;
};

/**
 * Update global settings
 */
export const updateGlobalSettings = async (
  payload: Partial<GlobalSettingsValues>
) => {
  const { data } = await api.patch("/admin/global-settings", payload);
  return data;
};