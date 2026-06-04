type StatItem = {
  _id: string;
  title: string;
  value: string;
  footerType: string;
  statusData?: {
    active: number;
    inactive: number;
  };
  trendData?: {
    direction: 'up' | 'down';
    percentage: string;
    label: string;
  };
  description ?: string
};
import StatsCard from "../cards/stats-card";
import { cn } from "@/lib/utils";

export default function StatsSection({
  stats,
  className,
  isLoading,
}: {
  stats: StatItem[];
  className?: string;
  isLoading?: boolean;
}) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-[24px] w-full", className)}>
      {isLoading
        ? Array.from({ length: 4 }).map((_, i) => (
            <StatsCard key={i} isLoading={true} />
          ))
        : stats.map((stat: StatItem) => (
            <StatsCard key={stat._id} data={stat} />
          ))}
    </div>
  );
}
