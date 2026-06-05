import { useTranslations } from "next-intl";
import { MonitoringLogsTable } from "./table";

export const IntegrationLogsSection = () => {
    const monitoring = useTranslations("monitoring");

    return (
        <section className="space-y-[20px]">
            <h3 className="text-lg font-semibold text-dark">
                {monitoring("integrationLogs")}
            </h3>
            <MonitoringLogsTable />
        </section>
    );
};
