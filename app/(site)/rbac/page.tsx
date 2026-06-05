"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import Container from "../../../components/container";
import { RbacHeader } from "@/components/pages/rbac/header";
import { RolePermissions } from "@/components/pages/rbac/role-permissions";
import { RolesList } from "@/components/pages/rbac/roles-list";

const RolesPage = () => {
    const rbac = useTranslations("rbac");

    return (    
        <Container>
            <RbacHeader
                title={rbac("rolesList")}
                description={rbac("description")}
                className="max-w-[466px]"
            />

            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-[32px] lg:p-[30px]">
                <div className="lg:col-span-4">
                    <Suspense fallback={<div>{rbac("loadingRoles")}</div>}>
                        <RolesList />
                    </Suspense>
                </div>

                <div className="lg:col-span-8">
                    <Suspense fallback={<div>{rbac("loadingPermissions")}</div>}>
                        <RolePermissions />
                    </Suspense>
                </div>
            </div>
        </Container>
    );
};

export default RolesPage;
