"use client";

import { useCallback, useState } from "react";
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
import DeleteDialog from "@/components/dialogs/delete-dialog";
import { useDeleteProduct, useGetProducts, useUpdateProductStatus } from "@/hooks/useProduct";
import { useDebounce } from "@/hooks/useDebounce";
import { sortData } from "@/utils/sort-data";
import { Product } from "@/services/product";
import { useTranslations } from "next-intl";
import { useGlobalCurrency } from "@/hooks/useGlobalCurrency";
import { formatMoney } from "@/lib/currency";
import Image from "@/components/MyImage";
import { getRestaurants } from "@/services/restaurant";
import type { Restaurant } from "@/types/restaurant";
import type { ProductListMeta } from "@/services/product";

type SortKey = "name" | "sku" | "restaurantId" | "isActive" | "basePrice";

const ProductsPage = () => {
    const common = useTranslations("common");
    const productsText = useTranslations("products");
    const currency = useGlobalCurrency();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
    const [sortKey, setSortKey] = useState<SortKey | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

    const debouncedSearch = useDebounce(search, 500);
    const { data, isLoading, isError } = useGetProducts({
        page,
        search: debouncedSearch || undefined,
        restaurantId: selectedRestaurant?.id,
        all: status === "all" || undefined,
        inactive: status === "inactive" || undefined,
    });
    const totalQuery = useGetProducts({ page: 1, limit: 1, restaurantId: selectedRestaurant?.id, all: true });
    const activeQuery = useGetProducts({ page: 1, limit: 1, restaurantId: selectedRestaurant?.id });
    const inactiveQuery = useGetProducts({ page: 1, limit: 1, restaurantId: selectedRestaurant?.id, inactive: true });
    const updateStatus = useUpdateProductStatus();
    const deleteProduct = useDeleteProduct();

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    };

    const products = data?.data ?? [];
    const sorted = sortKey ? sortData(products, sortKey, sortDir) : products;
    const totalCount = totalQuery.data?.meta.total ?? 0;
    const activeCount = activeQuery.data?.meta.total ?? 0;
    const inactiveCount = inactiveQuery.data?.meta.total ?? 0;
    const inventoryScope = selectedRestaurant
        ? productsText("forRestaurant", { name: selectedRestaurant.name })
        : productsText("acrossRestaurants");
    const stats = [
        {
            _id: "total-products",
            titleKey: "products.totalProducts",
            value: totalCount.toLocaleString(),
            footerType: "plain",
            description: inventoryScope,
            routeHref: "/products",
        },
        {
            _id: "active-products",
            titleKey: "products.activeProducts",
            value: activeCount.toLocaleString(),
            footerType: "plain",
            descriptionKey: "products.availableForPurchase",
            routeHref: "/products",
        },
        {
            _id: "inactive-products",
            titleKey: "products.inactiveProducts",
            value: inactiveCount.toLocaleString(),
            footerType: "plain",
            descriptionKey: "products.temporarilyDisabled",
            routeHref: "/products",
        },
    ];

    const handleDeleteConfirm = () => {
        if (!deleteId) return;
        deleteProduct.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
    };

    const fetchRestaurantOptions = useCallback(async ({ search, page }: { search: string; page: number }) => {
        const response = await getRestaurants({
            page,
            limit: 20,
            search: search || undefined,
            includeInactive: true,
        }) as { data?: Restaurant[]; meta?: ProductListMeta };

        return {
            data: Array.isArray(response.data) ? response.data : [],
            meta: response.meta,
        };
    }, []);

    if (isError) return <p className="text-center p-10 text-red-500 font-medium">{productsText("loadError")}</p>;

    return (
        <Container>
            <Header title={productsText("overview")} description={productsText("description")} />
            <StatsSection
                stats={stats}
                className="md:grid-cols-3"
                isLoading={totalQuery.isLoading || activeQuery.isLoading || inactiveQuery.isLoading}
            />

            <div className="bg-white lg:p-[30px] space-y-[30px] rounded-[14px]">
                <ProductInventoryStats
                    activeCount={activeCount}
                    inactiveCount={inactiveCount}
                    isLoading={activeQuery.isLoading || inactiveQuery.isLoading}
                />

                <Filters
                    search={search}
                    onSearchChange={(val) => { setSearch(val); setPage(1); }}
                    status={status}
                    onStatusChange={(value) => { setStatus(value); setPage(1); }}
                    restaurant={selectedRestaurant}
                    onRestaurantChange={(restaurant) => { setSelectedRestaurant(restaurant); setPage(1); }}
                    fetchRestaurantOptions={fetchRestaurantOptions}
                />

                {isLoading ? (
                    <TableSkeleton cols={7} rows={8} />
                ) : (
                    <DataTable
                        data={sorted}
                        headers={
                            <>
                                <SortHeader label={productsText("productName")} sortKey="name" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                                <SortHeader label={productsText("productNo")} sortKey="sku" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                                <SortHeader label={productsText("restaurantName")} sortKey="restaurantId" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                                <SortHeader label={common("status")} sortKey="isActive" activeKey={sortKey} direction={sortDir} onSort={handleSort} className="text-center" />
                                <SortHeader label={productsText("price")} sortKey="basePrice" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                                <TableHead className="text-center">{productsText("unblockBlock")}</TableHead>
                                <TableHead className="text-center">{common("actions")}</TableHead>
                            </>
                        }
                        row={(product: Product) => (
                            <>
                                <TableCell>
                                    <div className="flex min-w-[220px] items-center gap-3">
                                        <Image
                                            src={product.imageUrl}
                                            alt={product.name}
                                            width={52}
                                            height={52}
                                            className="size-[52px] shrink-0 rounded-xl border border-[#ececef] bg-[#f7f7f8] object-cover"
                                            fallbackSrc="/fallback.png"
                                        />
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold capitalize text-dark">{product.name}</p>
                                            <p className="mt-1 truncate text-xs text-gray">{product.category?.name || productsText("uncategorized")}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{product.sku ? `#${product.sku}` : "—"}</TableCell>
                                <TableCell className="capitalize">{product.restaurant?.name || "-"}</TableCell>
                                <TableCell className={`text-center ${product.isActive ? "text-green" : "text-primary"}`}>
                                        {product.isActive ? common("active") : common("inactive")}
                                </TableCell>
                                <TableCell className="text-green">{formatMoney(product.basePrice, currency)}</TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center">
                                        <Switch
                                            className="data-[state=checked]:bg-primary"
                                            checked={product.isActive}
                                            disabled={updateStatus.isPending && updateStatus.variables?.id === product.id}
                                            onCheckedChange={(isActive) => updateStatus.mutate({ id: product.id, isActive })}
                                            aria-label={productsText("toggleStatus", { name: product.name })}
                                        />
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center items-center gap-4 text-[#A3A3A3]">
                                        <button
                                            className="hover:text-dark transition-colors cursor-pointer"
                                            onClick={() => setSelectedProduct(product)}
                                            aria-label={productsText("viewProduct", { name: product.name })}
                                        >
                                            <Eye size={20} />
                                        </button>
                                        <button
                                            className="hover:text-primary transition-colors cursor-pointer"
                                            onClick={() => setDeleteId(product.id)}
                                            aria-label={productsText("deleteProduct", { name: product.name })}
                                        >
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
            <DeleteDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                onConfirm={handleDeleteConfirm}
                isLoading={deleteProduct.isPending}
                title={productsText("deleteTitle")}
                description={productsText("deleteDescription")}
            />
        </Container>
    );
};

export default ProductsPage;
