"use client";

import { Search , ListFilter} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ExportSection from "../../export";
import { Button } from "../../ui/button";

type Props = {
    search?: string;
    onSearchChange?: (val: string) => void;
};

export default function Filters({ search, onSearchChange }: Props) {
    return (
        <div className="bg-white p-4 lg:p-[24px] rounded-[14px] lg:border-2 border-[#F3F4F6] space-y-[30px]">
            <div className="flex flex-col gap-[20px] md:flex-row md:items-end md:flex-wrap">
                <div className="flex-1 min-w-[280px] space-y-[6px]">
                    <Label>Search</Label>
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={18}
                        />
                        <Input
                            placeholder="Search by product name or SKU"
                            className="pl-10 border-[#BBBBBB] focus-visible:ring-primary"
                            value={search ?? undefined}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                        />
                    </div>
                </div>

                <div className="w-full md:w-[230px] space-y-[6px]">
                    <Button
                        variant="primary"
                        className="w-full font-normal h-[52px] rounded-[14px]"
                    >
                        <>
                            <ListFilter size={18} />
                            Filter
                        </>
                    </Button>
                </div>
            </div>
            <ExportSection />
        </div>
    );
}