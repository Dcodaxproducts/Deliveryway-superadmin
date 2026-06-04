"use client"

import ReactQueryProvider from "./tanstack-provider"
import { Toaster } from "@/components/ui/sooner"

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ReactQueryProvider>
            {children}
            <Toaster />
        </ReactQueryProvider>

    )
}
