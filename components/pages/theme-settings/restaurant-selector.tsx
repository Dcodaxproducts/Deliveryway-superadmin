import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const RestaurantSelector = () => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm">
            <Select>
                <SelectTrigger className="w-full h-[52px] border-gray-200 rounded-[12px] focus:ring-primary">
                    <SelectValue placeholder="Select Restaurant" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="restaurant-1">Restaurant 1</SelectItem>
                    <SelectItem value="restaurant-2">Restaurant 2</SelectItem>
                    <SelectItem value="restaurant-3">Restaurant 3</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
};

export default RestaurantSelector;
