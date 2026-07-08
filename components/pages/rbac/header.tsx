"use client"

import { CreateRoleDialog } from '../../dialogs/create-role-dialog'
import { PermissionModulesDialog } from '../../dialogs/permission-modules-dialog'
import Header from '../../header'

export function RbacHeader({ title, description, className }: HeaderProps) {
    return (
        <div className={`flex flex-col gap-4 md:gap-6 lg:flex-row lg:items-center lg:justify-between w-full`}>
            <Header
                title={title}
                description={description}
                className={className}
            />

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                <PermissionModulesDialog />
                <CreateRoleDialog />
            </div>
        </div>
    )
}
