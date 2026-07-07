"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Box, Menu, Bike, CircleDollarSign, BarChart3, Settings } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCreateStaffRole } from "@/hooks/useRbac";
import { parseIdList } from "@/lib/staff-access";

const permissionsModules = [
    {
        access: "orders",
        labelKey: "orders",
        icon: Box,
        operations: [{ value: "read", labelKey: "view" }, { value: "write", labelKey: "createEdit" }, { value: "cancel", labelKey: "cancel" }]
    },
    {
        access: "menu",
        labelKey: "menus",
        icon: Menu,
        operations: [{ value: "read", labelKey: "view" }, { value: "write", labelKey: "addEdit" }, { value: "delete", labelKey: "delete" }]
    },
    {
        access: "drivers",
        labelKey: "drivers",
        icon: Bike,
        operations: [{ value: "read", labelKey: "view" }, { value: "assign", labelKey: "assign" }, { value: "manage", labelKey: "manageStatus" }]
    },
    {
        access: "finance",
        labelKey: "finance",
        icon: CircleDollarSign,
        operations: [{ value: "read", labelKey: "view" }, { value: "manage", labelKey: "managePayout" }, { value: "invoice", labelKey: "accessInvoice" }]
    },
    {
        access: "reports",
        labelKey: "reports",
        icon: BarChart3,
        operations: [{ value: "read", labelKey: "view" }, { value: "export", labelKey: "export" }]
    },
    {
        access: "settings",
        labelKey: "settings",
        icon: Settings,
        operations: [{ value: "read", labelKey: "view" }, { value: "manage", labelKey: "manage" }]
    },
];

export function CreateRoleDialog() {
    const rbac = useTranslations("rbac");
    const validation = useTranslations("validation");
    const { mutate: createRole, isPending } = useCreateStaffRole();
    const [open, setOpen] = useState(false);
    const [roleName, setRoleName] = useState("");
    const [roleDescription, setRoleDescription] = useState("");
    const [selectedPermissions, setSelectedPermissions] = useState<Record<string, string[]>>({});
    const [restaurantIds, setRestaurantIds] = useState("");
    const [branchIds, setBranchIds] = useState("");

    const handlePermissionChange = (access: string, operation: string, checked: boolean) => {
        setSelectedPermissions(prev => {
            const current = prev[access] || [];
            if (checked) {
                return { ...prev, [access]: [...current, operation] };
            } else {
                return { ...prev, [access]: current.filter(op => op !== operation) };
            }
        });
    };

    const handleSubmit = () => {
        if (!roleName.trim()) {
            return;
        }

        const permissions = Object.entries(selectedPermissions).map(([access, operations]) => ({
            access,
            operations
        }));

        const roleData = {
            name: roleName,
            description: roleDescription,
            restaurantIds: parseIdList(restaurantIds),
            branchIds: parseIdList(branchIds),
            permissions
        };

        createRole(roleData, {
            onSuccess: () => {
                setOpen(false);
                setRoleName("");
                setRoleDescription("");
                setSelectedPermissions({});
            }
        });
    };

    const handleReset = () => {
        setRoleName("");
        setRoleDescription("");
        setRestaurantIds("");
        setBranchIds("");
        setSelectedPermissions({});
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="primary"
                >
                    {rbac("addNewRole")}
                </Button>
            </DialogTrigger>
            {/* Added max-w and bg-color to match the design */}
            <DialogContent className="sm:max-w-[618px] bg-[#F5F5F5] p-[40px] border-none shadow-lg rounded-[14px] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="text-left">
                    <DialogTitle className="h-[42px]">{rbac("createRole")}</DialogTitle>
                    <DialogDescription>
                        {rbac("createRoleDescription")}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 mt-[32px] p-[24px] bg-white rounded-[14px] shadow-sm">
                    <div className="grid gap-[6px]">
                        <Label htmlFor="roleName">
                            {rbac("roleName")} <span>*</span>
                        </Label>
                        <Input
                            id="roleName"
                            placeholder={rbac("roleNamePlaceholder")}
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                        />
                        {!roleName.trim() && <p className="text-sm text-primary">{validation("roleNameRequired")}</p>}
                    </div>

                    <div className="grid gap-[6px]">
                        <Label htmlFor="roleDescription">
                            {rbac("roleDescription")} <span>*</span>
                        </Label>
                        <Input
                            id="roleDescription"
                            placeholder={rbac("roleDescriptionPlaceholder")}
                            value={roleDescription}
                            onChange={(e) => setRoleDescription(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-[6px]">
                        <Label htmlFor="restaurantIds">{rbac("restaurantIds")}</Label>
                        <Input
                            id="restaurantIds"
                            placeholder={rbac("restaurantIdsPlaceholder")}
                            value={restaurantIds}
                            onChange={(e) => setRestaurantIds(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-[6px]">
                        <Label htmlFor="branchIds">{rbac("branchIds")}</Label>
                        <Input
                            id="branchIds"
                            placeholder={rbac("branchIdsPlaceholder")}
                            value={branchIds}
                            onChange={(e) => setBranchIds(e.target.value)}
                        />
                    </div>

                    {/* Status Switch */}
                    {/* <div className="flex items-center gap-[24px]">
                        <Label htmlFor="status">
                            Status
                        </Label>
                        <Switch
                            id="status"
                            checked={status}
                            onCheckedChange={setStatus}
                            className="w-[52px] h-[26px]"
                        />
                    </div> */}

                    {/* Permissions Section */}
                    <div>
                        <h3 className="text-base text-dark mb-[6px]">{rbac("permissions")}</h3>
                        <p className="text-sm text-gray mb-[24px] pb-[24px] border-b border-[#BBBBBB]">
                            {rbac("permissionsDescription")}
                        </p>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-8">
                            {permissionsModules.map((module) => (
                                <div
                                    key={module.access}
                                >
                                    <div className="flex items-center gap-[12px] mb-4">
                                        <module.icon className="text-primary" size={24} />
                                        <h4 className="font-semibold text-lg text-gray">{rbac(module.labelKey)}</h4>
                                    </div>
                                    <div className="grid gap-3">
                                        {module.operations.map((operation) => (
                                            <div key={operation.value} className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`${module.access}-${operation.value}`}
                                                    checked={selectedPermissions[module.access]?.includes(operation.value) || false}
                                                    onCheckedChange={(checked) => handlePermissionChange(module.access, operation.value, checked as boolean)}
                                                    className="w-[20px] h-[20px] data-[state=checked]:bg-primary data-[state=checked]:border-primary border-gray-300"
                                                />
                                                <Label
                                                    htmlFor={`${module.access}-${operation.value}`}
                                                    className="text-base text-dark cursor-pointer"
                                                >
                                                    {rbac(operation.labelKey)}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex items-center gap-[24px] mx-auto mt-[32px] max-w-[360px]">
                    <Button
                        variant="ghost"
                        onClick={handleReset}
                        disabled={isPending}
                    >
                        {rbac("reset")}
                    </Button>
                    <Button
                        variant="primary"
                        className="text-[24px] w-[168px] px-0 h-[62px] rounded-[14px]"
                        onClick={handleSubmit}
                        disabled={isPending || !roleName.trim()}
                    >
                        {isPending ? rbac("creating") : rbac("create")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
