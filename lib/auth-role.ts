export const getNormalizedRole = (user: unknown) => {
  const record = typeof user === "object" && user !== null ? user as Record<string, unknown> : {};
  const nestedUser = typeof record.user === "object" && record.user !== null
    ? record.user as Record<string, unknown>
    : {};

  return String(record.role || nestedUser.role || "").trim().toUpperCase();
};

export const isSuperAdmin = (user: unknown) => getNormalizedRole(user) === "SUPER_ADMIN";
