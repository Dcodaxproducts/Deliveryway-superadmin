import api from "@/lib/axios"

export const getCustomer = async (params?: { page?: number; search?: string }) => {
  const { data } = await api.get("/admin/users/customers", { params });
  return data
}

export const getCustomerById = async (id: string) => {
  const { data } = await api.get(`/admin/users/customers/${id}`);
  return data.data;
}

export const deleteCustomer = async (emails: string[]) => {
  const { data } = await api.post("/admin/users/force-delete", { emails });
  return data;
}