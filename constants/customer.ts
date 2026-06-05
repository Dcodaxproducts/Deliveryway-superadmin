import { StatItem } from "@/types/stats";

export const statsData: StatItem[] = [
    {
        _id: "total-customers",
        titleKey: "customers.totalCustomers",
        value: "247",
        footerType: "status",
        statusData: { active: 189, inactive: 58 },
    },
    {
        _id: "total-orders",
        titleKey: "customers.regionAmerica",
        value: "247",
        footerType: "status",
        statusData: { active: 189, inactive: 58 },
    },
    {
        _id: "total-revenue",
        titleKey: "customers.regionEurope",
        value: "247",
        footerType: "status",
        statusData: { active: 189, inactive: 58 },
    },
    {
        _id: "active-tenants",
        titleKey: "customers.regionAsia",
        value: "247",
        footerType: "status",
        statusData: { active: 189, inactive: 58 },
    },
];
