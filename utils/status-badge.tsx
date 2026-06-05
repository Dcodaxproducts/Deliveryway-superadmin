"use client";

import { useTranslations } from "next-intl";

const StatusBadge = ({ status }: { status: string }) => {
    const common = useTranslations("common");
    const label = status === "Active"
        ? common("active")
        : status === "Disabled"
        ? common("disabled")
        : status === "Inactive"
        ? common("inactive")
        : status;

    return (
        <span className={`text-sm ${status === 'Active' ? 'text-green' : 'text-primary'}`}>
            {label}
        </span>
    );
};

export default StatusBadge;
