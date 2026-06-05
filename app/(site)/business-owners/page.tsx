"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import Container from "@/components/container";
import StatsSection from "@/components/pages/business-owners/stats-section";
import Filters from "@/components/pages/business-owners/filters";
import Header from "@/components/pages/business-owners/header";
import BusinessOwnerTable from "@/components/tables/business-owner-table";
import { useGetBusinessOwnerStats } from "@/hooks/useTenants";

const BusinessOwnerPage = () => {
  const businessOwners = useTranslations("businessOwners");
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState("");
  const [tableData, setTableData] = useState<any[]>([]);

  const {
    data: businessOwnerStatsResponse,
    isLoading: statsLoading,
    isFetching: statsFetching,
    refetch: refetchBusinessOwnerStats,
  } = useGetBusinessOwnerStats();

  const businessOwnerStats = businessOwnerStatsResponse?.data;

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    refetchBusinessOwnerStats();
  };

  return (
    <Container>
      <Header
        title={businessOwners("title")}
        description={businessOwners("description")}
        onEmployeeSuccess={handleSuccess}
      />

      <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm space-y-6">
        <StatsSection
          stats={businessOwnerStats}
          loading={statsLoading || statsFetching}
        />

        <Filters onSearch={setSearch} data={tableData} />

        <BusinessOwnerTable
          refreshKey={refreshKey}
          search={search}
          setExportData={setTableData}
        />
      </div>
    </Container>
  );
};

export default BusinessOwnerPage;
