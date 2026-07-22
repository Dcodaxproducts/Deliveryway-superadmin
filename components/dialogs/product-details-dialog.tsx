"use client";

import {
    CalendarDays,
    Clock3,
    Hash,
    Layers3,
    PackageCheck,
    Store,
    Tags,
    Utensils,
    X,
} from "lucide-react";
import { useTranslations } from "next-intl";

import Image from "@/components/MyImage";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useGlobalCurrency } from "@/hooks/useGlobalCurrency";
import { formatMoney } from "@/lib/currency";
import type { Product, ProductNamedEntity } from "@/services/product";
import { formatDate } from "@/utils/format-date";

interface ProductDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product | null;
}

export default function ProductDetailsDialog({ open, onOpenChange, product }: ProductDetailsDialogProps) {
    const common = useTranslations("common");
    const products = useTranslations("products");
    const currency = useGlobalCurrency();

    if (!product) return null;

    const categories = uniqueEntities([product.category, ...(product.categories ?? [])]);
    const dietaryLabels = toLabelList(product.dietaryFlags);
    const allergenLabels = toLabelList(product.allergenFlags);
    const menuNames = uniqueEntities(
        (product.menuLinks ?? [])
            .map((link) => link.restaurantMenu)
            .filter((menu): menu is ProductNamedEntity => Boolean(menu)),
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[92vh] max-w-[1040px]! overflow-y-auto border-none bg-[#f7f7f8] p-0 shadow-2xl">
                <DialogClose className="absolute right-4 top-4 z-20 flex size-10 items-center justify-center rounded-full border border-white/70 bg-white/90 text-gray shadow-sm backdrop-blur transition hover:scale-105 hover:text-dark focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <X className="size-5" />
                    <span className="sr-only">{common("close")}</span>
                </DialogClose>

                <DialogHeader className="sr-only">
                    <DialogTitle>{product.name}</DialogTitle>
                    <DialogDescription>{products("detailsDescription")}</DialogDescription>
                </DialogHeader>

                <div className="grid bg-white lg:grid-cols-[380px_minmax(0,1fr)]">
                    <div className="relative min-h-[320px] overflow-hidden bg-[#f1f1f2] lg:min-h-[430px]">
                        <Image
                            src={product.imageUrl}
                            alt={product.name}
                            width={760}
                            height={860}
                            className="h-full w-full rounded-none object-cover"
                            fallbackSrc="/fallback.png"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 to-transparent" />
                        <span className="absolute bottom-5 left-5 rounded-full border border-white/30 bg-black/35 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                            {product.isActive ? common("active") : common("inactive")}
                        </span>
                    </div>

                    <div className="flex min-w-0 flex-col justify-between p-6 md:p-8 lg:p-10">
                        <div>
                            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                                <span>{product.restaurant?.name || common("notAvailable")}</span>
                                <span className="size-1 rounded-full bg-primary/40" />
                                <span>{categories[0]?.name || products("uncategorized")}</span>
                            </div>
                            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.035em] text-dark md:text-4xl">
                                {product.name}
                            </h2>
                            <p className="mt-3 text-2xl font-semibold text-primary">
                                {formatMoney(product.basePrice, currency)}
                            </p>
                            <p className="mt-5 max-w-[62ch] text-sm leading-6 text-gray">
                                {product.description || products("noDescriptionAvailable")}
                            </p>
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <HeroMetric icon={Hash} label={products("productNo")} value={product.sku || "—"} />
                            <HeroMetric
                                icon={Clock3}
                                label={products("prepTime")}
                                value={product.prepTimeMinutes != null ? products("minsValue", { count: product.prepTimeMinutes }) : "—"}
                            />
                            <HeroMetric icon={Layers3} label={products("variations")} value={String(product._count?.variations ?? product.variations?.length ?? 0)} />
                            <HeroMetric icon={PackageCheck} label={products("modifiers")} value={String(product._count?.modifiers ?? product.modifiers?.length ?? 0)} />
                        </div>
                    </div>
                </div>

                <div className="grid gap-5 p-4 md:p-6 lg:grid-cols-2">
                    <DetailCard icon={Store} title={products("catalogPlacement")}>
                        <DetailRow label={products("restaurantName")} value={product.restaurant?.name} fallback={common("notAvailable")} />
                        <DetailRow label={products("categories")} value={joinNames(categories)} fallback={common("notAvailable")} />
                        <DetailRow label={products("cuisines")} value={joinNames(product.cuisines)} fallback={common("notAvailable")} />
                        <DetailRow label={products("menus")} value={joinNames(menuNames)} fallback={common("notAvailable")} />
                        <DetailRow label={products("slug")} value={product.slug} fallback={common("notAvailable")} />
                    </DetailCard>

                    <DetailCard icon={PackageCheck} title={products("operationalDetails")}>
                        <DetailRow label={products("pricingMode")} value={humanize(product.pricingMode)} fallback={common("notAvailable")} />
                        <DetailRow label={products("sortOrder")} value={product.sortOrder != null ? String(product.sortOrder) : null} fallback={common("notAvailable")} />
                        <DetailRow label={products("quantityRange")} value={formatRange(product.minQuantity, product.maxQuantity, products("unlimited"))} fallback={common("notAvailable")} />
                        <DetailRow label={products("selectionRange")} value={formatRange(product.minSelect, product.maxSelect, products("unlimited"))} fallback={common("notAvailable")} />
                        <DetailRow label={products("requiredSelection")} value={product.isRequired ? common("yes") : common("no")} fallback={common("notAvailable")} />
                    </DetailCard>

                    {(product.ingredients || product.nutritionalInformation) ? (
                        <DetailCard icon={Utensils} title={products("productContent")}>
                            {product.ingredients ? <TextBlock label={products("ingredients")} value={product.ingredients} /> : null}
                            {product.nutritionalInformation ? <TextBlock label={products("nutritionalInformation")} value={product.nutritionalInformation} /> : null}
                        </DetailCard>
                    ) : null}

                    {(dietaryLabels.length || allergenLabels.length || product.allergenPdfUrl) ? (
                        <DetailCard icon={Tags} title={products("labelsAndAllergens")}>
                            {dietaryLabels.length ? <ChipGroup label={products("dietaryLabels")} values={dietaryLabels} /> : null}
                            {allergenLabels.length ? <ChipGroup label={products("allergens")} values={allergenLabels} /> : null}
                            {product.allergenPdfUrl ? (
                                <a href={product.allergenPdfUrl} target="_blank" rel="noreferrer" className="inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline">
                                    {products("openAllergenDocument")}
                                </a>
                            ) : null}
                        </DetailCard>
                    ) : null}

                    {(product.variations?.length || product.modifiers?.length || product.modifierGroups?.length) ? (
                        <div className="lg:col-span-2">
                            <DetailCard icon={Layers3} title={products("configuration")}>
                                <EntitySection label={products("variations")} entities={product.variations} />
                                <EntitySection label={products("modifierGroups")} entities={product.modifierGroups} />
                                <EntitySection label={products("modifiers")} entities={product.modifiers} />
                            </DetailCard>
                        </div>
                    ) : null}

                    <div className="lg:col-span-2">
                        <DetailCard icon={CalendarDays} title={products("recordInformation")}>
                            <div className="grid gap-4 sm:grid-cols-3">
                                <DetailRow label={products("productId")} value={product.id} fallback="—" stacked />
                                <DetailRow label={products("createdDate")} value={formatDate(product.createdAt)} fallback="—" stacked />
                                <DetailRow label={products("lastUpdated")} value={formatDate(product.updatedAt)} fallback="—" stacked />
                            </div>
                        </DetailCard>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function HeroMetric({ icon: Icon, label, value }: { icon: typeof Hash; label: string; value: string }) {
    return (
        <div className="rounded-xl border border-[#ececef] bg-[#fafafa] p-3">
            <Icon className="size-4 text-primary" />
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-gray">{label}</p>
            <p className="mt-1 truncate text-sm font-semibold text-dark" title={value}>{value}</p>
        </div>
    );
}

function DetailCard({ icon: Icon, title, children }: { icon: typeof Store; title: string; children: React.ReactNode }) {
    return (
        <section className="h-full rounded-[16px] border border-[#e9e9ec] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)] md:p-6">
            <div className="mb-5 flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-[10px] bg-primary/10 text-primary"><Icon className="size-4" /></span>
                <h3 className="text-base font-semibold text-dark">{title}</h3>
            </div>
            <div className="space-y-4">{children}</div>
        </section>
    );
}

function DetailRow({ label, value, fallback, stacked = false }: { label: string; value?: string | null; fallback: string; stacked?: boolean }) {
    return (
        <div className={stacked ? "min-w-0" : "flex items-start justify-between gap-5 border-b border-[#f0f0f2] pb-3 last:border-0 last:pb-0"}>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray">{label}</p>
            <p className={`${stacked ? "mt-2 break-all text-left" : "max-w-[65%] text-right"} text-sm font-medium text-dark`}>{value || fallback}</p>
        </div>
    );
}

function TextBlock({ label, value }: { label: string; value: string }) {
    return <div><p className="text-xs font-semibold uppercase tracking-wide text-gray">{label}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-dark">{value}</p></div>;
}

function ChipGroup({ label, values }: { label: string; values: string[] }) {
    return <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray">{label}</p><div className="flex flex-wrap gap-2">{values.map((value) => <span key={value} className="rounded-full bg-[#f4f4f5] px-3 py-1.5 text-xs font-semibold text-dark">{humanize(value)}</span>)}</div></div>;
}

function EntitySection({ label, entities }: { label: string; entities?: ProductNamedEntity[] }) {
    if (!entities?.length) return null;
    return <ChipGroup label={label} values={entities.map((entity) => entity.name)} />;
}

function uniqueEntities(entities: ProductNamedEntity[]) {
    return entities.filter((entity, index, list) => entity?.id && list.findIndex((item) => item.id === entity.id) === index);
}

function joinNames(entities?: ProductNamedEntity[]) {
    return entities?.map((entity) => entity.name).filter(Boolean).join(", ") || null;
}

function toLabelList(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.flatMap((item) => {
        if (typeof item === "string") return item.startsWith("__") ? [] : [item];
        if (!item || typeof item !== "object") return [];
        const record = item as Record<string, unknown>;
        const label = record.label ?? record.name ?? record.code ?? record.value;
        return typeof label === "string" ? [label] : [];
    });
}

function humanize(value?: string | null) {
    if (!value) return null;
    return value.toLowerCase().split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function formatRange(minimum?: number, maximum?: number | null, unlimited = "Unlimited") {
    if (minimum == null && maximum == null) return null;
    return `${minimum ?? 0} – ${maximum ?? unlimited}`;
}
