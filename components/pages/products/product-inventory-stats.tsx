"use client";

import { Label, Pie, PieChart } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
    { status: "active", count: 7234, fill: "var(--color-active)" },
    { status: "inactive", count: 2411, fill: "var(--color-inactive)" },
];

const chartConfig = {
    count: {
        label: "Products",
    },
    active: {
        label: "Active Products",
        color: "#CE181B", // Primary red
    },
    inactive: {
        label: "Inactive Products",
        color: "#E5E7EB", // Background gray
    },
} satisfies ChartConfig;

export default function ProductInventoryStats() {
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
                                                    Active Products
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy as number) + 24}
                                                    className="fill-dark text-[26px] font-semibold"
                                                >
                                                    75%
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
                        <span className="text-base text-dark">Active Products</span>
                        <span className="text-lg font-semibold text-dark">7,234</span>
                    </div>
                    <div className="h-[10px] w-full bg-[#E5E7EB] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#CE181B] rounded-full"
                            style={{ width: "85.6%" }}
                        />
                    </div>
                    <p className="text-base text-dark">85.6% of total inventory</p>
                </div>

                {/* Inactive Products Row */}
                <div className="space-y-[12px]">
                    <div className="flex justify-between items-end">
                        <span className="text-base text-dark">Inactive Products</span>
                        <span className="text-lg font-semibold text-dark">892</span>
                    </div>
                    <div className="h-[10px] w-full bg-[#E5E7EB] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#CE181B] rounded-full"
                            style={{ width: "35%" }}
                        />
                    </div>
                    <p className="text-base text-dark">86.6% of total inventory</p>
                </div>
            </div>
        </div>
    );
}