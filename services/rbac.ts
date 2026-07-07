import api from "@/lib/axios"

export const getStaffRoles = async () => {
  const { data } = await api.get("/staff-roles");
  return data.data
}

export const getStaffRoleById = async (id: string) => {
  const { data } = await api.get(`/staff-roles/${id}`);
  return data.data
}

export const createStaffRole = async (roleData: any) => {
  const { data } = await api.post("/staff-roles", roleData);
  return data.data
}

export const updateStaffRole = async (id: string, roleData: any) => {
  const { data } = await api.patch(`/staff-roles/${id}`, roleData);
  return data.data
}

export const deleteStaffRole = async (id: string) => {
  const { data } = await api.delete(`/staff-roles/${id}`);
  return data
}
