"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";

const RestaurantSelector = () => {
    const themeSettings = useTranslations("themeSettings");

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm">
            <Select>
                <SelectTrigger className="w-full h-[52px] border-gray-200 rounded-[12px] focus:ring-primary">
                    <SelectValue placeholder={themeSettings("selectRestaurant")} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="restaurant-1">{themeSettings("restaurantOption", { number: 1 })}</SelectItem>
                    <SelectItem value="restaurant-2">{themeSettings("restaurantOption", { number: 2 })}</SelectItem>
                    <SelectItem value="restaurant-3">{themeSettings("restaurantOption", { number: 3 })}</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
};

export default RestaurantSelector;
