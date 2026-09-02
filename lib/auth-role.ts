export const getNormalizedRole = (user: unknown) => {
  const record =
    typeof user === "object" && user !== null
      ? (user as Record<string, unknown>)
      : {};
  const nestedUser =
    typeof record.user === "object" && record.user !== null
      ? (record.user as Record<string, unknown>)
      : {};

  return String(record.role || nestedUser.role || "")
    .trim()
    .toUpperCase();
};

export const isSuperAdmin = (user: unknown) =>
  getNormalizedRole(user) === "SUPER_ADMIN";

export const hasSuperAdminPanelAccess = (user: unknown) => {
  const record =
    typeof user === "object" && user !== null
      ? (user as Record<string, unknown>)
      : {};
  const nestedUser =
    typeof record.user === "object" && record.user !== null
      ? (record.user as Record<string, unknown>)
      : {};
  const panelType = String(record.panelType || nestedUser.panelType || "")
    .trim()
    .toUpperCase();
  const actorType = String(record.actorType || nestedUser.actorType || "")
    .trim()
    .toUpperCase();

  return (
    isSuperAdmin(user) || (actorType === "STAFF" && panelType === "SUPER_ADMIN")
  );
};
