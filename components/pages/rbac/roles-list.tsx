"use client";

import { Suspense, useState } from "react";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "../../ui/button";
import { useStaffRoles, useDeleteStaffRole } from "@/hooks/useRbac";
import DeleteDialog from "@/components/dialogs/delete-dialog";
import { useRouter, useSearchParams } from "next/navigation";

type StaffRoleItem = {
    id: string;
    name: string;
    sub?: string;
    description?: string;
    isEditing?: boolean;
};

function RolesListContent() {
    const rbac = useTranslations("rbac");
    const { data: roles, isLoading, error } = useStaffRoles();
    const { mutate: deleteRole, isPending } = useDeleteStaffRole();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleViewPermissions = (roleId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('role', roleId);
        router.push(`/rbac?${params.toString()}`);
    };

    const handleDeleteClick = (id: string) => {
        setRoleToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (roleToDelete) {
            deleteRole(roleToDelete, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setRoleToDelete(null);
                }
            });
        }
    };

    if (isLoading) return <div>{rbac("loadingRoles")}</div>;
    if (error) return <div>{rbac("errorLoadingRoles")}</div>;

    return (
        <>
            <div className="flex flex-col gap-[32px]">
                {roles?.map((role: StaffRoleItem) => (
                    <Card
                        key={role.id}
                        className={`p-[24px] border-none shadow-sm rounded-[14px] gap-0 relative transition-all ${role.isEditing ? "ring-1 ring-primary" : ""
                            }`}
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex gap-2 items-center">
                                <div className={`p-2 rounded-lg text-primary`}>
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-dark text-lg capitalize">{role.name}</h3>
                                    <p className={`text-sm text-dark`}>
                                        {role.sub || ""}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-[4px] absolute top-3 right-3">
                                {role.name !== "Admin" && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 w-10"
                                        onClick={() => handleDeleteClick(role.id)}
                                        disabled={isPending}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                )}
                            </div>
                        </div>

                        <p className="text-gray text-sm mt-[20px] mb-[10px]">{role.description}</p>

                        <div className="flex gap-[8px]">
                            <Button
                                variant="link"
                                className="self-start"
                                onClick={() => handleViewPermissions(role.id)}
                            >
                                {rbac("viewPermissions")}
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            <DeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleConfirmDelete}
                isLoading={isPending}
                title={rbac("deleteRole")}
                description={rbac("deleteRoleDescription")}
            />
        </>
    );
}

export function RolesList() {
    const rbac = useTranslations("rbac");

    return (
        <Suspense fallback={<div>{rbac("loadingRoles")}</div>}>
            <RolesListContent />
        </Suspense>
    );
}
