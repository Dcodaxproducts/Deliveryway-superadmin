"use client";

import { Card } from "@/components/ui/card";
import {
    XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { formatDate } from "@/utils/format-date";
import { useGetOrderTrend } from "@/hooks/useOrder";
import { useMemo } from "react";
import { useTranslations } from "next-intl";

// ✅ fallback data (always show graph)
const fallbackData = [
    { name: "Mon", value: 0 },
    { name: "Tue", value: 0 },
    { name: "Wed", value: 0 },
    { name: "Thu", value: 0 },
    { name: "Fri", value: 0 },
    { name: "Sat", value: 0 },
    { name: "Sun", value: 0 },
];

export default function SummarySection({ data }: { data: any }) {
    const common = useTranslations("common");
    const profile = useTranslations("profile");
    const restaurants = useTranslations("restaurants");

    const { data: trendData, isLoading } = useGetOrderTrend({
        restaurantId: data?.id,
        range: "daily",
    });

    const chartdata = useMemo(() => {
        const points = trendData?.points || trendData?.data?.points;

        if (!points || points.length === 0) return fallbackData;

        return points.map((item: any) => ({
            name: item.label,
            value: item.value,
            date: item.key,
            total: item.cumulativeTotal,
        }));
    }, [trendData]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[32px] w-full">
            {/* Branch Info Card */}
            <div className="space-y-[12px] lg:col-span-5">
                <h3 className="text-xl font-semibold text-dark">{profile("basicInfo")}</h3>
                <Card className="border-2 border-gray-50 rounded-[14px] px-[10px] py-[16px]">
                    <div className="space-y-4">
                        <InfoRow label={restaurants("restaurantName")} value={data?.name || common("notAvailable")} />
                        <InfoRow label={restaurants("email")} value={data?.supportContact?.email || common("notAvailable")} />
                        <InfoRow label={profile("contactNumber")} value={data?.supportContact?.phone || common("notAvailable")} />
                        <InfoRow label={restaurants("tagline")} value={data?.tagline || common("notAvailable")} />
                        <InfoRow label={restaurants("domain")} value={data?.customDomain || common("notAvailable")} />
                        <InfoRow label={common("status")} value={data?.isActive ? common("active") : common("inactive")} />
                        <InfoRow label={profile("joinedDate")} value={data?.createdAt ? formatDate(data.createdAt) : common("notAvailable")} />
                    </div>
                </Card>
            </div>

            {/* Graph */}
            <Card className="lg:col-span-7 p-2 md:p-6 lg:p-[30px] border-none shadow-none rounded-[14px] bg-white flex flex-col">
                <div className="h-[300px] w-full mt-auto">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartdata} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />

                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 10 }}
                            />

                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                width={30}
                                className="hidden md:block"
                            />

                            <Tooltip
                                formatter={(value: any) => [`${value} ${profile("orders").toLowerCase()}`, profile("orders")]}
                                labelFormatter={(_, payload: any) => {
                                    if (payload?.[0]?.payload?.date) {
                                        return formatDate(payload[0].payload.date);
                                    }
                                    return "";
                                }}
                            />

                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="var(--primary)"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorValue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>

                    {/* ✅ Only show loading (no false empty state) */}
                    {isLoading && (
                        <div className="text-center text-sm text-gray mt-4">
                            {profile("loadingTrend")}
                        </div>
                    )}
                </div>

                <div className="flex justify-center items-center gap-2 mt-4">
                    <div className="size-2 rounded-full bg-primary" />
                    <span className="text-xs font-bold text-gray">{profile("orderTrends")}</span>
                </div>
            </Card>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center text-sm md:text-base w-full">
            <span className="text-gray flex-1 text-left">{label}</span>
            <div className="flex justify-center px-2">
                <span className="text-gray font-bold">:</span>
            </div>
            <span className="text-gray flex-1 text-right truncate">
                {value}
            </span>
        </div>
    );
}
