export type StaffPermission = {
  access?: string | null;
  operations?: string[] | null;
};

export type StaffRestaurantAccess = {
  restaurantIds?: string[] | null;
  branchIds?: string[] | null;
};

export type AuthUserLike = {
  actorType?: string | null;
  role?: string | null;
  restaurantIds?: string[] | null;
  branchIds?: string[] | null;
  restaurantAccess?: StaffRestaurantAccess | null;
  user?: AuthUserLike | null;
  staffRole?: {
    permissions?: StaffPermission[] | null;
    restaurantIds?: string[] | null;
    branchIds?: string[] | null;
    restaurantAccess?: StaffRestaurantAccess | null;
  } | null;
};

export const MENU_PERMISSION_ACCESSES = new Set([
  "menu",
  "menus",
  "menu-management",
  "restaurant-menus",
  "menu-categories",
  "menu-items",
  "modifiers",
  "modifier-categories",
  "modifier-groups",
  "variations",
  "branch-overrides",
  "cuisines",
]);

export const MENU_READ_OPERATIONS = new Set(["read", "write", "create", "update", "manage", "*"]);
export const MENU_WRITE_OPERATIONS = new Set(["write", "create", "update", "delete", "manage", "*"]);

const normalize = (value?: string | null) => String(value || "").trim().toLowerCase();

const unwrapUser = (user?: AuthUserLike | null): AuthUserLike | null => user?.user ?? user ?? null;

export const isStaffUser = (user?: AuthUserLike | null) => {
  const authUser = unwrapUser(user);
  return normalize(authUser?.actorType) === "staff" || normalize(authUser?.role) === "staff";
};

export const getStaffRestaurantAccess = (user?: AuthUserLike | null): StaffRestaurantAccess => {
  const authUser = unwrapUser(user);
  const directAccess = authUser?.restaurantAccess ?? {};
  const roleAccess = authUser?.staffRole?.restaurantAccess ?? {};

  return {
    restaurantIds: authUser?.restaurantIds ?? directAccess.restaurantIds ?? authUser?.staffRole?.restaurantIds ?? roleAccess.restaurantIds ?? [],
    branchIds: authUser?.branchIds ?? directAccess.branchIds ?? authUser?.staffRole?.branchIds ?? roleAccess.branchIds ?? [],
  };
};

export const hasAssignedRestaurantOrBranch = (user?: AuthUserLike | null) => {
  const access = getStaffRestaurantAccess(user);
  return Boolean(access.restaurantIds?.length || access.branchIds?.length);
};

export const hasMenuPermission = (user?: AuthUserLike | null, mode: "read" | "write" = "read") => {
  const authUser = unwrapUser(user);
  const allowedOperations = mode === "write" ? MENU_WRITE_OPERATIONS : MENU_READ_OPERATIONS;
  const permissions = authUser?.staffRole?.permissions ?? [];

  return permissions.some((permission) => {
    const access = normalize(permission.access);
    const operations = permission.operations ?? [];

    return MENU_PERMISSION_ACCESSES.has(access) && operations.some((operation) => allowedOperations.has(normalize(operation)));
  });
};

export const canStaffAccessMenu = (user?: AuthUserLike | null, mode: "read" | "write" = "read") => {
  if (!isStaffUser(user)) return true;
  return hasAssignedRestaurantOrBranch(user) && hasMenuPermission(user, mode);
};

export const parseIdList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const stringifyIdList = (value?: Array<string | number> | null) =>
  Array.isArray(value) ? value.map(String).join(", ") : "";
