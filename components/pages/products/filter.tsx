"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ExportSection from "../../export";
import { useTranslations } from "next-intl";

type Props = {
    search?: string;
    onSearchChange?: (val: string) => void;
    status: "all" | "active" | "inactive";
    onStatusChange: (status: "all" | "active" | "inactive") => void;
};

export default function Filters({ search, onSearchChange, status, onStatusChange }: Props) {
    const common = useTranslations("common");
    const filters = useTranslations("filters");
    const products = useTranslations("products");

    return (
        <div className="bg-white p-4 lg:p-[24px] rounded-[14px] lg:border-2 border-[#F3F4F6] space-y-[30px]">
            <div className="flex flex-col gap-[20px] md:flex-row md:items-end md:flex-wrap">
                <div className="flex-1 min-w-[280px] space-y-[6px]">
                    <Label>{common("search")}</Label>
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={18}
                        />
                        <Input
                            placeholder={filters("searchProductsPlaceholder")}
                            className="pl-10 border-[#BBBBBB] focus-visible:ring-primary"
                            value={search ?? undefined}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                        />
                    </div>
                </div>

                <div className="w-full md:w-[230px] space-y-[6px]">
                    <Label htmlFor="product-status">{common("status")}</Label>
                    <select
                        id="product-status"
                        value={status}
                        onChange={(event) => onStatusChange(event.target.value as Props["status"])}
                        className="h-[52px] w-full rounded-[14px] border border-[#BBBBBB] bg-white px-4 text-sm text-dark outline-none transition-shadow focus:ring-2 focus:ring-primary/30"
                    >
                        <option value="all">{products("allProducts")}</option>
                        <option value="active">{common("active")}</option>
                        <option value="inactive">{common("inactive")}</option>
                    </select>
                </div>
            </div>
            <ExportSection />
        </div>
    );
}
