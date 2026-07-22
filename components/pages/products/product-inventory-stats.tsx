"use client";

import { Label, Pie, PieChart } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { useTranslations } from "next-intl";

type ProductInventoryStatsProps = {
    activeCount: number;
    inactiveCount: number;
    isLoading?: boolean;
};

export default function ProductInventoryStats({ activeCount, inactiveCount, isLoading }: ProductInventoryStatsProps) {
    const products = useTranslations("products");
    const totalCount = activeCount + inactiveCount;
    const activePercentage = totalCount ? (activeCount / totalCount) * 100 : 0;
    const inactivePercentage = totalCount ? (inactiveCount / totalCount) * 100 : 0;
    const chartData = [
        { status: "active", count: activeCount, fill: "var(--color-active)" },
        { status: "inactive", count: inactiveCount, fill: "var(--color-inactive)" },
    ];
    const chartConfig = {
        count: {
            label: products("products"),
        },
        active: {
            label: products("activeProducts"),
            color: "#CE181B",
        },
        inactive: {
            label: products("inactiveProducts"),
            color: "#E5E7EB",
        },
    } satisfies ChartConfig;

    return (
        <div className="flex flex-col lg:flex-row items-center gap-[60px] py-[20px] bg-white rounded-[14px] w-full">

            {/* Left Section: Radial Progress Chart (246px) */}
            <div className="w-[246px] h-[246px] shrink-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square h-full w-full"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={chartData}
                            dataKey="count"
                            nameKey="status"
                            innerRadius={90}
                            outerRadius={116}
                            strokeWidth={0}
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={(viewBox.cy as number)}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy as number) - 18}
                                                    className="fill-dark text-base"
                                                >
                                                    {products("activeProducts")}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy as number) + 24}
                                                    className="fill-dark text-[26px] font-semibold"
                                                >
                                                    {isLoading ? "—" : `${activePercentage.toFixed(1)}%`}
                                                </tspan>
                                            </text>
                                        );
                                    }
                                }}
                            />
                        </Pie>

                    </PieChart>
                </ChartContainer>
            </div>

            {/* Right Section: Linear Progress Breakdowns */}
            <div className="flex-1 w-full space-y-[32px]">
                {/* Active Products Row */}
                <div className="space-y-[12px]">
                    <div className="flex justify-between items-end">
                        <span className="text-base text-dark">{products("activeProducts")}</span>
                        <span className="text-lg font-semibold text-dark">{isLoading ? "—" : activeCount.toLocaleString()}</span>
                    </div>
                    <div className="h-[10px] w-full bg-[#E5E7EB] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#CE181B] rounded-full"
                            style={{ width: `${activePercentage}%` }}
                        />
                    </div>
                    <p className="text-base text-dark">{products("ofTotalInventory", { percentage: `${activePercentage.toFixed(1)}%` })}</p>
                </div>

                {/* Inactive Products Row */}
                <div className="space-y-[12px]">
                    <div className="flex justify-between items-end">
                        <span className="text-base text-dark">{products("inactiveProducts")}</span>
                        <span className="text-lg font-semibold text-dark">{isLoading ? "—" : inactiveCount.toLocaleString()}</span>
                    </div>
                    <div className="h-[10px] w-full bg-[#E5E7EB] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#CE181B] rounded-full"
                            style={{ width: `${inactivePercentage}%` }}
                        />
                    </div>
                    <p className="text-base text-dark">{products("ofTotalInventory", { percentage: `${inactivePercentage.toFixed(1)}%` })}</p>
                </div>
            </div>
        </div>
    );
}
