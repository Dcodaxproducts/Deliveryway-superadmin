"use client"

import ReactQueryProvider from "./tanstack-provider"
import { Toaster } from "@/components/ui/sooner"
import { I18nProvider } from "@/components/providers/i18n-provider"

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ReactQueryProvider>
            <I18nProvider>
                {children}
                <Toaster />
            </I18nProvider>
        </ReactQueryProvider>

    )
}
