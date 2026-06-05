"use client";

import Image from "@/components/MyImage";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/utils/format-date";
import { useTranslations } from "next-intl";

interface CustomerDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customer: any;
}

export default function CustomerDetailsDialog({ open, onOpenChange, customer }: CustomerDetailsDialogProps) {
    const common = useTranslations("common");
    const customers = useTranslations("customers");
    if (!customer) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[618px]! p-0 border-none bg-white rounded-[24px] overflow-hidden max-h-[90vh] overflow-auto ">
                <div className="p-[30px] space-y-[32px]">
                    <DialogHeader className="justify-center gap-0">
                        <DialogTitle className="text-center">{customers("customerNumber", { id: customer.id?.slice(-8) || common("notAvailable") })}</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col items-center space-y-[24px]">
                        <div className="w-[252px] h-[252px] rounded-[14px] overflow-hidden bg-gray-100">
                            <Image
                                src={customer.profile?.avatarUrl || "/placeholder-avatar.png"}
                                alt={customer.profile?.firstName || customers("customer")}
                                width={252}
                                height={252}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="text-center space-y-[12px]">
                            <h2 className="text-2xl font-bold text-dark">
                                {customer.profile?.firstName && customer.profile?.lastName 
                                    ? `${customer.profile.firstName} ${customer.profile.lastName}`
                                    : common("notAvailable")
                                }
                            </h2>
                        </div>

                        {/* Info List */}
                        <div className="w-full space-y-4 pt-4 border-t border-gray-100">
                            <InfoRow label={customers("email")} value={customer.email || common("notAvailable")} />
                            <InfoRow label={customers("phone")} value={customer.profile?.phone || common("notAvailable")} />
                            <InfoRow label={customers("joiningDate")} value={formatDate(customer.createdAt)} />
                            <InfoRow label={common("status")} value={customer.isActive ? common("active") : common("inactive")} />
                            <InfoRow label={customers("restaurantId")} value={customer.restaurantId || common("notAvailable")} />
                            <InfoRow label={customers("role")} value={customer.role || common("notAvailable")} />
                            <InfoRow label={customers("verified")} value={customer.isVerified ? common("yes") : common("no")} />
                            <InfoRow label={customers("approved")} value={customer.isApproved ? common("yes") : common("no")} />
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
