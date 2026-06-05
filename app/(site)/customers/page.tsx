"use client";

import { useMemo, useState } from "react";
import Container from "../../../components/container";
import StatsSection from "@/components/shared/stats-section";
import Filters from "@/components/filter";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import TableSkeleton from "@/components/skeleton/table-skeleton";
import SortHeader from "@/components/tables/sort-header";
import { TableCell, TableHead } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Eye, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { useGetCustomer, useDeleteCustomer } from "@/hooks/useCustomer";
import { useGetCustomersStats } from "@/hooks/useDashboard";
import { sortData } from "@/utils/sort-data";
import { DataTable } from "@/components/custom/data-table";
import { formatDate } from "@/utils/format-date";
import CustomerDetailsDialog from "@/components/dialogs/customer-details-dialog";
import DeleteDialog from "@/components/dialogs/delete-dialog";
import { useTranslations } from "next-intl";

type SortKey =
  | "firstName"
  | "email"
  | "createdAt"
  | "isActive"
  | "restaurantId";

const WorldWideCustomerPage = () => {
  const common = useTranslations("common");
  const customersText = useTranslations("customers");
  const dialogs = useTranslations("dialogs");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [deleteEmail, setDeleteEmail] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, isError } = useGetCustomer({
    page,
    search: debouncedSearch || undefined,
  });

  const {
    data: customerStatsResponse,
    isLoading: isStatsLoading,
    isFetching: isStatsFetching,
  } = useGetCustomersStats();

  const { mutate: deleteCustomer, isPending: isDeleting } = useDeleteCustomer();

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteEmail) return;

    deleteCustomer([deleteEmail], {
      onSuccess: () => setDeleteEmail(null),
    });
  };

  const customers = data?.data ?? [];
  const sorted = sortKey ? sortData(customers, sortKey, sortDir) : customers;

  const customerStats = customerStatsResponse?.data;

  const statsData = useMemo(
    () => [
      {
        _id: "total-customers",
        titleKey: "customers.totalCustomers",
        value: String(customerStats?.totalCustomers ?? 0),
        footerType: "status",
        statusData: {
          active: customerStats?.activeCustomers ?? 0,
          inactive: customerStats?.inactiveCustomers ?? 0,
        },
      },
      {
        _id: "active-customers",
        titleKey: "customers.activeCustomers",
        value: String(customerStats?.activeCustomers ?? 0),
        footerType: "plain",
        descriptionKey: "customers.currentlyActiveCustomers",
      },
      {
        _id: "inactive-customers",
        titleKey: "customers.inactiveCustomers",
        value: String(customerStats?.inactiveCustomers ?? 0),
        footerType: "plain",
        descriptionKey: "customers.currentlyInactiveCustomers",
      },
      {
        _id: "new-customers",
        titleKey: "customers.newCustomers",
        value: String(customerStats?.newCustomersLast30Days ?? 0),
        footerType: "trend",
        trendData: {
          direction: "up" as const,
          percentage: String(customerStats?.newCustomersLast30Days ?? 0),
          labelKey: "customers.inLast30Days",
        },
      },
    ],
    [customerStats]
  );

  if (isError) {
    return (
      <p className="p-10 text-center font-medium text-red-500">
        {customersText("loadError")}
      </p>
    );
  }

  return (
    <Container>
      <StatsSection
        stats={statsData}
        className="xl:grid-cols-4"
        isLoading={isStatsLoading || isStatsFetching}
      />

      <Header
        title={customersText("worldwideCustomers")}
        description={customersText("description")}
      />

      <div className="space-y-[30px] rounded-[14px] bg-white lg:p-[24px]">
        <Filters
          type="customers"
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
        />

        <div className="flex flex-col items-center gap-4 px-4 lg:flex-row lg:pl-6">
          <Button
            variant="primary"
            className="w-full rounded-[14px] lg:w-auto"
          >
            {customersText("activeCustomers")}
          </Button>

          <Button
            variant="ghost"
            className="w-full text-base font-semibold text-gray lg:w-auto"
          >
            {customersText("blockedCustomers")}
          </Button>
        </div>

        {isLoading ? (
          <TableSkeleton cols={7} rows={10} />
        ) : (
          <DataTable
            data={sorted}
            headers={
              <>
                <SortHeader
                  label={customersText("customerName")}
                  sortKey="firstName"
                  activeKey={sortKey}
                  direction={sortDir}
                  onSort={handleSort}
                />
                <SortHeader
                  label={customersText("customerInfo")}
                  sortKey="email"
                  activeKey={sortKey}
                  direction={sortDir}
                  onSort={handleSort}
                />
                <SortHeader
                  label={customersText("joiningDate")}
                  sortKey="createdAt"
                  activeKey={sortKey}
                  direction={sortDir}
                  onSort={handleSort}
                />
                <TableHead>{common("status")}</TableHead>
                <SortHeader
                  label={customersText("restaurant")}
                  sortKey="restaurantId"
                  activeKey={sortKey}
                  direction={sortDir}
                  onSort={handleSort}
                />
                <TableHead className="text-center">{customersText("block")}</TableHead>
                <TableHead className="text-center">{common("actions")}</TableHead>
              </>
            }
            row={(customer: any) => (
              <>
                <TableCell className="capitalize">
                  {customer.profile?.firstName
                    ? `${customer.profile.firstName} ${
                        customer.profile.lastName || ""
                      }`
                    : common("notAvailable")}
                </TableCell>

                <TableCell>
                  <div className="flex flex-col">
                    <span className="max-w-[180px] truncate text-sm text-gray">
                      {customer.email}
                    </span>
                    <span className="text-xs text-[#A3A3A3]">
                      {customer.profile?.phone || common("notAvailable")}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="whitespace-nowrap text-gray">
                  {formatDate(customer.createdAt)}
                </TableCell>

                <TableCell>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      customer.isActive ? "text-green" : "text-primary"
                    )}
                  >
                    {customer.isActive ? common("active") : common("inactive")}
                  </span>
                </TableCell>

                <TableCell className="truncate text-gray">
                  {customer.restaurantId || "-"}
                </TableCell>

                <TableCell>
                  <div className="flex justify-center">
                    <Switch
                      className="scale-90 data-[state=checked]:bg-primary data-[state=unchecked]:bg-[#E6E7EC]"
                      defaultChecked={customer.isActive}
                    />
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center justify-center gap-3 text-gray">
                    <button
                      className="cursor-pointer transition-colors hover:text-dark"
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <Eye size={20} />
                    </button>

                    <button
                      className="cursor-pointer transition-colors hover:text-red-500"
                      onClick={() => setDeleteEmail(customer.email)}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </TableCell>
              </>
            )}
            pagination={
              data?.meta ? { ...data.meta, onPageChange: setPage } : undefined
            }
          />
        )}
      </div>

      <CustomerDetailsDialog
        open={!!selectedCustomer}
        onOpenChange={(open) => !open && setSelectedCustomer(null)}
        customer={selectedCustomer}
      />

      <DeleteDialog
        open={!!deleteEmail}
        onOpenChange={(open) => !open && setDeleteEmail(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title={dialogs("deleteCustomer")}
        description={dialogs("deleteCustomerDescription")}
      />
    </Container>
  );
};

export default WorldWideCustomerPage;
