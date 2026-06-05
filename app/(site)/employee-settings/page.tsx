"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Container from "@/components/container";
import StatsSection from "@/components/pages/employee-settings/stats-section";
import Filters from "@/components/pages/employee-settings/filters";
import EmployeeTable from "@/components/tables/employee-table";
import Header from "@/components/pages/employee-settings/header";
import { useGetEmployeesStats } from "@/hooks/useDashboard";

const EmployeeSettingsPage = () => {
  const employeeSettings = useTranslations("employeeSettings");
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState("");

  const [tableData, setTableData] = useState<any[]>([]);

  const {
    data: employeeStatsResponse,
    isLoading: isStatsLoading,
    isFetching: isStatsFetching,
    refetch: refetchEmployeeStats,
  } = useGetEmployeesStats();

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    refetchEmployeeStats();
  };

  return (
    <Container>
      <Header
        title={employeeSettings("employeeList")}
        description={employeeSettings("employeeListDescription")}
        onEmployeeSuccess={handleSuccess}
      />

      <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm space-y-6">
        <StatsSection
          stats={employeeStatsResponse?.data}
          loading={isStatsLoading || isStatsFetching}
        />

        <Filters onSearch={setSearch} data={tableData} />

        <EmployeeTable
          refreshKey={refreshKey}
          search={search}
          setExportData={setTableData}
        />
      </div>
    </Container>
  );
};

export default EmployeeSettingsPage;
