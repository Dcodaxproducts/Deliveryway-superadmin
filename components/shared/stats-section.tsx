import StatsCard from "../cards/stats-card";
import { cn } from "@/lib/utils";
import type { StatItem } from "@/types/stats";

type SharedStatItem = Omit<StatItem, "footerType"> & {
  footerType: string;
};

export default function StatsSection({
  stats,
  className,
  isLoading,
}: {
  stats: SharedStatItem[];
  className?: string;
  isLoading?: boolean;
}) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-[24px] w-full", className)}>
      {isLoading
        ? Array.from({ length: 4 }).map((_, i) => (
            <StatsCard key={i} isLoading={true} />
          ))
        : stats.map((stat: SharedStatItem) => (
            <StatsCard key={stat._id} data={stat as StatItem} />
          ))}
    </div>
  );
}
