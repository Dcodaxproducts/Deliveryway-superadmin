import type { ElementType } from "react";
import {
  LayoutGrid,
  Store,
  Globe,
  Users,
  BarChart3,
  Box,
  ShieldCheck,
  Gift,
  Receipt,
  LineChart,
  ShieldAlert,
  Bell,
  Palette,
  FilePlus2,
  ListChecks,
  Calculator,
  FileText,
  Building2,
  Utensils,
} from "lucide-react";
import { PiUsersThree } from "react-icons/pi";

export type SidebarMenuItem = {
  titleKey: string;
  title?: string;
  icon: ElementType;
  href?: string;
  permissionAccess?: string | string[];
  children?: SidebarMenuItem[];
};

export const menuItems: SidebarMenuItem[] = [
  { titleKey: "navigation.dashboard", icon: LayoutGrid, href: "/", permissionAccess: "dashboard" },
  { titleKey: "navigation.manageRestaurants", icon: Store, href: "/restaurants", permissionAccess: "branch-management" },
  { titleKey: "navigation.globalSettings", icon: Globe, href: "/global-settings", permissionAccess: "storefront-settings" },
  { titleKey: "navigation.worldwideCustomers", icon: Users, href: "/customers", permissionAccess: "customer-management" },
  { titleKey: "navigation.businessOwners", icon: Users, href: "/business-owners", permissionAccess: "branch-management" },
  { titleKey: "navigation.ordersRevenuePerformance", icon: BarChart3, href: "/orders", permissionAccess: "order-management" },
  { titleKey: "navigation.employeeSettings", icon: PiUsersThree, href: "/employee-settings", permissionAccess: "employees" },
  { titleKey: "navigation.productOverview", icon: Box, href: "/products", permissionAccess: "menu-management" },
  { titleKey: "navigation.cuisines", icon: Utensils, href: "/menu/cuisines", permissionAccess: "menu-management" },
  { titleKey: "navigation.rbac", icon: ShieldCheck, href: "/rbac", permissionAccess: "employees" },
  // { title: "Business Models", icon: Gift, href: "/models" },

  {
    titleKey: "navigation.pricingModelFinancials",
    icon: BarChart3,
    href: "/pricing-model",
    permissionAccess: "payment-settings",
    children: [
      {
        titleKey: "navigation.createNewPlan",
        icon: FilePlus2,
        href: "/pricing-model/create-new-plan",
      },
      {
        titleKey: "navigation.plansListing",
        icon: ListChecks,
        href: "/pricing-model/plans-listing",
      },
      // {
      //   title: "Pricing Engine",
      //   icon: Calculator,
      //   href: "/pricing-model/pricing-engine",
      // },
      // {
      //   title: "Invoices & VAT",
      //   icon: FileText,
      //   href: "/pricing-model/invoices-vat",
      // },
      // {
      //   title: "Restaurant billing",
      //   icon: Building2,
      //   href: "/pricing-model/restaurant-billing",
      // },
    ],
  },

  { titleKey: "navigation.invoicingFinancials", icon: Receipt, href: "/invoicing", permissionAccess: ["reports-payouts", "payment-settings"] },
  { titleKey: "navigation.reportsAnalytics", icon: LineChart, href: "/analytics", permissionAccess: "reports-payouts" },
  { titleKey: "navigation.systemHealthMonitoring", icon: ShieldAlert, href: "/monitoring", permissionAccess: "dashboard" },
  // { title: "Theme Setting", icon: Palette, href: "/theme-settings", permissionAccess: "storefront-settings" },
  { titleKey: "navigation.notificationSettings", icon: Bell, href: "/notification-settings", permissionAccess: "notifications" },
  // { title: "Backups & Maintenance", icon: Database, href: "/maintenance" },
];
