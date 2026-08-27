// auth
import api from "@/lib/axios"
import { isSuperAdmin } from "@/lib/auth-role"

export const login = async (form: Login) => {
  const { data } = await api.post("/auth/login", {
    ...form,
    role: "SUPER_ADMIN",
  });
  const payload = data.data;

  if (!isSuperAdmin(payload?.user ?? payload)) {
    throw new Error("SUPER_ADMIN_REQUIRED");
  }

  return payload;
}

export const getUser = async () => {
  const { data } = await api.get("/auth/me");
  return data.data
}

export const changePassword = async (payload: {
  currentPassword: string;
  newPassword: string;
}) => {
  const { data } = await api.patch("/auth/change-password", payload);
  return data;
};
