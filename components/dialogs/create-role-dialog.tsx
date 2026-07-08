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
import { ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useCreateStaffRole, usePermissionModules } from "@/hooks/useRbac";
import { useGetRestaurantBranches, useGetRestaurants } from "@/hooks/useRestaurant";
import { parseIdList } from "@/lib/staff-access";
import {
    formatActionLabel,
    sanitizePermissions,
    sortPermissionModules,
} from "@/lib/permission-modules";

export function CreateRoleDialog() {
    const rbac = useTranslations("rbac");
    const validation = useTranslations("validation");
    const { mutate: createRole, isPending } = useCreateStaffRole();
    const { data: modulesData = [], isLoading: modulesLoading } = usePermissionModules();
    const permissionModules = useMemo(() => sortPermissionModules(modulesData), [modulesData]);
    const [open, setOpen] = useState(false);
    const [roleName, setRoleName] = useState("");
    const [roleDescription, setRoleDescription] = useState("");
    const [selectedPermissions, setSelectedPermissions] = useState<Record<string, string[]>>({});
    const [restaurantIds, setRestaurantIds] = useState("");
    const [branchIds, setBranchIds] = useState("");
    const [restaurantSelectValue, setRestaurantSelectValue] = useState("");
    const [branchSelectValue, setBranchSelectValue] = useState("");
    const [permissionError, setPermissionError] = useState(false);
    const selectedRestaurantIds = parseIdList(restaurantIds);
    const selectedBranchIds = parseIdList(branchIds);
    const activeBranchRestaurantId = restaurantSelectValue || selectedRestaurantIds[0] || "";
    const restaurantsQuery = useGetRestaurants({ page: 1, limit: 100, includeInactive: false });
    const branchesQuery = useGetRestaurantBranches(activeBranchRestaurantId);
    const restaurants = normalizeList(restaurantsQuery.data);
    const branches = normalizeList(branchesQuery.data);

    useEffect(() => {
        setSelectedPermissions((prev) => {
            const sanitized = sanitizePermissions(
                Object.entries(prev).map(([access, operations]) => ({ access, operations })),
                permissionModules,
            );
            const nextPermissions = sanitized.reduce<Record<string, string[]>>((next, permission) => {
                next[permission.access] = permission.operations;
                return next;
            }, {});

            return JSON.stringify(prev) === JSON.stringify(nextPermissions) ? prev : nextPermissions;
        });
    }, [permissionModules]);

    const handlePermissionChange = (access: string, operation: string, checked: boolean) => {
        setPermissionError(false);
        setSelectedPermissions(prev => {
            const current = prev[access] || [];
            const nextOperations = checked
                ? Array.from(new Set([...current, operation]))
                : current.filter(op => op !== operation);

            if (nextOperations.length === 0) {
                const { [access]: _removed, ...rest } = prev;
                return rest;
            }

            return { ...prev, [access]: nextOperations };
        });
    };

    const resetForm = () => {
        setRoleName("");
        setRoleDescription("");
        setRestaurantIds("");
        setBranchIds("");
        setRestaurantSelectValue("");
        setBranchSelectValue("");
        setSelectedPermissions({});
        setPermissionError(false);
    };

    const addListValue = (current: string, value: string) => {
        const values = parseIdList(current);
        if (!value || values.includes(value)) return current;
        return [...values, value].join(", ");
    };

    const removeListValue = (current: string, value: string) =>
        parseIdList(current).filter((item) => item !== value).join(", ");

    const getRestaurantLabel = (id: string) => {
        const item = restaurants.find((restaurant) => restaurant.id === id);
        return item?.name || item?.restaurantName || id;
    };

    const getBranchLabel = (id: string) => {
        const item = branches.find((branch) => branch.id === id);
        return item?.name || item?.branchName || id;
    };

    const handleSubmit = () => {
        if (!roleName.trim()) {
            return;
        }

        const permissions = sanitizePermissions(
            Object.entries(selectedPermissions).map(([access, operations]) => ({ access, operations })),
            permissionModules,
        );

        if (permissions.length === 0) {
            setPermissionError(true);
            return;
        }

        const roleData = {
            name: roleName.trim(),
            description: roleDescription.trim(),
            restaurantIds: parseIdList(restaurantIds),
            branchIds: parseIdList(branchIds),
            permissions
        };

        createRole(roleData, {
            onSuccess: () => {
                setOpen(false);
                resetForm();
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="primary">
                    {rbac("addNewRole")}
                </Button>
            </DialogTrigger>
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

                    <div className="grid gap-5 md:grid-cols-2">
                        <AccessPicker
                            label={rbac("restaurantIds")}
                            placeholder={rbac("selectRestaurant")}
                            value={restaurantSelectValue}
                            options={restaurants.filter((restaurant) => !selectedRestaurantIds.includes(restaurant.id))}
                            getLabel={(item) => item.name || item.restaurantName || item.id}
                            onChange={setRestaurantSelectValue}
                            onAdd={() => {
                                setRestaurantIds((current) => addListValue(current, restaurantSelectValue));
                                setRestaurantSelectValue("");
                            }}
                            selected={selectedRestaurantIds}
                            getSelectedLabel={getRestaurantLabel}
                            onRemove={(id) => {
                                setRestaurantIds((current) => removeListValue(current, id));
                                if (restaurantSelectValue === id) setRestaurantSelectValue("");
                            }}
                        />

                        <AccessPicker
                            label={rbac("branchIds")}
                            placeholder={activeBranchRestaurantId ? rbac("selectBranch") : rbac("selectRestaurantFirst")}
                            value={branchSelectValue}
                            options={branches.filter((branch) => !selectedBranchIds.includes(branch.id))}
                            getLabel={(item) => item.name || item.branchName || item.id}
                            onChange={setBranchSelectValue}
                            onAdd={() => {
                                setBranchIds((current) => addListValue(current, branchSelectValue));
                                setBranchSelectValue("");
                            }}
                            selected={selectedBranchIds}
                            getSelectedLabel={getBranchLabel}
                            onRemove={(id) => setBranchIds((current) => removeListValue(current, id))}
                            disabled={!activeBranchRestaurantId}
                        />
                    </div>

                    <div>
                        <h3 className="text-base text-dark mb-[6px]">{rbac("permissions")}</h3>
                        <p className="text-sm text-gray mb-[24px] pb-[24px] border-b border-[#BBBBBB]">
                            {rbac("permissionsDescription")}
                        </p>

                        {modulesLoading ? (
                            <p className="text-sm text-gray">{rbac("loadingPermissions")}</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                                {permissionModules.map((module) => (
                                    <div key={module.accessKey}>
                                        <div className="flex items-start gap-[12px] mb-4">
                                            <ShieldCheck className="text-primary mt-1" size={24} />
                                            <div>
                                                <h4 className="font-semibold text-lg text-gray">{module.name}</h4>
                                                {module.description ? (
                                                    <p className="text-xs text-gray-400">{module.description}</p>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className="grid gap-3">
                                            {module.defaultActions.map((operation) => (
                                                <div key={operation} className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`${module.accessKey}-${operation}`}
                                                        checked={selectedPermissions[module.accessKey]?.includes(operation) || false}
                                                        onCheckedChange={(checked) => handlePermissionChange(module.accessKey, operation, checked as boolean)}
                                                        className="w-[20px] h-[20px] data-[state=checked]:bg-primary data-[state=checked]:border-primary border-gray-300"
                                                    />
                                                    <Label
                                                        htmlFor={`${module.accessKey}-${operation}`}
                                                        className="text-base text-dark cursor-pointer"
                                                    >
                                                        {formatActionLabel(operation)}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {permissionError ? (
                            <p className="mt-3 text-sm text-primary">Select at least one permission action.</p>
                        ) : null}
                    </div>
                </div>

                <DialogFooter className="flex items-center gap-[24px] mx-auto mt-[32px] max-w-[360px]">
                    <Button
                        variant="ghost"
                        onClick={resetForm}
                        disabled={isPending}
                    >
                        {rbac("reset")}
                    </Button>
                    <Button
                        variant="primary"
                        className="text-[24px] w-[168px] px-0 h-[62px] rounded-[14px]"
                        onClick={handleSubmit}
                        disabled={isPending || modulesLoading || !roleName.trim()}
                    >
                        {isPending ? rbac("creating") : rbac("create")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

type SelectableAccessOption = {
    id: string;
    name?: string;
    restaurantName?: string;
    branchName?: string;
};

const normalizeList = (response: unknown): SelectableAccessOption[] => {
    if (Array.isArray(response)) return response as SelectableAccessOption[];
    if (!response || typeof response !== "object") return [];

    const record = response as { data?: unknown; items?: unknown };
    if (Array.isArray(record.data)) return record.data as SelectableAccessOption[];
    if (Array.isArray(record.items)) return record.items as SelectableAccessOption[];

    if (record.data && typeof record.data === "object") {
        const dataRecord = record.data as { data?: unknown; items?: unknown };
        if (Array.isArray(dataRecord.data)) return dataRecord.data as SelectableAccessOption[];
        if (Array.isArray(dataRecord.items)) return dataRecord.items as SelectableAccessOption[];
    }

    return [];
};

function AccessPicker({
    label,
    placeholder,
    value,
    options,
    selected,
    disabled,
    getLabel,
    getSelectedLabel,
    onChange,
    onAdd,
    onRemove,
}: {
    label: string;
    placeholder: string;
    value: string;
    options: SelectableAccessOption[];
    selected: string[];
    disabled?: boolean;
    getLabel: (item: SelectableAccessOption) => string;
    getSelectedLabel: (id: string) => string;
    onChange: (value: string) => void;
    onAdd: () => void;
    onRemove: (id: string) => void;
}) {
    return (
        <div className="grid gap-[6px]">
            <Label>{label}</Label>
            <div className="flex gap-2">
                <select
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    disabled={disabled}
                    className="h-10 min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <option value="">{placeholder}</option>
                    {options.map((option) => (
                        <option key={option.id} value={option.id}>
                            {getLabel(option)}
                        </option>
                    ))}
                </select>
                <Button type="button" variant="outline" onClick={onAdd} disabled={!value || disabled}>
                    Add
                </Button>
            </div>
            {selected.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                    {selected.map((id) => (
                        <span key={id} className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            {getSelectedLabel(id)}
                            <button type="button" onClick={() => onRemove(id)} className="text-primary/70 hover:text-primary">
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
