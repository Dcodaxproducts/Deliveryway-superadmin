"use client";

import Image from "@/components/MyImage";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/utils/format-date";

interface CustomerDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customer: any;
}

export default function CustomerDetailsDialog({ open, onOpenChange, customer }: CustomerDetailsDialogProps) {
    if (!customer) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[618px]! p-0 border-none bg-white rounded-[24px] overflow-hidden max-h-[90vh] overflow-auto ">
                <div className="p-[30px] space-y-[32px]">
                    <DialogHeader className="justify-center gap-0">
                        <DialogTitle className="text-center">Customer #{customer.id?.slice(-8) || "N/A"}</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col items-center space-y-[24px]">
                        <div className="w-[252px] h-[252px] rounded-[14px] overflow-hidden bg-gray-100">
                            <Image
                                src={customer.profile?.avatarUrl || "/placeholder-avatar.png"}
                                alt={customer.profile?.firstName || "Customer"}
                                width={252}
                                height={252}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="text-center space-y-[12px]">
                            <h2 className="text-2xl font-bold text-dark">
                                {customer.profile?.firstName && customer.profile?.lastName 
                                    ? `${customer.profile.firstName} ${customer.profile.lastName}`
                                    : "N/A"
                                }
                            </h2>
                        </div>

                        {/* Info List */}
                        <div className="w-full space-y-4 pt-4 border-t border-gray-100">
                            <InfoRow label="Email" value={customer.email || "N/A"} />
                            <InfoRow label="Phone" value={customer.profile?.phone || "N/A"} />
                            <InfoRow label="Joining Date" value={formatDate(customer.createdAt)} />
                            <InfoRow label="Status" value={customer.isActive ? "Active" : "Inactive"} />
                            <InfoRow label="Restaurant ID" value={customer.restaurantId || "N/A"} />
                            <InfoRow label="Role" value={customer.role || "N/A"} />
                            <InfoRow label="Verified" value={customer.isVerified ? "Yes" : "No"} />
                            <InfoRow label="Approved" value={customer.isApproved ? "Yes" : "No"} />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="grid grid-cols-[1fr_auto_1fr] items-center text-sm">
            <span className="text-[#6A7282] text-left">
                {label}
            </span>

            <span className="text-[#6A7282] px-3 text-center">
                :
            </span>

            <span className="text-right text-[#6A7282] capitalize">
                {value}
            </span>
        </div>
    );
}