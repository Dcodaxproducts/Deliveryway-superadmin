// auth
import api from "@/lib/axios"

export const login = async (form: Login) => {
  const { data } = await api.post("/auth/login", form);
  return data.data
}

export const getUser = async () => {
  const { data } = await api.get("/auth/me");
  return data.data
}