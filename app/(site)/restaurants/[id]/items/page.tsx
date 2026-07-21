"use client";

import { ArrowLeft, ExternalLink, Eye, Search, Utensils } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";

import Container from "@/components/container";
import { DataTable } from "@/components/custom/data-table";
import ProductDetailsDialog from "@/components/dialogs/product-details-dialog";
import Header from "@/components/header";
import MyImage from "@/components/MyImage";
import { getRestaurantStorefrontUrl } from "@/components/pages/restaurants/restaurant-domain-panel";
import TableSkeleton from "@/components/skeleton/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableHead } from "@/components/ui/table";
import { useDebounce } from "@/hooks/useDebounce";
import { useGlobalCurrency } from "@/hooks/useGlobalCurrency";
import { useGetProducts } from "@/hooks/useProduct";
import { useGetRestaurant } from "@/hooks/useRestaurant";
import { formatMoney } from "@/lib/currency";
import type { Product } from "@/services/product";

export default function RestaurantItemsPage() {
  const common = useTranslations("common");
  const productsText = useTranslations("products");
  const restaurants = useTranslations("restaurants");
  const params = useParams();
  const restaurantId = params.id as string;
  const currency = useGlobalCurrency();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const debouncedSearch = useDebounce(search, 400);
  const restaurantQuery = useGetRestaurant(restaurantId);
  const productsQuery = useGetProducts({
    page,
    limit: 12,
    search: debouncedSearch || undefined,
    restaurantId,
    all: true,
  });
  const restaurant = restaurantQuery.data;
  const products: Product[] = productsQuery.data?.data ?? [];
  const storefrontUrl = getRestaurantStorefrontUrl(restaurant);
  const storefrontMenuUrl = storefrontUrl ? `${storefrontUrl}/items` : null;

  return (
    <Container>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            href={`/restaurants/${restaurantId}`}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-gray transition-colors hover:text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <ArrowLeft aria-hidden="true" size={16} />
            {restaurants("backToRestaurant")}
          </Link>
          <Header
            title={restaurant ? restaurants("itemsForRestaurant", { name: restaurant.name }) : restaurants("restaurantItems")}
            description={restaurants("allItemsDescription")}
          />
        </div>
        {storefrontMenuUrl && (
          <Button asChild variant="primary" className="h-11 self-start rounded-xl active:scale-[0.98] lg:self-auto">
            <a href={storefrontMenuUrl} target="_blank" rel="noreferrer">
              {restaurants("openCustomerMenu")}
              <ExternalLink aria-hidden="true" />
            </a>
          </Button>
        )}
      </div>

      <section className="rounded-[18px] bg-white p-4 lg:p-[30px]" aria-labelledby="restaurant-items-table-title">
        <div className="flex flex-col gap-5 border-b border-[#eef0f2] pb-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Utensils aria-hidden="true" size={20} />
            </span>
            <div>
              <h2 id="restaurant-items-table-title" className="font-semibold text-dark">
                {restaurants("itemCatalog")}
              </h2>
              <p className="text-sm text-gray">
                {restaurants("itemsCount", { count: productsQuery.data?.meta?.total ?? products.length })}
              </p>
            </div>
          </div>

          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray" aria-hidden="true" size={18} />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder={restaurants("searchRestaurantItems")}
              aria-label={restaurants("searchRestaurantItems")}
              className="h-11 rounded-xl border-[#dfe2e6] pl-10 focus-visible:ring-primary"
            />
          </div>
        </div>

        <div className="mt-6">
          {productsQuery.isLoading || restaurantQuery.isLoading ? (
            <TableSkeleton cols={6} rows={8} />
          ) : productsQuery.isError || restaurantQuery.isError ? (
            <div className="rounded-[14px] border border-red-100 bg-red-50 px-4 py-12 text-center text-sm text-red-700">
              {productsText("loadError")}
            </div>
          ) : (
            <DataTable
              data={products}
              headers={
                <>
                  <TableHead>{productsText("productName")}</TableHead>
                  <TableHead>{productsText("category")}</TableHead>
                  <TableHead>{productsText("productNo")}</TableHead>
                  <TableHead>{productsText("price")}</TableHead>
                  <TableHead>{common("status")}</TableHead>
                  <TableHead className="text-right">{common("actions")}</TableHead>
                </>
              }
              row={(product) => (
                <>
                  <TableCell>
                    <div className="flex min-w-[220px] items-center gap-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-[10px] bg-[#f7f8fa]">
                        <MyImage
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          sizes="48px"
                          className="rounded-[10px] object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="max-w-[240px] truncate font-semibold text-dark">{product.name}</p>
                        <p className="max-w-[240px] truncate text-xs text-gray">{product.description || restaurants("noDescription")}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray">{product.category?.name || "—"}</TableCell>
                  <TableCell className="font-mono text-sm text-gray">{product.sku ? `#${product.sku}` : "—"}</TableCell>
                  <TableCell className="font-semibold tabular-nums text-dark">{formatMoney(product.basePrice, currency)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={product.isActive ? "border-green/20 bg-green/10 text-green" : "border-primary/20 bg-primary/10 text-primary"}
                    >
                      {product.isActive ? common("active") : common("inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-9 rounded-lg p-0"
                      onClick={() => setSelectedProduct(product)}
                      aria-label={restaurants("viewItem", { name: product.name })}
                      title={restaurants("viewItem", { name: product.name })}
                    >
                      <Eye aria-hidden="true" size={16} />
                    </Button>
                  </TableCell>
                </>
              )}
              pagination={productsQuery.data?.meta ? { ...productsQuery.data.meta, onPageChange: setPage } : undefined}
            />
          )}
        </div>
      </section>

      <ProductDetailsDialog
        open={Boolean(selectedProduct)}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
        product={selectedProduct}
      />
    </Container>
  );
}
