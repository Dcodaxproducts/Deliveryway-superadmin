import api from "@/lib/axios"

export type PermissionModule = {
  id: string;
  accessKey: string;
  name: string;
  description?: string | null;
  defaultActions: string[];
  sortOrder?: number | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PermissionModulesResponse = {
  data?: PermissionModule[];
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
};

export type CreatePermissionModulePayload = {
  accessKey: string;
  name: string;
  description?: string;
  defaultActions: string[];
  sortOrder?: number;
  isActive?: boolean;
};

export type UpdatePermissionModulePayload = Partial<Omit<CreatePermissionModulePayload, "accessKey">>;

export const getPermissionModules = async (params?: { isActive?: boolean | null; limit?: number; page?: number }) => {
  const queryParams = { ...params };
  if (queryParams.isActive === null) {
    delete queryParams.isActive;
  }

  const { data } = await api.get<PermissionModulesResponse>("/permission-modules", { params: queryParams });
  return (data.data || []).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

export const createPermissionModule = async (payload: CreatePermissionModulePayload) => {
  const { data } = await api.post("/permission-modules", payload);
  return data.data;
}

export const updatePermissionModule = async (id: string, payload: UpdatePermissionModulePayload) => {
  const { data } = await api.patch(`/permission-modules/${id}`, payload);
  return data.data;
}

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
