import { StatItem } from "@/types/stats";
import StatsCard from "../../cards/stats-card";

const stats:StatItem[] = [
  {
    _id: "total-revenue",
    title: "Total Revenue",
    value: "$284,392",
    footerType: "trend",
    trendData: { direction: "up", percentage: "12.5%", label: "vs last period" },
  },
    {
    _id: "total-orders",
    title: "Total Orders",
    value: "12,458",
    footerType: "trend",
    trendData: { direction: "up", percentage: "12.5%", label: "vs last period" },
  },
];

export default function OrderAndRevenueSection() {
  return (
    <div className="space-y-[32px]">
      <h3 className="text-lg font-semibold text-dark">Orders & Revenue Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[32px]">
        {stats.map((stat) => (
          <StatsCard data={stat} />
        ))}
      </div>
    </div>
  );
}