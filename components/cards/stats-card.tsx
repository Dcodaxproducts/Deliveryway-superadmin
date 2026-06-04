import { Card } from '@/components/ui/card'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { StatItem } from '@/types/stats';

// ... (StatItem type remains same)

interface StatsCardProps {
    data?: any;
    isLoading?: boolean;
}

const StatsCard = ({ data, isLoading }: StatsCardProps) => {
    const router = useRouter();

    if (isLoading || !data) {
        return (
            <Card className="relative flex flex-col justify-between p-[24px] border-none shadow-none rounded-[14px] h-[114px]">
                <div className="flex items-start justify-between">
                    <Skeleton className="h-5 w-[100px]" />
                    <Skeleton className="h-6 w-[60px]" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-[140px]" />
                </div>
            </Card>
        );
    }

    return (
        <Card
            key={data._id}
            onClick={() => router.push(`${data.title === "Total Customers" || data.title === "Total Tenants " ? "/customers" : "/restaurants"}`)}
            style={{
                background: `linear-gradient(134.39deg, rgba(216, 0, 39, 0) 50.72%, rgba(216, 0, 39, 0.12) 107.74%), #FFFFFF`,
            }}
            className="relative flex flex-col justify-between p-[24px] border-none shadow-none rounded-[14px] cursor-pointer"
        >
            <div className="flex items-start justify-between">
                <span className="text-gray text-base font-medium truncate">
                    {data.title}
                </span>
                <span className="text-dark text-lg font-semibold truncate">
                    {data.value}
                </span>
            </div>

            <div className="flex items-center text-base text-gray">
                {data.footerType === "status" && (
                    <div className="flex items-center gap-[12px] truncate">
                        <div className="flex items-center gap-1.5">
                            <div className="size-2 rounded-full bg-green"></div>
                            <span>{data.statusData?.active} active</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="size-2 rounded-full bg-gray-2"></div>
                            <span>{data.statusData?.inactive} inactive</span>
                        </div>
                    </div>
                )}

                {data.footerType === "trend" && (
                    <div className="flex items-center">
                        <span
                            className={`flex items-center gap-1 mr-1.5 ${data.trendData?.direction === "up"
                                ? "text-green"
                                : "text-primary"
                                }`}
                        >
                            {data.trendData?.direction === "up" ? (
                                <ArrowUp size={14} strokeWidth={3} />
                            ) : (
                                <ArrowDown size={14} strokeWidth={3} />
                            )}
                            {data.trendData?.percentage}
                        </span>
                        <span>{data.trendData?.label}</span>
                    </div>
                )}

                {data.footerType === "plain" && (
                    <div className="flex items-center gap-[12px] truncate">
                        <span>{data.description}</span>
                    </div>
                )}
            </div>
        </Card>
    )
}

export default StatsCard;