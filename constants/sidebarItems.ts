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
  title: string;
  icon: ElementType;
  href?: string;
  children?: SidebarMenuItem[];
};

export const menuItems: SidebarMenuItem[] = [
  { title: "Dashboard", icon: LayoutGrid, href: "/" },
  { title: "Manage Restaurants", icon: Store, href: "/restaurants" },
  { title: "Global Settings", icon: Globe, href: "/global-settings" },
  { title: "Worldwide Customers", icon: Users, href: "/customers" },
  { title: "Business Owners", icon: Users, href: "/business-owners" },
  { title: "Orders & Revenue Performance", icon: BarChart3, href: "/orders" },
  { title: "Employee Settings", icon: PiUsersThree, href: "/employee-settings" },
  { title: "Product Overview", icon: Box, href: "/products" },
  { title: "Roles & Access (RBAC)", icon: ShieldCheck, href: "/rbac" },
  // { title: "Business Models", icon: Gift, href: "/models" },

  {
    title: "Pricing Model (Financials)",
    icon: BarChart3,
    href: "/pricing-model",
    children: [
      {
        title: "Create New Plan",
        icon: FilePlus2,
        href: "/pricing-model/create-new-plan",
      },
      {
        title: "Plans Listing",
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
        title: "Subscriptions",
        icon: Repeat,
        href: "/pricing-model/subscriptions",
      },
    ],
  },

  { title: "Invoicing & Financials", icon: Receipt, href: "/invoicing" },
  { title: "Reports & Analytics", icon: LineChart, href: "/analytics" },
  { title: "System Health & Monitoring", icon: ShieldAlert, href: "/monitoring" },
  // { title: "Theme Setting", icon: Palette, href: "/theme-settings" },
  { title: "Notification Setting", icon: Bell, href: "/notification-settings" },
  // { title: "Backups & Maintenance", icon: Database, href: "/maintenance" },
];