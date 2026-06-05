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
  Repeat,
} from "lucide-react";
import { PiUsersThree } from "react-icons/pi";

export type SidebarMenuItem = {
  titleKey: string;
  title?: string;
  icon: ElementType;
  href?: string;
  children?: SidebarMenuItem[];
};

export const menuItems: SidebarMenuItem[] = [
  { titleKey: "navigation.dashboard", icon: LayoutGrid, href: "/" },
  { titleKey: "navigation.manageRestaurants", icon: Store, href: "/restaurants" },
  { titleKey: "navigation.globalSettings", icon: Globe, href: "/global-settings" },
  { titleKey: "navigation.worldwideCustomers", icon: Users, href: "/customers" },
  { titleKey: "navigation.businessOwners", icon: Users, href: "/business-owners" },
  { titleKey: "navigation.ordersRevenuePerformance", icon: BarChart3, href: "/orders" },
  { titleKey: "navigation.employeeSettings", icon: PiUsersThree, href: "/employee-settings" },
  { titleKey: "navigation.productOverview", icon: Box, href: "/products" },
  { titleKey: "navigation.rbac", icon: ShieldCheck, href: "/rbac" },
  // { title: "Business Models", icon: Gift, href: "/models" },

  {
    titleKey: "navigation.pricingModelFinancials",
    icon: BarChart3,
    href: "/pricing-model",
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
      {
        titleKey: "navigation.subscriptions",
        icon: Repeat,
        href: "/pricing-model/subscriptions",
      },
    ],
  },

  { titleKey: "navigation.invoicingFinancials", icon: Receipt, href: "/invoicing" },
  { titleKey: "navigation.reportsAnalytics", icon: LineChart, href: "/analytics" },
  { titleKey: "navigation.systemHealthMonitoring", icon: ShieldAlert, href: "/monitoring" },
  // { title: "Theme Setting", icon: Palette, href: "/theme-settings" },
  { titleKey: "navigation.notificationSettings", icon: Bell, href: "/notification-settings" },
  // { title: "Backups & Maintenance", icon: Database, href: "/maintenance" },
];
