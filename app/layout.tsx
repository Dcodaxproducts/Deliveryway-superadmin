import type { Metadata } from "next";
import "./globals.css";
import { onest } from "@/lib/fonts";
import Provider from "@/components/providers/provider";
import AuthGuard from "@/components/auth-guard";
import TopLoader from "@/components/ui/toploader";

export const metadata: Metadata = {
  title: "DeliveryWay Super Admin",
  applicationName: "DeliveryWay Super Admin",
  icons: {
    icon: "/deliveryway-logo.jpg",
    shortcut: "/deliveryway-logo.jpg",
    apple: "/deliveryway-logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${onest.className} bg-[#F5F5F5]`}>
        <Provider>
          <AuthGuard>{children}</AuthGuard>
          <TopLoader />
        </Provider>
      </body>
    </html>
  );
}
