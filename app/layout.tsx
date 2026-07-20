import type { Metadata } from 'next'
import './globals.css'
import { onest } from '@/lib/fonts'
import Provider from '@/components/providers/provider'
import AuthGuard from '@/components/auth-guard'
import TopLoader from '@/components/ui/toploader'
import { baseURL } from "@/config/constants"
import ResponseError from '@/components/response-error'

export const metadata: Metadata = {
  title: 'DeliveryWay Super Admin',
  applicationName: 'DeliveryWay Super Admin',
  icons: {
    icon: '/deliveryway-logo.jpg',
    shortcut: '/deliveryway-logo.jpg',
    apple: '/deliveryway-logo.jpg',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let isServerConnected = false;
  let error: string | null = null;

  if (!baseURL) {
    error = "❌ No Base URL provided.";
  } else {
    try {
      const res = await fetch(baseURL, {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        if (res.status === 404) {
          error = "❌ Invalid server URL";
        } else {
          error = `❌ Server responded with status ${res.status}`;
        }
      } else {
        isServerConnected = true;
      }
    } catch (e) {
      error = "❌ Could not connect to server";
    }
  }
  return (
    <html lang="en">
      <body className={`${onest.className} bg-[#F5F5F5]`}>
        {error ? (
          <ResponseError className="h-screen" error={error} />
        ) : (
          <Provider>
            <AuthGuard>
              {children}
            </AuthGuard>
            <TopLoader />
          </Provider>
        )}
      </body>
    </html>
  )
}
