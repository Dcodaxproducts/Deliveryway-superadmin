"use client";

import { useState } from "react";
import Container from "@/components/container";
import Header from "@/components/pages/restaurants/header";
import Filters from "@/components/filter";
import { DataTable } from "@/components/custom/data-table";
import TableSkeleton from "@/components/skeleton/table-skeleton";
import { useGetRestaurants, useDeleteRestaurant } from "@/hooks/useRestaurant";
import { Restaurant } from "@/types/restaurant";
import { useDebounce } from "@/hooks/useDebounce";
import { TableCell, TableHead } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import StatusBadge from "@/utils/status-badge";
import Image from "@/components/MyImage";
import { formatDate } from "@/utils/format-date";
import { Edit2, Eye, Trash2 } from "lucide-react";
import DeleteDialog from "@/components/dialogs/delete-dialog";
import SortHeader from "@/components/tables/sort-header";
import { sortData } from "@/utils/sort-data";
import Link from "next/link";

type SortKey = "name" | "customDomain" | "tagline" | "createdAt" | "isActive";
type SortDir = "asc" | "desc";

export default function RestaurantsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [sortKey, setSortKey] = useState<SortKey | null>(null);
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const debouncedSearch = useDebounce(search, 500);

    const { data, isLoading, isError } = useGetRestaurants({
        page,
        search: debouncedSearch || undefined,
        includeInactive: status === "disabled" ? true : status === "active" ? false : undefined,
    });

    const { mutate: deleteRestaurant, isPending: isDeleting } = useDeleteRestaurant();

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    };

    const handleDeleteConfirm = () => {
        if (!deleteId) return;
        deleteRestaurant(deleteId, {
            onSuccess: () => setDeleteId(null),
        });
    };

    const restaurants = data?.data ?? [];
    const sorted = sortKey ? sortData(restaurants, sortKey, sortDir) : restaurants;

    if (isError) return <p className="text-sm text-red-500 text-center py-6">Something went wrong.</p>;

    return (
        <Container>
            <Header title="Restaurants List" description="View and manage all Restaurants from here" />

            <div className="space-y-[32px] bg-white lg:p-[30px] lg:rounded-[14px] lg:shadow-sm">
                <Filters
                    type="restaurant"
                    search={search}
                    onSearchChange={(val) => { setSearch(val); setPage(1); }}
                    status={status}
                    onStatusChange={(val) => { setStatus(val); setPage(1); }}
                />

                {isLoading ? (
                    <TableSkeleton cols={8} rows={10} />
                ) : (
                    <DataTable
                        data={sorted}
                        headers={
                            <>
                                <TableHead><span className="text-sm font-medium">SL</span></TableHead>
                                <SortHeader label="Restaurant Name" sortKey="name" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                                <SortHeader label="Domain" sortKey="customDomain" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                                <SortHeader label="Tagline" sortKey="tagline" activeKey={sortKey} direction={sortDir} onSort={handleSort} className="text-center" />
                                <SortHeader label="Created Date" sortKey="createdAt" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                                <SortHeader label="Status" sortKey="isActive" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                                <TableHead className="text-right font-medium">Actions</TableHead>
                            </>
                        }
                        row={(item: Restaurant, index) => (
                            <>
                                <TableCell className="text-gray">{index + 1}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-[42px] h-[42px] rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                            <Image
                                                src={item.logoUrl || "/placeholder.svg"}
                                                alt={item.name}
                                                width={256}
                                                height={256}
                                                className="w-[42px] h-[42px] object-contain"
                                            />
                                        </div>
                                        <span className="text-gray capitalize">{item.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-gray text-sm">{item.customDomain || "N/A"}</TableCell>
                                <TableCell className="text-gray text-sm capitalize">{item.tagline}</TableCell>
                                <TableCell className="text-gray text-sm">{formatDate(item.createdAt)}</TableCell>
                                <TableCell>
                                    <StatusBadge status={item.isActive ? "Active" : "Disabled"} />
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end items-center px-[11px] py-[10px] border border-[#E6E7EC] rounded-sm w-fit ml-auto divide-x divide-[#E6E7EC]">
                                        <Link
                                            href={`/restaurants/${item.id}`}
                                            className="pr-[11px] text-gray-400 hover:text-dark transition-colors"
                                        >
                                            <Eye size={20} />
                                        </Link>

                                        <Link
                                            href={`/restaurants/${item.id}/edit`}
                                            className="px-[11px] text-gray-400 hover:text-dark transition-colors"
                                        >
                                            <Edit2 size={18} />
                                        </Link>

                                        <button
                                            className="pl-[11px] text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                            onClick={() => setDeleteId(item.id)}
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </TableCell>
                            </>
                        )}
                        pagination={data?.meta ? { ...data.meta, onPageChange: setPage } : undefined}
                    />
                )}
            </div>

            <DeleteDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                onConfirm={handleDeleteConfirm}
                isLoading={isDeleting}
                title="Delete Restaurant"
                description="Are you sure you want to delete this restaurant? This action cannot be undone."
            />
        </Container>
    );
}