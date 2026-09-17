import {
  canonicalizePermissionAccess,
  operationMatches,
} from "@/lib/permission-modules";

export type StaffPermission = {
  access?: string | null;
  operations?: string[] | null;
};

export type StaffRestaurantAccess = {
  restaurantIds?: string[] | null;
  branchIds?: string[] | null;
  allRestaurants?: boolean | null;
  hasAllRestaurantsAccess?: boolean | null;
};

export type AuthUserLike = {
  actorType?: string | null;
  role?: string | null;
  permissions?: StaffPermission[] | null;
  restaurantIds?: string[] | null;
  branchIds?: string[] | null;
  allRestaurants?: boolean | null;
  hasAllRestaurantsAccess?: boolean | null;
  restaurantAccess?: StaffRestaurantAccess | null;
  user?: AuthUserLike | null;
  staffRole?: {
    permissions?: StaffPermission[] | null;
    restaurantIds?: string[] | null;
    branchIds?: string[] | null;
    allRestaurants?: boolean | null;
    hasAllRestaurantsAccess?: boolean | null;
    restaurantAccess?: StaffRestaurantAccess | null;
  } | null;
};

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
  const directHasScope = Boolean(
    directAccess.allRestaurants ||
      directAccess.hasAllRestaurantsAccess ||
      directAccess.restaurantIds?.length ||
      directAccess.branchIds?.length,
  );
  const effectiveAccess = directHasScope ? directAccess : roleAccess;
  const directRestaurantIds = authUser?.restaurantIds?.length
    ? authUser.restaurantIds
    : effectiveAccess.restaurantIds;
  const directBranchIds = authUser?.branchIds?.length
    ? authUser.branchIds
    : effectiveAccess.branchIds;

  return {
    restaurantIds: directRestaurantIds?.length
      ? directRestaurantIds
      : authUser?.staffRole?.restaurantIds ?? [],
    branchIds: directBranchIds?.length
      ? directBranchIds
      : authUser?.staffRole?.branchIds ?? [],
    allRestaurants: Boolean(
      authUser?.allRestaurants ||
        authUser?.hasAllRestaurantsAccess ||
        effectiveAccess.allRestaurants ||
        effectiveAccess.hasAllRestaurantsAccess ||
        authUser?.staffRole?.allRestaurants ||
        authUser?.staffRole?.hasAllRestaurantsAccess,
    ),
  };
};

export const hasAssignedRestaurantOrBranch = (user?: AuthUserLike | null) => {
  const access = getStaffRestaurantAccess(user);
  return Boolean(access.allRestaurants || access.restaurantIds?.length || access.branchIds?.length);
};

const getStaffPermissions = (user?: AuthUserLike | null) => {
  const authUser = unwrapUser(user);
  return authUser?.staffRole?.permissions ?? authUser?.permissions ?? [];
};

export const hasStaffPermission = (
  user?: AuthUserLike | null,
  accessKeys?: string | string[] | null,
  operation = "read",
) => {
  if (!isStaffUser(user)) return true;
  if (!accessKeys) return true;

  const requiredAccesses = (Array.isArray(accessKeys) ? accessKeys : [accessKeys])
    .map(canonicalizePermissionAccess);
  const permissions = getStaffPermissions(user);

  return permissions.some((permission) => {
    const access = canonicalizePermissionAccess(permission.access);
    const operations = permission.operations ?? [];

    return requiredAccesses.includes(access)
      && operations.some((grantedOperation) => operationMatches(grantedOperation, operation));
  });
};

export const hasMenuPermission = (user?: AuthUserLike | null, mode: "read" | "write" = "read") =>
  hasStaffPermission(user, "menu-management", mode === "write" ? "update" : "read");

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
