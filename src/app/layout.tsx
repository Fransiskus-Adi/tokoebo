import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "Toko Ebo Dashboard",
  description: "Toko Ebo management dashboard",
  applicationName: "Toko Ebo Dashboard",
  icons: {
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Toko Ebo Dashboard",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-zinc-100 p-4 md:p-6">
        <PwaRegister />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
