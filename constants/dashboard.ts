import { StatItem } from '@/types/stats';
import { CheckCircle2, FileText, XCircle, AlertCircle } from 'lucide-react';

export const statsData: StatItem[] = [
  {
    _id: "total-restaurants",
    title: "Total Restaurants",
    value: "247",
    footerType: "status",
    statusData: { active: 189, inactive: 58 },
  },
  {
    _id: "total-orders",
    title: "Total Orders",
    value: "12,458",
    footerType: "trend",
    trendData: { direction: "up", percentage: "12.5%", label: "vs last period" },
  },
  {
    _id: "total-revenue",
    title: "Total Revenue",
    value: "$284,392",
    footerType: "trend",
    trendData: { direction: "up", percentage: "12.5%", label: "vs last period" },
  },
  {
    _id: "active-tenants",
    title: "Active Tenants",
    value: "189",
    footerType: "trend",
    trendData: { direction: "down", percentage: "2.1%", label: "vs last period" },
  },
];

export const systemHealth = [
  { label: "API Uptime", value: "99.9%", status: "success" },
  { label: "CPU Usage", value: "42%", status: "success" },
  { label: "RAM Usage", value: "76%", status: "warning" },
  { label: "Printer Status", value: "95% online", status: "success" },
  { label: "Webhook Status", value: "All active", status: "success" },
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