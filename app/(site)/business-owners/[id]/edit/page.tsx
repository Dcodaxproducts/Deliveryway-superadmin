"use client"

import Container from "@/components/container"
import Header from "@/components/header"
import { useGetTenant } from "@/hooks/useTenants"
import { useParams } from "next/navigation"
import BusinessOwnerForm from "@/components/forms/business-owner-form"

const EditTenant = () => {
    const params = useParams();
    const { data: tenant, isLoading } = useGetTenant(params.id as string); 
    console.log("tenant data is", tenant);
    if (isLoading) return (
        <div className="flex items-center justify-center min-h-screen mx-auto">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
    );
    
    return (
        <Container>
            <Header
                title="Edit Business Owner Details"
            />
            <div className="w-full">
                <BusinessOwnerForm 
                    mode="edit" 
                    tenantId={params.id as string}
                    initialData={tenant} // ✅ updated
                />
            </div>
        </Container>
    )
}

export default EditTenant