export type PermissionModule = {
  id?: string;
  name: string;
  description?: string | null;
  accessKey: string;
  defaultActions: string[];
  sortOrder?: number | null;
  isActive?: boolean;
};

export type StaffPermission = {
  access: string;
  operations: string[];
};

export const sortPermissionModules = (modules: PermissionModule[]) =>
  [...modules].sort((first, second) => {
    const orderDiff = (first.sortOrder ?? 0) - (second.sortOrder ?? 0);
    return orderDiff || first.name.localeCompare(second.name);
  });

export const sanitizePermissions = (
  permissions: StaffPermission[],
  modules: PermissionModule[],
) => {
  const actionsByAccess = new Map(
    modules.map((module) => [module.accessKey, new Set(module.defaultActions)]),
  );

  return permissions
    .map((permission) => ({
      access: permission.access,
      operations: permission.operations.filter((operation) =>
        actionsByAccess.get(permission.access)?.has(operation),
      ),
    }))
    .filter((permission) => permission.operations.length > 0);
};

export const formatActionLabel = (action: string) =>
  action
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
