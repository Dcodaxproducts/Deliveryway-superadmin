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

export type StaffRolePermission = {
  access: string;
  operations: string[];
};

export type StaffRole = {
  id: string;
  name: string;
  description?: string | null;
  sub?: string;
  isEditing?: boolean;
  permissions: StaffRolePermission[];
  restaurantAccess?: {
    restaurantIds?: string[];
    branchIds?: string[];
    allRestaurants?: boolean;
    hasAllRestaurantsAccess?: boolean;
  } | null;
};

export type StaffRolePayload = {
  name?: string;
  description?: string;
  permissions?: StaffRolePermission[];
  allRestaurants?: boolean;
  hasAllRestaurantsAccess?: boolean;
  restaurantIds?: string[];
  branchIds?: string[];
};

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

export const getStaffRoles = async (): Promise<StaffRole[]> => {
  const { data } = await api.get<{ data: StaffRole[] }>("/staff-roles");
  return data.data;
}

export const getStaffRoleById = async (id: string): Promise<StaffRole> => {
  const { data } = await api.get<{ data: StaffRole }>(`/staff-roles/${id}`);
  return data.data;
}

export const createStaffRole = async (roleData: StaffRolePayload) => {
  const { data } = await api.post("/staff-roles", roleData);
  return data.data
}

export const updateStaffRole = async (id: string, roleData: StaffRolePayload) => {
  const { data } = await api.patch(`/staff-roles/${id}`, roleData);
  return data.data
}

export const deleteStaffRole = async (id: string) => {
  const { data } = await api.delete(`/staff-roles/${id}`);
  return data
}
