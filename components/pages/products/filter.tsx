"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ExportSection from "../../export";
import { useTranslations } from "next-intl";
import AsyncSelect from "@/components/ui/AsyncSelect";
import Image from "@/components/MyImage";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Restaurant } from "@/types/restaurant";

type RestaurantFetchOptions = (params: {
    search: string;
    page: number;
}) => Promise<{
    data: Restaurant[];
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
        hasNext?: boolean;
    };
}>;

type Props = {
    search?: string;
    onSearchChange?: (val: string) => void;
    status: "all" | "active" | "inactive";
    onStatusChange: (status: "all" | "active" | "inactive") => void;
    restaurant: Restaurant | null;
    onRestaurantChange: (restaurant: Restaurant | null) => void;
    fetchRestaurantOptions: RestaurantFetchOptions;
};

export default function Filters({
    search,
    onSearchChange,
    status,
    onStatusChange,
    restaurant,
    onRestaurantChange,
    fetchRestaurantOptions,
}: Props) {
    const common = useTranslations("common");
    const filters = useTranslations("filters");
    const products = useTranslations("products");

    return (
        <div className="space-y-6 rounded-[18px] border border-[#ececef] bg-white p-4 md:p-5">
            <div className="grid gap-4 lg:grid-cols-[minmax(280px,1fr)_minmax(260px,320px)_220px] lg:items-end">
                <div className="min-w-0 space-y-[6px]">
                    <Label>{common("search")}</Label>
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={18}
                        />
                        <Input
                            placeholder={filters("searchProductsPlaceholder")}
                            className="h-11 rounded-lg border-[#d8d8dc] pl-10 focus-visible:ring-primary"
                            value={search ?? undefined}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                        />
                    </div>
                </div>

                <div className="min-w-0 space-y-[6px]">
                    <Label>{products("restaurantFilter")}</Label>
                    <div className="flex items-center gap-2">
                        <AsyncSelect
                            value={restaurant}
                            onChange={onRestaurantChange}
                            fetchOptions={fetchRestaurantOptions}
                            placeholder={products("allRestaurants")}
                            searchPlaceholder={products("searchRestaurants")}
                            labelKey="name"
                            valueKey="id"
                            renderOption={(option: Restaurant) => (
                                <span className="flex items-center gap-3">
                                    <Image
                                        src={option.logoUrl}
                                        alt={option.name}
                                        width={32}
                                        height={32}
                                        className="size-8 rounded-lg border border-[#ececef] bg-white object-cover"
                                        fallbackSrc="/fallback.png"
                                    />
                                    <span className="min-w-0">
                                        <span className="block truncate font-semibold text-dark">{option.name}</span>
                                        <span className="block truncate text-xs text-gray">{option.customDomain || option.slug}</span>
                                    </span>
                                </span>
                            )}
                        />
                        {restaurant ? (
                            <button
                                type="button"
                                onClick={() => onRestaurantChange(null)}
                                className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-[#d8d8dc] text-gray transition hover:border-primary hover:bg-primary/5 hover:text-primary"
                                aria-label={products("clearRestaurantFilter")}
                            >
                                <X className="size-4" />
                            </button>
                        ) : null}
                    </div>
                </div>

                <div className="space-y-[6px]">
                    <Label htmlFor="product-status">{common("status")}</Label>
                    <Select
                        value={status}
                        onValueChange={(value) => onStatusChange(value as Props["status"])}
                    >
                        <SelectTrigger id="product-status" className="h-11 rounded-lg border-[#d8d8dc]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{products("allProducts")}</SelectItem>
                            <SelectItem value="active">{common("active")}</SelectItem>
                            <SelectItem value="inactive">{common("inactive")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <ExportSection />
        </div>
    );
}
