import { StatItem } from "@/types/stats";

export const stats: StatItem[] = [
    {
        _id: "total-orders",
        titleKey: "products.totalProducts",
        value: "8,452",
        footerType: "plain",
        descriptionKey: "products.newProductsThisMonth"
    },
    {
        _id: "active-products",
        titleKey: "products.activeProducts",
        value: "7,234",
        footerType: "plain",
        descriptionKey : "products.availableForPurchase"
    },
    {
        _id: "inactive-products",
        titleKey: "products.inactiveProducts",
        value: "7,234",
        footerType: "plain",
        descriptionKey : "products.temporarilyDisabled"
    }
];

export const productData = [
  { name: "Sushi", no: "#100001", restaurant: "Dragon Wok", statusKey: "common.active", price: "$4.99", blocked: true },
  { name: "Burger", no: "#100001", restaurant: "Dragon Wok", statusKey: "common.active", price: "$15.85", blocked: true },
  { name: "Pizza", no: "#100001", restaurant: "Dragon Wok", statusKey: "common.active", price: "$4.99", blocked: true },
  { name: "Sandwich", no: "#100001", restaurant: "Dragon Wok", statusKey: "common.active", price: "$15.85", blocked: true },
  { name: "Noodles", no: "#100001", restaurant: "Dragon Wok", statusKey: "common.inactive", price: "$15.85", blocked: true },
];
