"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import MyImage from "@/components/MyImage";
import { useGetOrder } from "@/hooks/useOrder";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { useGlobalCurrency } from "@/hooks/useGlobalCurrency";
import { formatMoney } from "@/lib/currency";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orderId: string | null;
}

export default function OrderDetailsDialog({ open, onOpenChange, orderId }: Props) {
    const common = useTranslations("common");
    const orders = useTranslations("orders");
    const products = useTranslations("products");
    const currency = useGlobalCurrency();
    const { data: order, isLoading } = useGetOrder(orderId as string);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[500px] p-0 overflow-hidden border-none rounded-[30px] bg-white">
                <div className="p-6 md:p-8">
                    <DialogHeader>
                        <DialogTitle className="text-center mb-6">
                            {orders("orderIdNumber", { id: orderId ? orderId.slice(-7) : "-------" })}
                        </DialogTitle>
                    </DialogHeader>

                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-[70px] w-full rounded-2xl" />
                            <Skeleton className="h-[70px] w-full rounded-2xl" />
                        </div>
                    ) : (
                        <>
                            {/* Items List */}
                            <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                                {order?.items?.map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between gap-4">

                                        {/* Left — Image + Info */}
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="relative size-[70px] rounded-2xl overflow-hidden shrink-0">
                                                <MyImage
                                                    src={item.menuItem?.imageUrl || "/placeholder.png"}
                                                    alt={item.menuItemName}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <span className="text-[10px] font-semibold text-[#FF4B4B] uppercase tracking-wider">
                                                    {item.menuItem?.category?.name || products("mainCourse")}
                                                </span>
                                                <h4 className="text-sm font-semisemibold text-dark leading-tight truncate">
                                                    {item.menuItemName}
                                                </h4>
                                                <div className="flex items-center gap-1 mt-1">
                                                    {[1, 2, 3, 4, 5].map((i) => (
                                                        <Star
                                                            key={i}
                                                            size={10}
                                                            className={
                                                                i <= Math.round(item.menuItem?.rating ?? 0)
                                                                    ? "fill-[#FF9900] text-[#FF9900]"
                                                                    : "fill-gray-200 text-gray-200"
                                                            }
                                                        />
                                                    ))}
                                                    {item.menuItem?.reviewCount != null && (
                                                        <span className="text-[10px] text-gray-400 ml-1">
                                                            ({orders("reviews", { count: item.menuItem.reviewCount })})
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <span className="font-semibold text-dark">{item.quantity}x</span>

                                        <span className="text-sm text-gray-400 font-medium">{formatMoney(item.unitPrice, currency)}</span>

                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-center py-6">
                                <span className="text-lg font-semibold text-dark">{orders("totalAmount")}</span>
                                <span className="text-xl font-semibold text-green">{formatMoney(order?.totalAmount, currency)}</span>
                            </div>

                            {/* Info Rows */}
                            <div className="space-y-4 mb-8">
                                <InfoRow label={orders("restaurantName")} value={order?.restaurant?.name || common("notAvailable")} />
                                <InfoRow label={orders("restaurantPhone")} value={order?.branch?.settings?.contact?.phone || common("notAvailable")} />
                                <InfoRow label={orders("customerName")} value={order?.customer?.fullName || common("notAvailable")} />
                                <InfoRow label={orders("customerPhone")} value={order?.customer?.phone || common("notAvailable")} />
                                <InfoRow label={orders("deliveryManName")} value={order?.deliveryman?.firstName || common("notAvailable")} />
                                <InfoRow label={orders("deliveryManPhone")} value={order?.deliveryman?.phone || common("notAvailable")} />
                            </div>
                        </>
                    )}

                    <Button
                        onClick={() => onOpenChange(false)}
                        variant="primary"
                        className="w-full"
                    >
                        {common("close")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center text-sm md:text-base w-full">
            <span className="text-gray flex-1 text-left">{label}</span>
            <div className="flex justify-center px-2">
                <span className="text-gray font-bold">:</span>
            </div>
            <span className="text-gray flex-1 text-right truncate capitalize">
                {value}
            </span>
        </div>
    );
}
