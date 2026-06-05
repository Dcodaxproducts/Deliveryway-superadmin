"use client"

import { CreateRoleDialog } from '../../dialogs/create-role-dialog'
import Header from '../../header'

export function RbacHeader({ title, description, className }: HeaderProps) {
    return (
        <div className={`flex flex-col gap-4 md:gap-6 lg:flex-row lg:items-center lg:justify-between w-full`}>
            <Header
                title={title}
                description={description}
                className={className}
            />

            <div className="w-full lg:w-auto">
                <CreateRoleDialog />
            </div>
        </div>
    )
}
