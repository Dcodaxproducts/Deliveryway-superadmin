import { StatItem } from "@/types/stats";

export const stats: StatItem[] = [
    {
        _id: "total-orders",
        title: "Total Products",
        value: "8,452",
        footerType: "plain",
        description: "+124 new products this month"
    },
    {
        _id: "active-products",
        title: "Active Products",
        value: "7,234",
        footerType: "plain",
        description : "Available for purchase"
    },
    {
        _id: "inactive-products",
        title: "Inactive Products",
        value: "7,234",
        footerType: "plain",
        description : "Temporarily disabled"
    }
];

export const productData = [
  { name: "Sushi", no: "#100001", restaurant: "Dragon Wok", status: "Active", price: "$4.99", blocked: true },
  { name: "Burger", no: "#100001", restaurant: "Dragon Wok", status: "Active", price: "$15.85", blocked: true },
  { name: "Pizza", no: "#100001", restaurant: "Dragon Wok", status: "Active", price: "$4.99", blocked: true },
  { name: "Sandwich", no: "#100001", restaurant: "Dragon Wok", status: "Active", price: "$15.85", blocked: true },
  { name: "Noodles", no: "#100001", restaurant: "Dragon Wok", status: "Inactive", price: "$15.85", blocked: true },
];
