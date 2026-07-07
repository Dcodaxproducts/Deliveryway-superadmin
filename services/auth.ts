// auth
import api from "@/lib/axios"

export const login = async (form: Login) => {
  try {
    const { data } = await api.post("/auth/login", form);
    return data.data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status !== 401 && status !== 403) {
      throw error;
    }

    const { data } = await api.post("/auth/staff/login", form);
    return data.data;
  }
}

export const getUser = async () => {
  const { data } = await api.get("/auth/me");
  return data.data
}