"use client";

import { useState } from "react";
import Container from "@/components/container";
import Filters from "@/components/pages/products/filter";
import Header from "@/components/header";
import StatsSection from "@/components/shared/stats-section";
import ProductInventoryStats from "@/components/pages/products/product-inventory-stats";
import { DataTable } from "@/components/custom/data-table";
import SortHeader from "../../../components/tables/sort-header";
import TableSkeleton from "@/components/skeleton/table-skeleton";
import { TableCell, TableHead } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Eye, Trash2 } from "lucide-react";
import ProductDetailsDialog from "@/components/dialogs/product-details-dialog";
import { stats } from "@/constants/products";
import { useGetProducts } from "@/hooks/useProduct";
import { useDebounce } from "@/hooks/useDebounce";
import { sortData } from "@/utils/sort-data";
import { Product } from "@/services/product";

const ProductsPage = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState<any>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const debouncedSearch = useDebounce(search, 500);
    const { data, isLoading, isError } = useGetProducts({
        page,
        search: debouncedSearch || undefined,
    });

    const handleSort = (key: any) => {
        if (sortKey === key) {
            setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    };

    const products = data?.data ?? [];
    const sorted = sortKey ? sortData(products, sortKey, sortDir) : products;

    if (isError) return <p className="text-center p-10 text-red-500 font-medium">Error loading products.</p>;

    return (
        <Container>
            <Header title="Product Overview" description="Monitor product availability across the platform" />
            <StatsSection stats={stats} className="md:grid-cols-3" />

            <div className="bg-white lg:p-[30px] space-y-[30px] rounded-[14px]">
                <ProductInventoryStats />

                <Filters
                    search={search}
                    onSearchChange={(val) => { setSearch(val); setPage(1); }}
                />

                {isLoading ? (
                    <TableSkeleton cols={7} rows={8} />
                ) : (
                    <DataTable
                        data={sorted}
                        headers={
                            <>
                                <SortHeader label="Product Name" sortKey="name" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                                <SortHeader label="Product No#" sortKey="sku" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                                <SortHeader label="Restaurant Name" sortKey="restaurantId" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                                <SortHeader label="Status" sortKey="isActive" activeKey={sortKey} direction={sortDir} onSort={handleSort} className="text-center" />
                                <SortHeader label="Price" sortKey="basePrice" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                                <TableHead className="text-center">Unblock/Block</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </>
                        }
                        row={(product: Product) => (
                            <>
                                <TableCell className="capitalize">{product.name}</TableCell>
                                <TableCell>#{product.sku}</TableCell>
                                <TableCell className="capitalize">{product.restaurant.name || "-"}</TableCell>
                                <TableCell className={`${product.isActive ? "text-green" : "text-primary"}`}>
                                        {product.isActive ? "Active" : "Inactive"}
                                </TableCell>
                                <TableCell className="text-green">${product.basePrice}</TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center">
                                        <Switch
                                            className="data-[state=checked]:bg-primary"
                                            defaultChecked={product.isActive}
                                        />
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center items-center gap-4 text-[#A3A3A3]">
                                        <button
                                            className="hover:text-dark transition-colors cursor-pointer"
                                            onClick={() => setSelectedProduct(product)}
                                        >
                                            <Eye size={20} />
                                        </button>
                                        <button className="hover:text-dark transition-colors cursor-pointer">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </TableCell>
                            </>
                        )}
                        pagination={data?.meta ? { ...data.meta, onPageChange: setPage } : undefined}
                    />
                )}
            </div>

            <ProductDetailsDialog
                open={!!selectedProduct}
                onOpenChange={(open) => !open && setSelectedProduct(null)}
                product={selectedProduct}
            />
        </Container>
    );
};

export default ProductsPage;