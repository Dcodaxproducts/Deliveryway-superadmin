import Navbar from '@/components/layout/navbar'
import Sidebar from '@/components/layout/sidebar'

export default function SiteLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <div>
            <Navbar />
            <div className="flex">
                <div className="hidden xl:block">
                    <Sidebar />
                </div>
                {children}
            </div>
        </div>
    )
}
