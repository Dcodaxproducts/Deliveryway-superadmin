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

const ACCESS_ALIASES: Record<string, string> = {
  "auto-printing": "auto-printing-pos",
  "business-owners": "branch-management",
  "branch": "branch-management",
  "branches": "branch-management",
  "chat": "notifications",
  "cuisines": "menu-management",
  "employee-management": "employees",
  "employee-settings": "employees",
  "global-settings": "storefront-settings",
  "invoice": "reports-payouts",
  "invoices": "reports-payouts",
  "invoicing": "reports-payouts",
  "manage-restaurants": "branch-management",
  "menu": "menu-management",
  "menus": "menu-management",
  "menu-categories": "menu-management",
  "menu-items": "menu-management",
  "modifier-categories": "menu-management",
  "modifier-groups": "menu-management",
  "modifiers": "menu-management",
  "notification-settings": "notifications",
  "orders": "order-management",
  "payment": "payment-settings",
  "payments": "payment-settings",
  "pricing-model": "payment-settings",
  "products": "menu-management",
  "rbac": "employees",
  "reports": "reports-payouts",
  "restaurant-menu": "menu-management",
  "restaurant-menus": "menu-management",
  "restaurant-management": "branch-management",
  "restaurants": "branch-management",
  "settings": "storefront-settings",
  "staff": "employees",
  "staff-management": "employees",
  "staff-roles": "employees",
  "staffs": "employees",
  "subscriptions": "payment-settings",
  "variations": "menu-management",
};

const OPERATION_ALIASES: Record<string, string[]> = {
  read: ["read", "list", "view", "get"],
  create: ["create"],
  update: ["update", "edit"],
  delete: ["delete", "remove"],
  manage: ["manage", "all", "*"],
};

export const normalizePermissionKey = (value?: string | null) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");

export const canonicalizePermissionAccess = (value?: string | null) => {
  const normalized = normalizePermissionKey(value);
  return ACCESS_ALIASES[normalized] ?? normalized;
};

export const normalizePermissionOperation = (value?: string | null) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");

export const operationMatches = (granted?: string | null, required = "read") => {
  const grantedOperation = normalizePermissionOperation(granted);
  const requiredOperation = normalizePermissionOperation(required);

  if (OPERATION_ALIASES.manage.includes(grantedOperation)) return true;

  const requiredAliases = OPERATION_ALIASES[requiredOperation] ?? [requiredOperation];
  const grantedAliases = OPERATION_ALIASES[grantedOperation] ?? [grantedOperation];

  return grantedAliases.some((alias) => requiredAliases.includes(alias));
};

const canonicalOperationForModule = (operation: string, defaultActions: string[]) => {
  const normalizedOperation = normalizePermissionOperation(operation);
  const normalizedDefaults = defaultActions.map((action) => ({
    action,
    normalized: normalizePermissionOperation(action),
  }));

  return normalizedDefaults.find(({ normalized }) => normalized === normalizedOperation)?.action
    ?? normalizedDefaults.find(({ action }) => operationMatches(normalizedOperation, action))?.action
    ?? null;
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
  const modulesByAccess = new Map(
    modules.map((module) => [canonicalizePermissionAccess(module.accessKey), module]),
  );

  const sanitized = new Map<string, Set<string>>();

  permissions.forEach((permission) => {
    const module = modulesByAccess.get(canonicalizePermissionAccess(permission.access));
    if (!module) return;

    const operations = permission.operations
      .map((operation) => canonicalOperationForModule(operation, module.defaultActions))
      .filter((operation): operation is string => Boolean(operation));

    if (!operations.length) return;

    const access = module.accessKey;
    const currentOperations = sanitized.get(access) ?? new Set<string>();
    operations.forEach((operation) => currentOperations.add(operation));
    sanitized.set(access, currentOperations);
  });

  return Array.from(sanitized.entries()).map(([access, operations]) => ({
    access,
    operations: Array.from(operations),
  }));
};

export const formatActionLabel = (action: string) =>
  action
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
