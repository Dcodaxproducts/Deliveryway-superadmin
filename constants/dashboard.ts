import { StatItem } from '@/types/stats';
import { CheckCircle2, FileText, XCircle, AlertCircle } from 'lucide-react';

export const statsData: StatItem[] = [
  {
    _id: "total-restaurants",
    titleKey: "dashboard.totalRestaurants",
    value: "247",
    footerType: "status",
    statusData: { active: 189, inactive: 58 },
  },
  {
    _id: "total-orders",
    titleKey: "dashboard.totalOrders",
    value: "12,458",
    footerType: "trend",
    trendData: { direction: "up", percentage: "12.5%", labelKey: "dashboard.vsLastPeriod" },
  },
  {
    _id: "total-revenue",
    titleKey: "dashboard.totalRevenue",
    value: "$284,392",
    footerType: "trend",
    trendData: { direction: "up", percentage: "12.5%", labelKey: "dashboard.vsLastPeriod" },
  },
  {
    _id: "active-tenants",
    titleKey: "dashboard.activeTenants",
    value: "189",
    footerType: "trend",
    trendData: { direction: "down", percentage: "2.1%", labelKey: "dashboard.vsLastPeriod" },
  },
];

export const systemHealth = [
  { labelKey: "dashboard.apiUptime", value: "99.9%", status: "success" },
  { labelKey: "dashboard.cpuUsage", value: "42%", status: "success" },
  { labelKey: "dashboard.ramUsage", value: "76%", status: "warning" },
  { labelKey: "dashboard.printerStatus", value: "95% online", status: "success" },
  { labelKey: "dashboard.webhookStatus", value: "All active", status: "success" },
];

export const recentActivity = [
  {
    id: 1,
    title: 'New restaurant "Bella Italia" added to platform',
    time: "2 minutes ago",
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-[#DCFCE7]",
  },
  {
    id: 2,
    title: 'Monthly invoice generated for "Sushi Palace"',
    time: "15 minutes ago",
    icon: FileText,
    color: "text-blue-500",
    bg: "bg-[#DBEAFE]",
  },
  {
    id: 3,
    title: 'Restaurant "Burger House" temporarily deactivated',
    time: "1 hour ago",
    icon: XCircle,
    color: "text-orange-500",
    bg: "bg-[#FFEDD4]",
  },
  {
    id: 4,
    title: 'High RAM usage detected on server-3',
    time: "2 hours ago",
    icon: AlertCircle,
    color: "text-red-500",
    bg: "bg-primary/10",
  },
  {
    id: 5,
    title: 'New restaurant "Taco Fiesta" added to platform',
    time: "3 hours ago",
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-[#DCFCE7]",
  },
];
