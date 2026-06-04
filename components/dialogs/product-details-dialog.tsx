"use client";

import Image from "@/components/MyImage";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface ProductDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: any;
}

export default function ProductDetailsDialog({ open, onOpenChange, product }: ProductDetailsDialogProps) {
    if (!product) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[618px]! p-0 border-none bg-white rounded-[24px] overflow-hidden">
                <div className="p-[30px] space-y-[32px]">
                    <DialogHeader className="justify-center gap-0">
                        <DialogTitle className="text-center">Product ID #{product.sku}</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col items-center space-y-[24px]">
                        <div className="w-[252px] h-[252px] rounded-[14px] overflow-hidden bg-gray-100">
                            <Image
                                src={product?.imageUrl || "/placeholder.png"}
                                alt={product?.name || ""}
                                width={252}
                                height={252}
                                className="w-full h-full object-contain"
                            />
                        </div>

                        <div className="text-center space-y-[12px]">
                            <h2 className="text-2xl font-bold text-dark capitalize">{product.name}</h2>
                            <p className="text-2xl font-semibold text-green">${product.basePrice}</p>
                        </div>

                        {/* Info List */}
                        <div className="w-full space-y-4 pt-4 border-t border-gray-100">
                            <InfoRow label="Restaurant Name" value={product.restaurant.name || "N/A"} />
                            <InfoRow label="Category" value={product.category?.name || "N/A"} />
                            <InfoRow label="Prep Time" value={`${product.prepTimeMinutes || 0} mins`} />
                            <InfoRow label="Status" value={product.isActive ? "Active" : "Inactive"} />
                        </div>

                        {/* <Button
                            variant="primary"
                            className="w-full h-[52px] rounded-[14px]"
                        >
                            Edit
                        </Button> */}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="grid grid-cols-[1fr_auto_1fr] items-center text-sm capitalize">
            <span className="text-[#6A7282] text-left">
                {label}
            </span>

            <span className="text-[#6A7282] px-3 text-center">
                :
            </span>

            <span className="text-right text-[#6A7282]">
                {value}
            </span>
        </div>
    );
}
