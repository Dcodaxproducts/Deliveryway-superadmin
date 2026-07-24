import { menuItems, type SidebarMenuItem } from "@/constants/sidebarItems";
import { hasStaffPermission, isStaffUser, type AuthUserLike } from "@/lib/staff-access";

const normalizePath = (path?: string) => {
  if (!path) return "";
  if (path === "/") return "/";
  return path.replace(/\/+$/, "");
};

const extraRouteAccesses: Array<{ href: string; access: string | string[] }> = [
  { href: "/branch", access: "branch-management" },
  { href: "/notifications", access: "notifications" },
  { href: "/theme-settings", access: "storefront-settings" },
  { href: "/landing-content", access: "storefront-settings" },
];

const isRouteMatch = (pathname: string, href?: string) => {
  const currentPath = normalizePath(pathname);
  const targetPath = normalizePath(href);

  if (!targetPath) return false;
  if (targetPath === "/") return currentPath === "/";

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
};

const canAccessItem = (
  user: AuthUserLike | null,
  item: SidebarMenuItem,
  inheritedAccess?: string | string[],
) => hasStaffPermission(user, item.permissionAccess ?? inheritedAccess, "read");

export const filterSidebarItemsForUser = (items: SidebarMenuItem[], user: AuthUserLike | null) => {
  if (!isStaffUser(user)) return items;

  return items.reduce<SidebarMenuItem[]>((nextItems, item) => {
    const children = item.children?.filter((child) => canAccessItem(user, child, item.permissionAccess));
    const hasVisibleChildren = Boolean(children?.length);

    if (!canAccessItem(user, item) && !hasVisibleChildren) return nextItems;

    nextItems.push(children ? { ...item, children } : item);
    return nextItems;
  }, []);
};

export const findPermissionAccessForPath = (pathname: string, items: SidebarMenuItem[] = menuItems) => {
  const matches: Array<{ href: string; access?: string | string[] }> = [];

  const visit = (item: SidebarMenuItem, inheritedAccess?: string | string[]) => {
    const access = item.permissionAccess ?? inheritedAccess;

    if (item.href && isRouteMatch(pathname, item.href)) {
      matches.push({ href: item.href, access });
    }

    item.children?.forEach((child) => visit(child, access));
  };

  items.forEach((item) => visit(item));
  extraRouteAccesses.forEach((route) => {
    if (isRouteMatch(pathname, route.href)) {
      matches.push(route);
    }
  });
  matches.sort((first, second) => normalizePath(second.href).length - normalizePath(first.href).length);
  return matches[0]?.access;
};

export const canAccessPath = (user: AuthUserLike | null, pathname: string) => {
  if (!isStaffUser(user)) return true;
  return hasStaffPermission(user, findPermissionAccessForPath(pathname), "read");
};

export const getFirstAccessiblePath = (user: AuthUserLike | null) => {
  const firstItem = filterSidebarItemsForUser(menuItems, user).find((item) => item.href || item.children?.[0]?.href);
  return firstItem?.href ?? firstItem?.children?.[0]?.href ?? null;
};
