import Container from "../../../components/container";
import Header from "@/components/pages/rbac/header";
import RolePermissions from "@/components/pages/rbac/role-permissions";
import RolesList from "@/components/pages/rbac/roles-list";

const RolesPage = () => {
    return (    
        <Container>
            <Header
                title="Roles List"
                description="Create and manage predefined roles to control access across different areas of the platform."
                className="max-w-[466px]"
            />

            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-[32px] lg:p-[30px]">
                <div className="lg:col-span-4">
                    <RolesList />
                </div>

                <div className="lg:col-span-8">
                    <RolePermissions />
                </div>
            </div>
        </Container>
    );
};

export default RolesPage;