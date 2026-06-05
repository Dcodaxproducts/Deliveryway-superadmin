"use client";

import { Users, UserCheck, UserX } from "lucide-react";
import { useTranslations } from "next-intl";

type BusinessOwnerStats = {
  totalBusinessOwners?: number;
  activeBusinessOwners?: number;
  inactiveBusinessOwners?: number;
};

interface StatsSectionProps {
  stats?: BusinessOwnerStats;
  loading?: boolean;
}

const StatsSection = ({ stats, loading = false }: StatsSectionProps) => {
  const businessOwners = useTranslations("businessOwners");
  const cards = [
    {
      title: businessOwners("totalBusinessOwners"),
      value: stats?.totalBusinessOwners ?? 0,
      icon: Users,
    },
    {
      title: businessOwners("activeBusinessOwners"),
      value: stats?.activeBusinessOwners ?? 0,
      icon: UserCheck,
    },
    {
      title: businessOwners("inactiveBusinessOwners"),
      value: stats?.inactiveBusinessOwners ?? 0,
      icon: UserX,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="bg-white p-6 rounded-lg border border-gray-200 flex items-center gap-[28px]"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              {loading ? (
                <div className="h-5 w-5 animate-pulse rounded-full bg-gray-200" />
              ) : (
                <Icon className="text-primary" size={22} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              {loading ? (
                <>
                  <div className="h-8 w-16 rounded-md bg-gray-200 animate-pulse mb-2" />
                  <div className="h-4 w-36 rounded-md bg-gray-200 animate-pulse" />
                </>
              ) : (
                <>
                  <p className="text-[32px] font-semibold text-dark leading-none">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-base text-gray">{stat.title}</p>
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
