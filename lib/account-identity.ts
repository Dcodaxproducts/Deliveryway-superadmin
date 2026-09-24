export type AccountIdentityKey = "superAdminStaff" | "restaurantAdminStaff" | "branchAdminStaff" | "staff" | "superAdmin" | "businessAdmin" | "branchAdmin" | "admin";

type RecordValue = Record<string, unknown>;
const record = (value: unknown): RecordValue => typeof value === "object" && value !== null && !Array.isArray(value) ? value as RecordValue : {};
const normalized = (value: unknown) => typeof value === "string" ? value.trim().toUpperCase() : "";

export const getAccountIdentity = (value: unknown) => {
  const user = record(value);
  const profile = record(user.profile);
  const staffRole = record(user.staffRole);
  const role = normalized(user.role);
  const actorType = normalized(user.actorType);
  const panelType = normalized(user.panelType) || normalized(staffRole.panelType);
  const isStaff = actorType === "STAFF" || role === "STAFF";
  let labelKey: AccountIdentityKey = "admin";
  if (isStaff) {
    if (panelType === "SUPER_ADMIN") labelKey = "superAdminStaff";
    else if (panelType === "BRANCH_ADMIN") labelKey = "branchAdminStaff";
    else if (panelType === "BUSINESS_ADMIN" || panelType === "RESTAURANT_ADMIN") labelKey = "restaurantAdminStaff";
    else labelKey = "staff";
  } else if (role === "SUPER_ADMIN") labelKey = "superAdmin";
  else if (role === "BUSINESS_ADMIN" || role === "RESTAURANT_ADMIN") labelKey = "businessAdmin";
  else if (role === "BRANCH_ADMIN") labelKey = "branchAdmin";
  const fullName = [profile.firstName, profile.lastName].filter((part): part is string => typeof part === "string" && Boolean(part.trim())).join(" ").trim();
  const email = typeof user.email === "string" ? user.email : "";
  return { labelKey, displayName: fullName || email, avatarUrl: typeof profile.avatarUrl === "string" ? profile.avatarUrl : null, staffRoleName: isStaff && typeof staffRole.name === "string" ? staffRole.name.trim() || null : null };
};
