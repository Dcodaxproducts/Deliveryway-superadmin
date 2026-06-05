"use client";

import { useTranslations } from "next-intl";
import {
  Users,
  UserCheck,
  UserX,
  BriefcaseBusiness,
} from "lucide-react";

type EmployeeRoleBreakdown = {
  staffRoleId: string;
  name: string;
  count: number;
};

type EmployeeStats = {
  totalEmployees?: number;
  activeEmployees?: number;
  inactiveEmployees?: number;
  roleBreakdown?: EmployeeRoleBreakdown[];
};

interface StatsSectionProps {
  stats?: EmployeeStats;
  loading?: boolean;
}

const StatsSection = ({ stats, loading }: StatsSectionProps) => {
  const employeeSettings = useTranslations("employeeSettings");
  const totalEmployees = stats?.totalEmployees ?? 0;
  const activeEmployees = stats?.activeEmployees ?? 0;
  const inactiveEmployees = stats?.inactiveEmployees ?? 0;
  const totalRoles = stats?.roleBreakdown?.length ?? 0;

  const cards = [
    {
      title: employeeSettings("totalEmployees"),
      value: totalEmployees,
      icon: Users,
    },
    {
      title: employeeSettings("activeEmployees"),
      value: activeEmployees,
      icon: UserCheck,
    },
    {
      title: employeeSettings("inactiveEmployees"),
      value: inactiveEmployees,
      icon: UserX,
    },
    {
      title: employeeSettings("totalRoles"),
      value: totalRoles,
      icon: BriefcaseBusiness,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <div
            key={index}
            className="bg-white p-6 rounded-lg border border-gray-200 flex items-center gap-[28px]"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              {loading ? (
                <div className="h-5 w-5 animate-pulse rounded-full bg-gray-200" />
              ) : (
                <Icon className="text-primary" size={22} />
              )}
            </div>

            <div className="flex-1">
              {loading ? (
                <>
                  <div className="h-8 w-16 rounded-md bg-gray-200 animate-pulse mb-2" />
                  <div className="h-4 w-28 rounded-md bg-gray-200 animate-pulse" />
                </>
              ) : (
                <>
                  <p className="text-[32px] font-semibold text-dark">
                    {stat.value}
                  </p>
                  <p className="text-base text-gray">{stat.title}</p>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsSection;
