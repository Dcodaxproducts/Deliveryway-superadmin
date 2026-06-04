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
import { useCreateStaffRole } from "@/hooks/useRbac";

const permissionsModules = [
    {
        access: "Orders",
        icon: Box,
        operations: ["View", "Create/Edit", "Cancel"]
    },
    {
        access: "Menus",
        icon: Menu,
        operations: ["View", "Add/Edit", "Delete"]
    },
    {
        access: "Drivers",
        icon: Bike,
        operations: ["View", "Assign", "Manage Status"]
    },
    {
        access: "Finance",
        icon: CircleDollarSign,
        operations: ["View", "Manage Payout", "Access Invoice"]
    },
    {
        access: "Reports",
        icon: BarChart3,
        operations: ["View", "Export"]
    },
    {
        access: "Settings",
        icon: Settings,
        operations: ["View", "Manage"]
    },
];

export default function CreateRoleDialog() {
    const { mutate: createRole, isPending } = useCreateStaffRole();
    const [open, setOpen] = useState(false);
    const [roleName, setRoleName] = useState("");
    const [roleDescription, setRoleDescription] = useState("");
    const [selectedPermissions, setSelectedPermissions] = useState<Record<string, string[]>>({});

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
        setSelectedPermissions({});
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="primary"
                >
                    Add New Role
                </Button>
            </DialogTrigger>
            {/* Added max-w and bg-color to match the design */}
            <DialogContent className="sm:max-w-[618px] bg-[#F5F5F5] p-[40px] border-none shadow-lg rounded-[14px] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="text-left">
                    <DialogTitle className="h-[42px]">Create Role</DialogTitle>
                    <DialogDescription>
                        Create Role from here
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 mt-[32px] p-[24px] bg-white rounded-[14px] shadow-sm">
                    <div className="grid gap-[6px]">
                        <Label htmlFor="roleName">
                            Role Name <span>*</span>
                        </Label>
                        <Input
                            id="roleName"
                            placeholder="eg. Manager"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                        />
                        {!roleName.trim() && <p className="text-sm text-primary">Role name is required</p>}
                    </div>

                    <div className="grid gap-[6px]">
                        <Label htmlFor="roleDescription">
                            Role Description <span>*</span>
                        </Label>
                        <Input
                            id="roleDescription"
                            placeholder="eg. Management role with operational access"
                            value={roleDescription}
                            onChange={(e) => setRoleDescription(e.target.value)}
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
                        <h3 className="text-base text-dark mb-[6px]">Permissions</h3>
                        <p className="text-sm text-gray mb-[24px] pb-[24px] border-b border-[#BBBBBB]">
                            Select which actions this role can perform
                        </p>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-8">
                            {permissionsModules.map((module) => (
                                <div
                                    key={module.access}
                                >
                                    <div className="flex items-center gap-[12px] mb-4">
                                        <module.icon className="text-primary" size={24} />
                                        <h4 className="font-semibold text-lg text-gray">{module.access}</h4>
                                    </div>
                                    <div className="grid gap-3">
                                        {module.operations.map((operation) => (
                                            <div key={operation} className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`${module.access}-${operation}`}
                                                    checked={selectedPermissions[module.access]?.includes(operation) || false}
                                                    onCheckedChange={(checked) => handlePermissionChange(module.access, operation, checked as boolean)}
                                                    className="w-[20px] h-[20px] data-[state=checked]:bg-primary data-[state=checked]:border-primary border-gray-300"
                                                />
                                                <Label
                                                    htmlFor={`${module.access}-${operation}`}
                                                    className="text-base text-dark cursor-pointer"
                                                >
                                                    {operation}
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
                        Reset
                    </Button>
                    <Button
                        variant="primary"
                        className="text-[24px] w-[168px] px-0 h-[62px] rounded-[14px]"
                        onClick={handleSubmit}
                        disabled={isPending || !roleName.trim()}
                    >
                        {isPending ? "Creating..." : "Create"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}