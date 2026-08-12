// auth
import axios from "axios"
import api from "@/lib/axios"
import { canAccessSuperAdminPanel } from "@/lib/auth-role"

export type AuthLoginData = {
  accessToken: string;
  refreshToken?: string;
  user: Record<string, unknown>;
  restaurantAccess?: unknown;
  staffRole?: unknown;
};

const assertSuperAdminPanelAccess = (data: unknown): AuthLoginData => {
  const record = typeof data === "object" && data !== null
    ? data as Record<string, unknown>
    : {};
  const user = typeof record.user === "object" && record.user !== null
    ? record.user as Record<string, unknown>
    : null;

  if (typeof record.accessToken !== "string" || !user || !canAccessSuperAdminPanel(user)) {
    throw new Error("This account does not have access to the Super Admin panel.");
  }

  return {
    accessToken: record.accessToken,
    refreshToken: typeof record.refreshToken === "string" ? record.refreshToken : undefined,
    user,
    restaurantAccess: record.restaurantAccess,
    staffRole: record.staffRole,
  };
};

export const login = async (form: Login) => {
  try {
    const { data } = await api.post("/auth/login", {
      ...form,
      role: "SUPER_ADMIN",
    });
    return assertSuperAdminPanelAccess(data.data);
  } catch (error: unknown) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    if (status !== 401 && status !== 403) {
      throw error;
    }

    const { data } = await api.post("/auth/staff/login", form);
    return assertSuperAdminPanelAccess(data.data);
  }
}

export const getUser = async () => {
  const { data } = await api.get("/auth/me");
  return data.data
}
