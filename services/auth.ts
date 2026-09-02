// auth
import api from "@/lib/axios";
import { hasSuperAdminPanelAccess } from "@/lib/auth-role";

export const login = async (form: Login) => {
  let response;

  try {
    response = await api.post("/auth/login", {
      ...form,
      role: "SUPER_ADMIN",
    });
  } catch (error) {
    const status =
      typeof error === "object" && error !== null && "response" in error
        ? (error as { response?: { status?: number } }).response?.status
        : undefined;

    if (status !== 401) throw error;
    response = await api.post("/auth/staff/login", form);
  }

  const { data } = response;
  const payload = data.data;

  if (!hasSuperAdminPanelAccess(payload?.user ?? payload)) {
    throw new Error("SUPER_ADMIN_REQUIRED");
  }

  return payload;
};

export const getUser = async () => {
  const { data } = await api.get("/auth/me");
  return data.data;
};

export const changePassword = async (payload: {
  currentPassword: string;
  newPassword: string;
}) => {
  const { data } = await api.patch("/auth/change-password", payload);
  return data;
};
