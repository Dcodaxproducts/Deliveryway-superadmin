import { Navbar } from '@/components/layout/navbar'
import { Sidebar } from '@/components/layout/sidebar'

export default function SiteLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <div className="min-h-screen">
            <div className="fixed inset-x-0 top-0 z-40">
                <Navbar />
            </div>
            <div className="flex min-h-screen items-start pt-[76px]">
                <div className="fixed bottom-0 left-0 top-[76px] hidden overflow-hidden xl:block">
                    <Sidebar />
                </div>
                <main className="min-w-0 flex-1 xl:pl-72">{children}</main>
            </div>
        </div>
    )
}
